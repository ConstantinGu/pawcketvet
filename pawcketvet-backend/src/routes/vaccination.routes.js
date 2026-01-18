const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// TODO: Implémenter les routes vaccination
router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'Route vaccination - À implémenter' });
});

module.exports = router;
