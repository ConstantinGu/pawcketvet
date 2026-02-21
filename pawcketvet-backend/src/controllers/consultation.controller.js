const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { isOwnerOfAnimal, ownerAnimalFilter } = require('../middleware/ownership');

// Créer une consultation
exports.create = async (req, res) => {
  try {
    const {
      appointmentId,
      animalId,
      symptoms,
      temperature,
      weight,
      heartRate,
      diagnosis,
      treatment,
      prescriptions,
      notes,
      nextAppointment,
    } = req.body;

    const userId = req.user.id;

    const consultation = await prisma.consultation.create({
      data: {
        appointmentId,
        animalId,
        veterinarianId: userId,
        symptoms,
        temperature: temperature ? parseFloat(temperature) : null,
        weight: weight ? parseFloat(weight) : null,
        heartRate: heartRate ? parseInt(heartRate) : null,
        diagnosis,
        treatment,
        prescriptions: prescriptions || {},
        notes,
        nextAppointmentDate: nextAppointment ? new Date(nextAppointment) : null,
        date: new Date(),
      },
      include: {
        animal: {
          include: {
            owner: true,
          },
        },
        veterinarian: true,
      },
    });

    // Mettre à jour le poids de l'animal si fourni
    if (weight) {
      await prisma.animal.update({
        where: { id: animalId },
        data: { weight: parseFloat(weight) },
      });
    }

    res.status(201).json({
      message: 'Consultation créée avec succès',
      consultation,
    });
  } catch (error) {
    console.error('Erreur création consultation:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la consultation' });
  }
};

// Récupérer toutes les consultations
exports.getAll = async (req, res) => {
  try {
    const { animalId } = req.query;
    const userClinicId = req.user.clinicId;

    const where = {
      animal: {
        clinicId: userClinicId,
        ...(req.user.role === 'OWNER' ? { ownerId: req.user.ownerId } : {}),
      },
    };

    if (animalId) {
      // Vérifier ownership si animalId fourni
      if (!(await isOwnerOfAnimal(req, animalId))) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }
      where.animalId = animalId;
    }

    const consultations = await prisma.consultation.findMany({
      where,
      include: {
        animal: {
          include: {
            owner: true,
          },
        },
        veterinarian: true,
        appointment: true,
      },
      orderBy: { date: 'desc' },
    });

    res.json({ consultations, count: consultations.length });
  } catch (error) {
    console.error('Erreur récupération consultations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des consultations' });
  }
};

// Récupérer une consultation
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await prisma.consultation.findUnique({
      where: { id },
      include: {
        animal: {
          include: {
            owner: true,
          },
        },
        veterinarian: true,
        appointment: true,
      },
    });

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation non trouvée' });
    }

    // Vérifier ownership
    if (req.user.role === 'OWNER' && consultation.animal?.owner?.id !== req.user.ownerId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json({ consultation });
  } catch (error) {
    console.error('Erreur récupération consultation:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la consultation' });
  }
};

// Mettre à jour une consultation
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      symptoms,
      temperature,
      weight,
      heartRate,
      diagnosis,
      treatment,
      prescriptions,
      notes,
      nextAppointment,
    } = req.body;

    const consultation = await prisma.consultation.update({
      where: { id },
      data: {
        symptoms,
        temperature: temperature ? parseFloat(temperature) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        heartRate: heartRate ? parseInt(heartRate) : undefined,
        diagnosis,
        treatment,
        prescriptions: prescriptions || undefined,
        notes,
        nextAppointmentDate: nextAppointment ? new Date(nextAppointment) : undefined,
      },
      include: {
        animal: true,
        veterinarian: true,
      },
    });

    res.json({
      message: 'Consultation mise à jour avec succès',
      consultation,
    });
  } catch (error) {
    console.error('Erreur mise à jour consultation:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la consultation' });
  }
};

module.exports = exports;
