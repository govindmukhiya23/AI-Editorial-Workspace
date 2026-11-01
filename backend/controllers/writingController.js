const writingService = require('../services/writingService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

exports.analyzeDraft = async (req, res, next) => {
  try {
    const { text, title, researchSessionId, draftId } = req.body;
    if (!text || !text.trim()) {
      return errorResponse(res, 'Text is required for writing analysis', 400);
    }
    const draft = await writingService.analyzeDraft({ text, title, researchSessionId, draftId });
    return successResponse(res, draft);
  } catch (err) {
    next(err);
  }
};

exports.getAllDrafts = async (req, res, next) => {
  try {
    const drafts = await writingService.getAllDrafts();
    return successResponse(res, drafts);
  } catch (err) {
    next(err);
  }
};

exports.getDraftById = async (req, res, next) => {
  try {
    const draft = await writingService.getDraftById(req.params.id);
    return successResponse(res, draft);
  } catch (err) {
    next(err);
  }
};

exports.updateDraft = async (req, res, next) => {
  try {
    const { revisedText, title } = req.body;
    const draft = await writingService.updateDraft(req.params.id, { revisedText, title });
    return successResponse(res, draft);
  } catch (err) {
    next(err);
  }
};

exports.updateSuggestion = async (req, res, next) => {
  try {
    const { id, suggestionId } = req.params;
    const { status } = req.body;
    if (!status) {
      return errorResponse(res, 'Status ("accepted" | "rejected" | "pending") is required', 400);
    }
    const draft = await writingService.updateSuggestion(id, suggestionId, status);
    return successResponse(res, draft);
  } catch (err) {
    next(err);
  }
};

exports.getComparison = async (req, res, next) => {
  try {
    const comparison = await writingService.getComparison(req.params.id);
    return successResponse(res, comparison);
  } catch (err) {
    next(err);
  }
};

exports.deleteDraft = async (req, res, next) => {
  try {
    await writingService.deleteDraft(req.params.id);
    return successResponse(res, { message: 'Draft deleted successfully' });
  } catch (err) {
    next(err);
  }
};

