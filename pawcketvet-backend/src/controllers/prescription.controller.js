const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { isOwnerOfAnimal, ownerAnimalFilter } = require('../middleware/ownership');

// Recuperer toutes les prescriptions
exports.getAll = async (req, res) => {
  try {
    const { animalId, consultationId } = req.query;

    const where = {
      ...ownerAnimalFilter(req),
    };
    if (animalId) {
      if (!(await isOwnerOfAnimal(req, animalId))) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }
      where.animalId = animalId;
    }
    if (consultationId) where.consultationId = consultationId;

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        animal: { select: { id: true, name: true, species: true } },
        medication: true,
        consultation: {
          select: { id: true, date: true, diagnosis: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    res.json({ prescriptions, count: prescriptions.length });
  } catch (error) {
    console.error('Erreur recuperation prescriptions:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation des prescriptions' });
  }
};

// Recuperer une prescription par ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        animal: { include: { owner: true } },
        medication: true,
        consultation: {
          include: {
            veterinarian: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription non trouvee' });
    }

    // Vérifier ownership
    if (req.user.role === 'OWNER' && prescription.animal?.owner?.id !== req.user.ownerId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json({ prescription });
  } catch (error) {
    console.error('Erreur recuperation prescription:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation de la prescription' });
  }
};

// Creer une prescription
exports.create = async (req, res) => {
  try {
    const { animalId, medicationId, consultationId, dosage, frequency, duration, instructions, startDate, endDate } = req.body;

    if (!animalId || !medicationId || !consultationId || !dosage || !frequency || !duration) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const prescription = await prisma.prescription.create({
      data: {
        animalId,
        medicationId,
        consultationId,
        dosage,
        frequency,
        duration,
        instructions,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        medication: true,
        animal: { select: { name: true, species: true } },
      },
    });

    res.status(201).json({
      message: 'Prescription creee avec succes',
      prescription,
    });
  } catch (error) {
    console.error('Erreur creation prescription:', error);
    res.status(500).json({ error: 'Erreur lors de la creation de la prescription' });
  }
};

// Mettre a jour une prescription
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { dosage, frequency, duration, instructions, endDate } = req.body;

    const prescription = await prisma.prescription.update({
      where: { id },
      data: {
        dosage,
        frequency,
        duration,
        instructions,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: { medication: true },
    });

    res.json({ message: 'Prescription mise a jour', prescription });
  } catch (error) {
    console.error('Erreur mise a jour prescription:', error);
    res.status(500).json({ error: 'Erreur lors de la mise a jour de la prescription' });
  }
};

// Supprimer une prescription
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.prescription.delete({ where: { id } });
    res.json({ message: 'Prescription supprimee' });
  } catch (error) {
    console.error('Erreur suppression prescription:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la prescription' });
  }
};

// ============================================
// MEDICATIONS (sous-ressource)
// ============================================

// Recuperer tous les medicaments
exports.getMedications = async (req, res) => {
  try {
    const { search, category } = req.query;

    const where = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (category) where.category = category;

    const medications = await prisma.medication.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({ medications, count: medications.length });
  } catch (error) {
    console.error('Erreur recuperation medicaments:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation des medicaments' });
  }
};

// Creer un medicament
exports.createMedication = async (req, res) => {
  try {
    const { name, category, dosage, sideEffects, contraindications } = req.body;

    if (!name || !category || !dosage) {
      return res.status(400).json({ error: 'Nom, categorie et dosage requis' });
    }

    const medication = await prisma.medication.create({
      data: { name, category, dosage, sideEffects, contraindications },
    });

    res.status(201).json({ message: 'Medicament cree', medication });
  } catch (error) {
    console.error('Erreur creation medicament:', error);
    res.status(500).json({ error: 'Erreur lors de la creation du medicament' });
  }
};
