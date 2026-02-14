const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const shareLinkController = require('../controllers/shareLink.controller');

router.get('/', authMiddleware, shareLinkController.getAll);
router.post('/', authMiddleware, shareLinkController.create);
router.get('/public/:code', shareLinkController.access);
router.patch('/:id/deactivate', authMiddleware, shareLinkController.deactivate);
router.delete('/:id', authMiddleware, shareLinkController.delete);

module.exports = router;
