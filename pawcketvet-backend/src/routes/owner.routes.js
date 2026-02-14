const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const ownerController = require('../controllers/owner.controller');

router.get('/', authMiddleware, ownerController.getAll);
router.get('/me', authMiddleware, ownerController.getMyProfile);
router.get('/:id', authMiddleware, ownerController.getById);
router.post('/', authMiddleware, ownerController.create);
router.put('/:id', authMiddleware, ownerController.update);

module.exports = router;
