const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const messageController = require('../controllers/message.controller');

router.get('/', authMiddleware, messageController.getAll);
router.get('/conversations', authMiddleware, messageController.getConversations);
router.get('/:id', authMiddleware, messageController.getById);
router.post('/', authMiddleware, messageController.send);
router.patch('/:id/read', authMiddleware, messageController.markAsRead);

module.exports = router;
