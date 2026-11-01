const researchService = require('../services/researchService');
const articleService = require('../services/articleService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

exports.createSession = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return errorResponse(res, 'Title is required', 400);
    }
    const session = await researchService.createSession(title);
    return successResponse(res, {
      id: session._id,
      title: session.title,
      status: session.status
    }, 201);
  } catch (err) {
    next(err);
  }
};

exports.getAllSessions = async (req, res, next) => {
  try {
    const sessions = await researchService.getAllSessions();
    return successResponse(res, sessions);
  } catch (err) {
    next(err);
  }
};

exports.getSessionById = async (req, res, next) => {
  try {
    const session = await researchService.getSessionById(req.params.id);
    return successResponse(res, session);
  } catch (err) {
    next(err);
  }
};

exports.deleteSession = async (req, res, next) => {
  try {
    await researchService.deleteSession(req.params.id);
    return successResponse(res, { message: 'Research session deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.addSources = async (req, res, next) => {
  try {
    const { sources } = req.body;
    if (!sources || !Array.isArray(sources)) {
      return errorResponse(res, 'Sources must be an array of sources', 400);
    }
    const updated = await researchService.addSources(req.params.id, sources);
    return successResponse(res, updated);
  } catch (err) {
    next(err);
  }
};

exports.extractSingleSource = async (req, res, next) => {
  try {
    const { sourceId } = req.params;
    const source = await researchService.extractSingleSource(sourceId);
    return successResponse(res, source);
  } catch (err) {
    next(err);
  }
};

exports.updateManualSource = async (req, res, next) => {
  try {
    const { sourceId } = req.params;
    const { title, content, publisher } = req.body;
    const source = await researchService.updateSourceManualContent(sourceId, { title, content, publisher });
    return successResponse(res, source);
  } catch (err) {
    next(err);
  }
};

exports.analyzeSession = async (req, res, next) => {
  try {
    const session = await researchService.generateBrief(req.params.id);
    return successResponse(res, session);
  } catch (err) {
    next(err);
  }
};

exports.extractStandaloneUrl = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return errorResponse(res, 'URL is required', 400);
    }
    const extracted = await articleService.extractFromUrl(url);
    return successResponse(res, extracted);
  } catch (err) {
    return errorResponse(res, err.message, 422);
  }
};
