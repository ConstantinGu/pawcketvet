const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const certificateController = require('../controllers/certificate.controller');

router.get('/', authMiddleware, certificateController.getAll);
router.get('/:id', authMiddleware, certificateController.getById);
router.post('/', authMiddleware, certificateController.create);
router.delete('/:id', authMiddleware, certificateController.delete);

module.exports = router;
