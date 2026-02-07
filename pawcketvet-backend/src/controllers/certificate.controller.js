const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Recuperer tous les certificats
exports.getAll = async (req, res) => {
  try {
    const { animalId, type } = req.query;
    const clinicId = req.user.clinicId;

    const where = {};
    if (animalId) where.animalId = animalId;
    if (type) where.type = type;
    if (clinicId) {
      where.animal = { clinicId };
    }

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        animal: {
          select: { id: true, name: true, species: true, breed: true, owner: { select: { firstName: true, lastName: true } } },
        },
        veterinarian: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    res.json({ certificates, count: certificates.length });
  } catch (error) {
    console.error('Erreur recuperation certificats:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation des certificats' });
  }
};

// Recuperer un certificat par ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        animal: {
          include: {
            owner: { select: { firstName: true, lastName: true, email: true, phone: true, address: true, city: true, postalCode: true } },
            vaccinations: { orderBy: { date: 'desc' } },
          },
        },
        veterinarian: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificat non trouve' });
    }

    res.json({ certificate });
  } catch (error) {
    console.error('Erreur recuperation certificat:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation du certificat' });
  }
};

// Creer un certificat
exports.create = async (req, res) => {
  try {
    const { animalId, type, expiryDate, content } = req.body;
    const veterinarianId = req.user.id;

    if (!animalId || !type) {
      return res.status(400).json({ error: 'Animal et type de certificat requis' });
    }

    // Recuperer les infos animal pour le contenu du certificat
    const animal = await prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        owner: true,
        vaccinations: { orderBy: { date: 'desc' } },
      },
    });

    if (!animal) {
      return res.status(404).json({ error: 'Animal non trouve' });
    }

    const vet = await prisma.user.findUnique({
      where: { id: veterinarianId },
      include: { clinic: true },
    });

    // Construire le contenu du certificat
    const certificateContent = content || {
      animal: {
        name: animal.name,
        species: animal.species,
        breed: animal.breed,
        birthDate: animal.birthDate,
        gender: animal.gender,
        microchip: animal.microchip,
        color: animal.color,
      },
      owner: {
        firstName: animal.owner.firstName,
        lastName: animal.owner.lastName,
        address: animal.owner.address,
        city: animal.owner.city,
        postalCode: animal.owner.postalCode,
        phone: animal.owner.phone,
      },
      veterinarian: {
        firstName: vet.firstName,
        lastName: vet.lastName,
        clinic: vet.clinic?.name,
      },
      type,
      issueDate: new Date().toISOString(),
      vaccinations: type === 'VACCINATION' ? animal.vaccinations : undefined,
    };

    const certificate = await prisma.certificate.create({
      data: {
        type,
        content: certificateContent,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        animalId,
        veterinarianId,
      },
      include: {
        animal: { select: { name: true, species: true } },
        veterinarian: { select: { firstName: true, lastName: true } },
      },
    });

    res.status(201).json({
      message: 'Certificat cree avec succes',
      certificate,
    });
  } catch (error) {
    console.error('Erreur creation certificat:', error);
    res.status(500).json({ error: 'Erreur lors de la creation du certificat' });
  }
};

// Supprimer un certificat
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.certificate.delete({ where: { id } });

    res.json({ message: 'Certificat supprime' });
  } catch (error) {
    console.error('Erreur suppression certificat:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du certificat' });
  }
};
