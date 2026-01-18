const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultation.controller');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', consultationController.getAll);
router.get('/:id', consultationController.getById);
router.post('/', consultationController.create);
router.put('/:id', consultationController.update);

module.exports = router;
