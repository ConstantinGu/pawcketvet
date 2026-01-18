const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// TODO: Implémenter les routes analytics
router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'Route analytics - À implémenter' });
});

module.exports = router;
