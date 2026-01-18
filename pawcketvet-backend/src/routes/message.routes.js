const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// TODO: Implémenter les routes message
router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'Route message - À implémenter' });
});

module.exports = router;
