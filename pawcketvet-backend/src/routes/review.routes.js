const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const reviewController = require('../controllers/review.controller');

router.get('/', authMiddleware, reviewController.getAll);
router.get('/:id', authMiddleware, reviewController.getById);
router.post('/', authMiddleware, reviewController.create);
router.patch('/:id/respond', authMiddleware, reviewController.respond);
router.patch('/:id/publish', authMiddleware, reviewController.togglePublish);
router.delete('/:id', authMiddleware, reviewController.delete);

module.exports = router;
