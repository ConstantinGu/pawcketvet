const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const clinicController = require('../controllers/clinic.controller');

router.get('/me', authMiddleware, clinicController.getMyClinic);
router.put('/me', authMiddleware, clinicController.update);
router.get('/stats', authMiddleware, clinicController.getStats);

module.exports = router;
