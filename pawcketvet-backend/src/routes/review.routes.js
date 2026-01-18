const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// TODO: Implémenter les routes review
router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'Route review - À implémenter' });
});

module.exports = router;
