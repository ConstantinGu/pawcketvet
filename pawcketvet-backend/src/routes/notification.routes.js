const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const notificationController = require('../controllers/notification.controller');

router.get('/', authMiddleware, notificationController.getAll);
router.post('/', authMiddleware, notificationController.create);
router.patch('/read-all', authMiddleware, notificationController.markAllAsRead);
router.delete('/clear-read', authMiddleware, notificationController.clearRead);
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);
router.delete('/:id', authMiddleware, notificationController.delete);

module.exports = router;
