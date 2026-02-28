const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { isOwnerOfAnimal, ownerFilter } = require('../middleware/ownership');

// Récupérer tous les animaux
exports.getAll = async (req, res) => {
  try {
    const { search, species, clinicId } = req.query;
    const userClinicId = req.user.clinicId;

    // Construire les filtres
    const where = {
      clinicId: clinicId || userClinicId,
      isActive: true,
      ...ownerFilter(req),
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { breed: { contains: search, mode: 'insensitive' } },
        { owner: { firstName: { contains: search, mode: 'insensitive' } } },
        { owner: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (species) {
      where.species = species;
    }

    const animals = await prisma.animal.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        vaccinations: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ animals, count: animals.length });
  } catch (error) {
    console.error('Erreur récupération animaux:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des animaux' });
  }
};

// Récupérer un animal par ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const animal = await prisma.animal.findUnique({
      where: { id },
      include: {
        owner: true,
        vaccinations: { orderBy: { date: 'desc' } },
        consultations: { 
          orderBy: { date: 'desc' },
          include: { veterinarian: true },
        },
        prescriptions: {
          include: { medication: true },
        },
        certificates: { orderBy: { issueDate: 'desc' } },
        weightHistory: { orderBy: { date: 'desc' } },
      },
    });

    if (!animal) {
      return res.status(404).json({ error: 'Animal non trouvé' });
    }

    // Vérifier ownership
    if (req.user.role === 'OWNER' && animal.ownerId !== req.user.ownerId) {
      return res.status(403).json({ error: 'Accès non autorisé à cet animal' });
    }

    res.json({ animal });
  } catch (error) {
    console.error('Erreur récupération animal:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'animal' });
  }
};

// Créer un animal
exports.create = async (req, res) => {
  try {
    const {
      name,
      species,
      breed,
      birthDate,
      gender,
      color,
      weight,
      microchip,
      allergies,
      chronicConditions,
      notes,
      ownerId,
      ownerData, // Si nouveau propriétaire
    } = req.body;

    const userClinicId = req.user.clinicId;
    const userId = req.user.id;

    // Valider les données
    if (!name || !species) {
      return res.status(400).json({ error: 'Nom et espèce requis' });
    }

    let finalOwnerId = ownerId;

    // Si données propriétaire fournies, créer ou récupérer le propriétaire
    if (ownerData && !ownerId) {
      const { email, firstName, lastName, phone, address, city, postalCode } = ownerData;

      // Vérifier si le propriétaire existe déjà
      let owner = await prisma.owner.findUnique({
        where: { email },
      });

      if (!owner) {
        // Créer le propriétaire avec un mot de passe temporaire
        const bcrypt = require('bcryptjs');
        const tempPassword = await bcrypt.hash('TempPassword123!', 10);

        owner = await prisma.owner.create({
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

        // Créer aussi un User avec role OWNER pour permettre la connexion
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email,
              password: tempPassword,
              firstName,
              lastName,
              role: 'OWNER',
              phone,
            },
          });
        }
      }

      finalOwnerId = owner.id;
    }

    if (!finalOwnerId) {
      return res.status(400).json({ error: 'Propriétaire requis' });
    }

    // Créer l'animal
    const animal = await prisma.animal.create({
      data: {
        name,
        species,
        breed,
        birthDate: birthDate ? new Date(birthDate) : null,
        gender,
        color,
        weight: weight ? parseFloat(weight) : null,
        microchip,
        allergies,
        chronicConditions,
        notes,
        ownerId: finalOwnerId,
        clinicId: userClinicId,
        createdById: userId,
        qrCode: `QR_${Date.now()}`, // Générer un QR code unique
      },
      include: {
        owner: true,
      },
    });

    res.status(201).json({ 
      message: 'Animal créé avec succès',
      animal 
    });
  } catch (error) {
    console.error('Erreur création animal:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'animal' });
  }
};

// Mettre à jour un animal
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier ownership
    if (!(await isOwnerOfAnimal(req, id))) {
      return res.status(403).json({ error: 'Accès non autorisé à cet animal' });
    }

    const {
      name,
      species,
      breed,
      birthDate,
      gender,
      color,
      weight,
      microchip,
      allergies,
      chronicConditions,
      notes,
    } = req.body;

    const animal = await prisma.animal.update({
      where: { id },
      data: {
        name,
        species,
        breed,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        gender,
        color,
        weight: weight ? parseFloat(weight) : undefined,
        microchip,
        allergies,
        chronicConditions,
        notes,
      },
      include: {
        owner: true,
      },
    });

    res.json({ 
      message: 'Animal mis à jour avec succès',
      animal 
    });
  } catch (error) {
    console.error('Erreur mise à jour animal:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'animal' });
  }
};

// Supprimer un animal (soft delete)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier ownership
    if (!(await isOwnerOfAnimal(req, id))) {
      return res.status(403).json({ error: 'Accès non autorisé à cet animal' });
    }

    await prisma.animal.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Animal supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression animal:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'animal' });
  }
};

// Ajouter un poids à l'historique
exports.addWeight = async (req, res) => {
  try {
    const { id } = req.params;
    const { weight, notes } = req.body;

    // Vérifier ownership
    if (!(await isOwnerOfAnimal(req, id))) {
      return res.status(403).json({ error: 'Accès non autorisé à cet animal' });
    }

    const weightEntry = await prisma.weightHistory.create({
      data: {
        animalId: id,
        weight: parseFloat(weight),
        notes,
      },
    });

    // Mettre à jour le poids actuel de l'animal
    await prisma.animal.update({
      where: { id },
      data: { weight: parseFloat(weight) },
    });

    res.status(201).json({ 
      message: 'Poids ajouté avec succès',
      weightEntry 
    });
  } catch (error) {
    console.error('Erreur ajout poids:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du poids' });
  }
};
