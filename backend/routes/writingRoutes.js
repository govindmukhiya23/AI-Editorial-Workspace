const express = require('express');
const router = express.Router();
const writingController = require('../controllers/writingController');
const { validateObjectId } = require('../middleware/validateRequest');

router.post('/analyze', writingController.analyzeDraft);
router.get('/', writingController.getAllDrafts);
router.get('/:id', validateObjectId('id'), writingController.getDraftById);
router.put('/:id', validateObjectId('id'), writingController.updateDraft);
router.patch('/:id/suggestions/:suggestionId', validateObjectId('id'), writingController.updateSuggestion);
router.get('/:id/compare', validateObjectId('id'), writingController.getComparison);
router.delete('/:id', validateObjectId('id'), writingController.deleteDraft);

module.exports = router;
