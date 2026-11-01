const ResearchSession = require('../models/ResearchSession');
const Source = require('../models/Source');
const articleService = require('./articleService');
const aiService = require('./aiService');

class ResearchService {
  async createSession(title) {
    if (!title || !title.trim()) {
      throw new Error('Research session title is required.');
    }
    const session = await ResearchSession.create({
      title: title.trim(),
      status: 'created'
    });
    return session;
  }

  async getAllSessions() {
    return await ResearchSession.find()
      .populate('sources')
      .sort({ createdAt: -1 });
  }

  async getSessionById(id) {
    const session = await ResearchSession.findById(id).populate('sources');
    if (!session) {
      throw new Error(`Research session not found for id: ${id}`);
    }
    return session;
  }

  async deleteSession(id) {
    await Source.deleteMany({ researchSessionId: id });
    return await ResearchSession.findByIdAndDelete(id);
  }

  async addSources(sessionId, sourcesData) {
    const session = await ResearchSession.findById(sessionId);
    if (!session) {
      throw new Error(`Research session not found for id: ${sessionId}`);
    }

    if (!Array.isArray(sourcesData) || sourcesData.length === 0) {
      throw new Error('Sources must be an array of at least one source.');
    }

    const createdSources = [];

    for (const item of sourcesData) {
      // Check for duplicate URL in this session
      if (item.url && item.url.trim()) {
        const trimmedUrl = item.url.trim();
        const existing = await Source.findOne({
          researchSessionId: sessionId,
          url: trimmedUrl
        });
        if (existing) {
          createdSources.push(existing);
          continue;
        }

        // Manual content provided alongside or instead of URL
        if (item.manualContent && item.manualContent.trim()) {
          const src = await Source.create({
            researchSessionId: sessionId,
            url: trimmedUrl,
            title: item.title?.trim() || 'Manual Input Source',
            publisher: item.publisher?.trim() || 'User Provided',
            extractedContent: item.manualContent.trim(),
            extractionStatus: 'manual_input'
          });
          createdSources.push(src);
        } else {
          // Standard URL source to extract
          const src = await Source.create({
            researchSessionId: sessionId,
            url: trimmedUrl,
            title: item.title?.trim() || 'Pending Extraction',
            extractionStatus: 'pending'
          });
          createdSources.push(src);
        }
      } else if (item.manualContent && item.manualContent.trim()) {
        // Pure text pasted without URL
        const src = await Source.create({
          researchSessionId: sessionId,
          url: `manual://${Date.now()}-${Math.random().toString(36).substring(7)}`,
          title: item.title?.trim() || 'Pasted Content Source',
          publisher: 'Manual Entry',
          extractedContent: item.manualContent.trim(),
          extractionStatus: 'manual_input'
        });
        createdSources.push(src);
      }
    }

    // Add new source IDs to session without duplicates
    const sourceIds = createdSources.map(s => s._id);
    await ResearchSession.findByIdAndUpdate(sessionId, {
      $addToSet: { sources: { $each: sourceIds } }
    });

    return await this.getSessionById(sessionId);
  }

  async extractSingleSource(sourceId) {
    const source = await Source.findById(sourceId);
    if (!source) {
      throw new Error('Source not found.');
    }

    if (source.extractionStatus === 'completed' || source.extractionStatus === 'manual_input') {
      return source;
    }

    source.extractionStatus = 'processing';
    await source.save();

    try {
      const extracted = await articleService.extractFromUrl(source.url);
      source.title = extracted.title;
      source.publisher = extracted.publisher;
      source.extractedContent = extracted.extractedContent;
      source.contentHash = extracted.contentHash;
      source.extractionStatus = 'completed';
      source.errorMessage = null;
      await source.save();
      return source;
    } catch (err) {
      source.extractionStatus = 'failed';
      source.errorMessage = err.message;
      await source.save();
      return source;
    }
  }

  async updateSourceManualContent(sourceId, { title, content, publisher }) {
    const source = await Source.findById(sourceId);
    if (!source) {
      throw new Error('Source not found.');
    }

    if (!content || !content.trim()) {
      throw new Error('Content cannot be empty.');
    }

    source.title = title?.trim() || source.title || 'Manual Source';
    source.publisher = publisher?.trim() || source.publisher || 'User Provided';
    source.extractedContent = content.trim();
    source.extractionStatus = 'manual_input';
    source.errorMessage = null;
    await source.save();
    return source;
  }

  async generateBrief(sessionId) {
    const session = await ResearchSession.findById(sessionId).populate('sources');
    if (!session) {
      throw new Error(`Research session not found for id: ${sessionId}`);
    }

    if (!session.sources || session.sources.length < 3) {
      throw new Error('A minimum of three sources must be submitted before generating a research brief.');
    }

    // Attempt extraction on any pending or retry-eligible sources
    for (const src of session.sources) {
      if (src.extractionStatus === 'pending') {
        try {
          const extracted = await articleService.extractFromUrl(src.url);
          src.title = extracted.title;
          src.publisher = extracted.publisher;
          src.extractedContent = extracted.extractedContent;
          src.contentHash = extracted.contentHash;
          src.extractionStatus = 'completed';
          src.errorMessage = null;
          await src.save();
        } catch (err) {
          src.extractionStatus = 'failed';
          src.errorMessage = err.message;
          await src.save();
        }
      }
    }

    // Refresh sources
    const updatedSources = await Source.find({ researchSessionId: sessionId });
    const successfulSources = updatedSources.filter(
      s => s.extractionStatus === 'completed' || s.extractionStatus === 'manual_input'
    );

    if (successfulSources.length < 3) {
      throw new Error(
        `At least 3 sources must be successfully processed to generate research brief. Currently ${successfulSources.length} succeeded and ${updatedSources.length - successfulSources.length} failed. Please provide manual content for failed sources or retry.`
      );
    }

    // Update status to processing
    session.status = 'processing';
    await session.save();

    try {
      const briefData = await aiService.generateResearchBrief(session.title, successfulSources);

      session.researchBrief = briefData;
      session.status = 'completed';
      session.errorMessage = null;
      await session.save();

      return await this.getSessionById(sessionId);
    } catch (err) {
      session.status = 'failed';
      session.errorMessage = err.message;
      await session.save();
      throw err;
    }
  }
}

module.exports = new ResearchService();

