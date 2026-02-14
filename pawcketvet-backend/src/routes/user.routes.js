const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

router.get('/', authMiddleware, userController.getAll);
router.get('/:id', authMiddleware, userController.getById);
router.post('/', authMiddleware, userController.create);
router.put('/:id', authMiddleware, userController.update);
router.patch('/:id/deactivate', authMiddleware, userController.deactivate);
router.patch('/:id/reset-password', authMiddleware, userController.resetPassword);

module.exports = router;
