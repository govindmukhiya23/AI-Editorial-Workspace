const WritingDraft = require('../models/WritingDraft');
const aiService = require('./aiService');
const { calculateMetrics } = require('../utils/textMetrics');

class WritingService {
  async analyzeDraft({ text, title, researchSessionId, draftId }) {
    if (!text || !text.trim()) {
      throw new Error('Draft text cannot be empty.');
    }

    const trimmedText = text.trim();
    const metrics = calculateMetrics(trimmedText);
    const rawSuggestions = await aiService.analyzeWriting(trimmedText);

    const formattedSuggestions = rawSuggestions.map(s => ({
      issueType: s.issueType,
      originalText: s.originalText,
      explanation: s.explanation,
      suggestedText: s.suggestedText,
      status: 'pending'
    }));

    let draft;
    if (draftId) {
      draft = await WritingDraft.findById(draftId);
      if (draft) {
        draft.originalText = trimmedText;
        draft.revisedText = trimmedText;
        draft.suggestions = formattedSuggestions;
        draft.metrics = metrics;
        if (title) draft.title = title.trim();
        await draft.save();
        return draft;
      }
    }

    draft = await WritingDraft.create({
      title: title?.trim() || 'Newsletter Draft',
      researchSessionId: researchSessionId || null,
      originalText: trimmedText,
      revisedText: trimmedText,
      suggestions: formattedSuggestions,
      metrics
    });

    return draft;
  }

  async getAllDrafts() {
    return await WritingDraft.find().sort({ updatedAt: -1 });
  }

  async getDraftById(id) {
    const draft = await WritingDraft.findById(id);
    if (!draft) {
      throw new Error(`Draft not found for id: ${id}`);
    }
    return draft;
  }

  async updateDraft(id, { revisedText, title }) {
    const draft = await WritingDraft.findById(id);
    if (!draft) {
      throw new Error(`Draft not found for id: ${id}`);
    }

    if (typeof revisedText === 'string') {
      draft.revisedText = revisedText;
      draft.metrics = calculateMetrics(revisedText);
    }

    if (title && title.trim()) {
      draft.title = title.trim();
    }

    await draft.save();
    return draft;
  }

  async updateSuggestion(draftId, suggestionId, status) {
    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      throw new Error('Status must be "accepted", "rejected", or "pending".');
    }

    const draft = await WritingDraft.findById(draftId);
    if (!draft) {
      throw new Error(`Draft not found for id: ${draftId}`);
    }

    const suggestion = draft.suggestions.id(suggestionId);
    if (!suggestion) {
      throw new Error(`Suggestion not found for id: ${suggestionId}`);
    }

    const previousStatus = suggestion.status;
    suggestion.status = status;

    // If accepted now and wasn't accepted before: apply rewrite to revisedText
    if (status === 'accepted' && previousStatus !== 'accepted') {
      const target = suggestion.originalText;
      const replacement = suggestion.suggestedText;

      if (draft.revisedText.includes(target)) {
        draft.revisedText = draft.revisedText.replace(target, replacement);
        draft.metrics = calculateMetrics(draft.revisedText);
      } else {
        console.warn(`[WritingService] Target text not found in revised draft: "${target.slice(0, 30)}..."`);
      }
    }

    // If undone / reverted back to pending/rejected from accepted
    if (previousStatus === 'accepted' && status !== 'accepted') {
      // If the replacement exists in revisedText, revert it back to originalText
      const replacement = suggestion.suggestedText;
      const target = suggestion.originalText;
      if (draft.revisedText.includes(replacement)) {
        draft.revisedText = draft.revisedText.replace(replacement, target);
        draft.metrics = calculateMetrics(draft.revisedText);
      }
    }

    await draft.save();
    return draft;
  }

  async getComparison(draftId) {
    const draft = await WritingDraft.findById(draftId);
    if (!draft) {
      throw new Error(`Draft not found for id: ${draftId}`);
    }

    return {
      id: draft._id,
      title: draft.title,
      originalText: draft.originalText,
      revisedText: draft.revisedText,
      suggestions: draft.suggestions,
      metrics: draft.metrics
    };
  }

  async deleteDraft(id) {
    return await WritingDraft.findByIdAndDelete(id);
  }
}

module.exports = new WritingService();
