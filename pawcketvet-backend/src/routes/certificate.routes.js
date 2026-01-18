const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// TODO: Implémenter les routes certificate
router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'Route certificate - À implémenter' });
});

module.exports = router;
