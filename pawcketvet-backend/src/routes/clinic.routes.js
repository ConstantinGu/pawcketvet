const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// TODO: Implémenter les routes clinic
router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'Route clinic - À implémenter' });
});

module.exports = router;
