const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Recuperer tous les utilisateurs (staff)
exports.getAll = async (req, res) => {
  try {
    const { search, role } = req.query;
    const clinicId = req.user.clinicId;

    const where = {};
    if (clinicId) where.clinicId = clinicId;
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        clinicId: true,
        _count: {
          select: { appointments: true, consultations: true },
        },
      },
      orderBy: { lastName: 'asc' },
    });

    res.json({ users, count: users.length });
  } catch (error) {
    console.error('Erreur recuperation utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation des utilisateurs' });
  }
};

// Recuperer un utilisateur par ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        clinic: true,
        _count: {
          select: { appointments: true, consultations: true, certificates: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouve' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erreur recuperation utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation de l\'utilisateur' });
  }
};

// Creer un utilisateur (staff)
exports.create = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;
    const clinicId = req.user.clinicId;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Tous les champs obligatoires sont requis' });
    }

    // Verifier si l'email existe deja
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Cet email est deja utilise' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        phone,
        clinicId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({ message: 'Utilisateur cree avec succes', user });
  } catch (error) {
    console.error('Erreur creation utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la creation de l\'utilisateur' });
  }
};

// Mettre a jour un utilisateur
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, role, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { firstName, lastName, phone, role, isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
      },
    });

    res.json({ message: 'Utilisateur mis a jour', user });
  } catch (error) {
    console.error('Erreur mise a jour utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise a jour' });
  }
};

// Desactiver un utilisateur (soft delete)
exports.deactivate = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Utilisateur desactive' });
  } catch (error) {
    console.error('Erreur desactivation utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la desactivation' });
  }
};

// Reinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Mot de passe trop court (6 caracteres minimum)' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Mot de passe reinitialise' });
  } catch (error) {
    console.error('Erreur reinitialisation mot de passe:', error);
    res.status(500).json({ error: 'Erreur lors de la reinitialisation' });
  }
};
