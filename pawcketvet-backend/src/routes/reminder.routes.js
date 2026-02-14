const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const reminderController = require('../controllers/reminder.controller');

router.get('/', authMiddleware, reminderController.getAll);
router.get('/my', authMiddleware, reminderController.getByOwner);
router.post('/', authMiddleware, reminderController.create);
router.put('/:id', authMiddleware, reminderController.update);
router.delete('/:id', authMiddleware, reminderController.delete);
router.patch('/:id/sent', authMiddleware, reminderController.markSent);

module.exports = router;
