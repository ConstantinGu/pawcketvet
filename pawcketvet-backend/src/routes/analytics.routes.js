const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const analyticsController = require('../controllers/analytics.controller');

router.get('/dashboard', authMiddleware, analyticsController.getDashboardStats);
router.get('/today', authMiddleware, analyticsController.getTodayAppointments);
router.get('/activity', authMiddleware, analyticsController.getRecentActivity);
router.get('/revenue', authMiddleware, analyticsController.getMonthlyRevenue);

module.exports = router;
