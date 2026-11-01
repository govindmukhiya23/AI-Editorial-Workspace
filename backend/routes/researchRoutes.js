const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');
const { validateObjectId } = require('../middleware/validateRequest');

router.post('/', researchController.createSession);
router.get('/', researchController.getAllSessions);
router.get('/:id', validateObjectId('id'), researchController.getSessionById);
router.delete('/:id', validateObjectId('id'), researchController.deleteSession);
router.post('/:id/sources', validateObjectId('id'), researchController.addSources);
router.post('/:id/analyze', validateObjectId('id'), researchController.analyzeSession);
router.post('/extract', researchController.extractStandaloneUrl);
router.post('/sources/:sourceId/extract', validateObjectId('sourceId'), researchController.extractSingleSource);
router.put('/sources/:sourceId/manual', validateObjectId('sourceId'), researchController.updateManualSource);

module.exports = router;

