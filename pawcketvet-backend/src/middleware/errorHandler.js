/**
 * Middleware de gestion globale des erreurs
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur:', err);

  // Erreur Prisma
  if (err.code?.startsWith('P')) {
    return res.status(400).json({
      error: 'Erreur de base de données',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Données invalides',
      details: err.errors
    });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
