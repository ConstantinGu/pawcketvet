const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// TODO: Implémenter les routes prescription
router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'Route prescription - À implémenter' });
});

module.exports = router;
