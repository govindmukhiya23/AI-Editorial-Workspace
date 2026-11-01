const Newsletter = require('../models/Newsletter');
const ResearchSession = require('../models/ResearchSession');
const Source = require('../models/Source');
const aiService = require('../services/aiService');
const { countWords } = require('../utils/textMetrics');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

exports.generateNewsletter = async (req, res, next) => {
  try {
    const { researchSessionId, selectedAngle } = req.body;
    if (!researchSessionId) {
      return errorResponse(res, 'researchSessionId is required', 400);
    }

    const session = await ResearchSession.findById(researchSessionId).populate('sources');
    if (!session) {
      return errorResponse(res, 'Research session not found', 404);
    }

    if (!session.researchBrief) {
      return errorResponse(res, 'Research session must have a completed research brief first', 400);
    }

    // Filter successfully processed sources
    const validSources = session.sources.filter(
      s => s.extractionStatus === 'completed' || s.extractionStatus === 'manual_input'
    );

    const generated = await aiService.generateNewsletter(
      session.title,
      session.researchBrief,
      selectedAngle || session.researchBrief.newsletterAngles?.[0]?.headline || session.title,
      validSources
    );

    const wordCount = countWords(generated.body);

    const newsletter = await Newsletter.create({
      researchSessionId: session._id,
      title: session.title,
      headline: generated.headline,
      body: generated.body,
      selectedAngle: selectedAngle || '',
      sources: validSources.map(s => s._id),
      originalDraft: generated.body,
      revisedDraft: generated.body,
      wordCount,
      status: 'draft'
    });

    return successResponse(res, newsletter, 201);
  } catch (err) {
    next(err);
  }
};

exports.getAllNewsletters = async (req, res, next) => {
  try {
    const newsletters = await Newsletter.find()
      .populate('researchSessionId')
      .populate('sources')
      .sort({ createdAt: -1 });
    return successResponse(res, newsletters);
  } catch (err) {
    next(err);
  }
};

exports.getNewsletterById = async (req, res, next) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id)
      .populate('researchSessionId')
      .populate('sources')
      .populate('writingDraftId');
    if (!newsletter) {
      return errorResponse(res, 'Newsletter not found', 404);
    }
    return successResponse(res, newsletter);
  } catch (err) {
    next(err);
  }
};

exports.updateNewsletter = async (req, res, next) => {
  try {
    const { headline, body, status } = req.body;
    const newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter) {
      return errorResponse(res, 'Newsletter not found', 404);
    }

    if (headline) newsletter.headline = headline.trim();
    if (typeof body === 'string') {
      newsletter.body = body;
      newsletter.wordCount = countWords(body);
      newsletter.revisedDraft = body;
    }
    if (status && ['draft', 'under_review', 'finalized'].includes(status)) {
      newsletter.status = status;
    }

    await newsletter.save();
    return successResponse(res, newsletter);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !['draft', 'under_review', 'finalized'].includes(status)) {
      return errorResponse(res, 'Valid status is required ("draft" | "under_review" | "finalized")', 400);
    }
    const newsletter = await Newsletter.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!newsletter) {
      return errorResponse(res, 'Newsletter not found', 404);
    }
    return successResponse(res, newsletter);
  } catch (err) {
    next(err);
  }
};

exports.deleteNewsletter = async (req, res, next) => {
  try {
    await Newsletter.findByIdAndDelete(req.params.id);
    return successResponse(res, { message: 'Newsletter deleted successfully' });
  } catch (err) {
    next(err);
  }
};
