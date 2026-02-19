const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Security middleware
try {
  const helmet = require('helmet');
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for API
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
} catch (e) {
  console.warn('⚠️  helmet not installed - run npm install helmet');
}

// Rate limiting
try {
  const rateLimit = require('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per window
    message: { error: 'Trop de requêtes, veuillez réessayer plus tard' },
  });
  app.use('/api/', limiter);

  // Stricter limit for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Trop de tentatives de connexion, veuillez réessayer plus tard' },
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
} catch (e) {
  console.warn('⚠️  express-rate-limit not installed - run npm install express-rate-limit');
}

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Test de connexion à la base de données
prisma.$connect()
  .then(() => {
    console.log('✅ Base de données connectée avec succès');
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion à la base de données:', error);
  });

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/animals', require('./routes/animal.routes'));
app.use('/api/appointments', require('./routes/appointment.routes'));
app.use('/api/consultations', require('./routes/consultation.routes'));
app.use('/api/inventory', require('./routes/inventory.routes'));
app.use('/api/invoices', require('./routes/invoice.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/reminders', require('./routes/reminder.routes'));
app.use('/api/owners', require('./routes/owner.routes'));
app.use('/api/vaccinations', require('./routes/vaccination.routes'));
app.use('/api/certificates', require('./routes/certificate.routes'));
app.use('/api/prescriptions', require('./routes/prescription.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/clinic', require('./routes/clinic.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/share-links', require('./routes/shareLink.routes'));

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: '🐾 PawcketVet API',
    status: 'running',
    version: '1.0.0'
  });
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.path 
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({ 
    error: 'Erreur serveur',
    message: err.message 
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n🐾 ========================================');
  console.log('   PawcketVet API Server');
  console.log('========================================\n');
  console.log(`🚀 Serveur démarré avec succès!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n========================================\n');
});

// Fermeture propre
process.on('SIGINT', async () => {
  console.log('\n⏹️  Arrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;
