const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// TODO: Implémenter les routes shareLink
router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'Route shareLink - À implémenter' });
});

module.exports = router;
