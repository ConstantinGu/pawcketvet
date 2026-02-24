const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET must be set in production');
  }
  console.warn('⚠️  Using default JWT_SECRET - set JWT_SECRET env var for production');
  return 'dev-secret-key-do-not-use-in-production';
})();

const authMiddleware = (req, res, next) => {
  try {
    // Récupérer le token du header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Token non fourni' });
    }

    // Format: "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token invalide' });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Ajouter les infos user à la requête
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      clinicId: decoded.clinicId,
      ownerId: decoded.ownerId,
    };

    next();
  } catch (error) {
    console.error('Erreur auth middleware:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }
    
    return res.status(401).json({ error: 'Token invalide' });
  }
};

module.exports = {
  authMiddleware,
};
