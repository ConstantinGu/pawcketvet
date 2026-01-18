const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// TODO: Implémenter les routes notification
router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'Route notification - À implémenter' });
});

module.exports = router;
