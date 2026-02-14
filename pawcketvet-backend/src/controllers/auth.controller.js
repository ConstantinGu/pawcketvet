const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Tentative de connexion:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email et mot de passe requis'
      });
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        clinic: true,
      },
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé:', email);
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Mot de passe incorrect pour:', email);
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Si OWNER, chercher le Owner associé par email
    let ownerId = null;
    if (user.role === 'OWNER') {
      const owner = await prisma.owner.findUnique({
        where: { email: user.email },
      });
      if (owner) {
        ownerId = owner.id;
      }
    }

    // Générer le token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
        ownerId: ownerId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Connexion réussie:', email, '- Role:', user.role);

    // Retourner les infos utilisateur
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        clinicId: user.clinicId,
        ownerId: ownerId,
        clinic: user.clinic,
      },
    });
  } catch (error) {
    console.error('❌ Erreur login:', error);
    res.status(500).json({
      error: 'Erreur lors de la connexion',
      details: error.message
    });
  }
};

// Register
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, clinicId } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Tous les champs sont requis' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Cet email est déjà utilisé' 
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'VETERINARIAN',
        clinicId,
      },
      include: {
        clinic: true,
      },
    });

    // Générer le token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        clinicId: user.clinicId,
        clinic: user.clinic,
      },
    });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'inscription',
      details: error.message 
    });
  }
};

// Get current user
const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        clinic: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Si OWNER, chercher le Owner associé
    let ownerId = null;
    if (user.role === 'OWNER') {
      const owner = await prisma.owner.findUnique({
        where: { email: user.email },
      });
      if (owner) {
        ownerId = owner.id;
      }
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        clinicId: user.clinicId,
        ownerId: ownerId,
        clinic: user.clinic,
      },
    });
  } catch (error) {
    console.error('Erreur me:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du profil'
    });
  }
};

// Logout
const logout = async (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
};

module.exports = {
  login,
  register,
  me,
  logout,
};
