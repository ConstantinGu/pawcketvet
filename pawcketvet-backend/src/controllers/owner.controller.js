const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer tous les propriétaires
exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const owners = await prisma.owner.findMany({
      where,
      include: {
        animals: {
          where: { isActive: true },
          select: { id: true, name: true, species: true, breed: true },
        },
        _count: {
          select: { animals: true, invoices: true },
        },
      },
      orderBy: { lastName: 'asc' },
    });

    res.json({ owners, count: owners.length });
  } catch (error) {
    console.error('Erreur récupération propriétaires:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des propriétaires' });
  }
};

// Récupérer un propriétaire par ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const owner = await prisma.owner.findUnique({
      where: { id },
      include: {
        animals: {
          where: { isActive: true },
          include: {
            vaccinations: { orderBy: { date: 'desc' }, take: 1 },
            appointments: { orderBy: { date: 'desc' }, take: 1 },
          },
        },
        invoices: { orderBy: { date: 'desc' }, take: 5 },
        messages: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!owner) {
      return res.status(404).json({ error: 'Propriétaire non trouvé' });
    }

    res.json({ owner });
  } catch (error) {
    console.error('Erreur récupération propriétaire:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du propriétaire' });
  }
};

// Récupérer le profil du propriétaire connecté (via email match)
exports.getMyProfile = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;

    if (!ownerId) {
      return res.status(404).json({ error: 'Profil propriétaire non trouvé' });
    }

    const owner = await prisma.owner.findUnique({
      where: { id: ownerId },
      include: {
        animals: {
          where: { isActive: true },
          include: {
            vaccinations: { orderBy: { date: 'desc' } },
            appointments: {
              orderBy: { date: 'desc' },
              take: 5,
              include: {
                veterinarian: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
            consultations: {
              orderBy: { date: 'desc' },
              take: 3,
              include: {
                veterinarian: {
                  select: { firstName: true, lastName: true },
                },
              },
            },
            weightHistory: { orderBy: { date: 'desc' }, take: 10 },
            certificates: { orderBy: { issueDate: 'desc' } },
          },
        },
        invoices: { orderBy: { date: 'desc' } },
      },
    });

    if (!owner) {
      return res.status(404).json({ error: 'Propriétaire non trouvé' });
    }

    res.json({ owner });
  } catch (error) {
    console.error('Erreur récupération profil propriétaire:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
};

// Mettre à jour un propriétaire
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, address, city, postalCode } = req.body;

    const owner = await prisma.owner.update({
      where: { id },
      data: { firstName, lastName, phone, address, city, postalCode },
    });

    res.json({ message: 'Propriétaire mis à jour', owner });
  } catch (error) {
    console.error('Erreur mise à jour propriétaire:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du propriétaire' });
  }
};

// Créer un propriétaire
exports.create = async (req, res) => {
  try {
    const { email, firstName, lastName, phone, address, city, postalCode } = req.body;

    if (!email || !firstName || !lastName || !phone) {
      return res.status(400).json({ error: 'Email, nom, prénom et téléphone requis' });
    }

    const existing = await prisma.owner.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const bcrypt = require('bcryptjs');
    const tempPassword = await bcrypt.hash('TempPassword123!', 10);

    const owner = await prisma.owner.create({
      data: {
        email,
        password: tempPassword,
        firstName,
        lastName,
        phone,
        address,
        city,
        postalCode,
      },
    });

    res.status(201).json({ message: 'Propriétaire créé avec succès', owner });
  } catch (error) {
    console.error('Erreur création propriétaire:', error);
    res.status(500).json({ error: 'Erreur lors de la création du propriétaire' });
  }
};
