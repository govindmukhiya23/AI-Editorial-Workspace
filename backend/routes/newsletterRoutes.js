const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { validateObjectId } = require('../middleware/validateRequest');

router.post('/generate', newsletterController.generateNewsletter);
router.get('/', newsletterController.getAllNewsletters);
router.get('/:id', validateObjectId('id'), newsletterController.getNewsletterById);
router.put('/:id', validateObjectId('id'), newsletterController.updateNewsletter);
router.patch('/:id/status', validateObjectId('id'), newsletterController.updateStatus);
router.delete('/:id', validateObjectId('id'), newsletterController.deleteNewsletter);

module.exports = router;
