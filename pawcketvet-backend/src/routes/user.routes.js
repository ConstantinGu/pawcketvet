const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// TODO: Implémenter les routes user
router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'Route user - À implémenter' });
});

module.exports = router;
