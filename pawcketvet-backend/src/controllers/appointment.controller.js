const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { isOwnerOfAnimal, isOwnerOfAppointment, ownerAnimalFilter } = require('../middleware/ownership');

// Récupérer tous les rendez-vous
exports.getAll = async (req, res) => {
  try {
    const { date, status, veterinarianId } = req.query;
    const userClinicId = req.user.clinicId;

    const where = {
      clinicId: userClinicId,
      ...ownerAnimalFilter(req),
    };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (status) {
      where.status = status;
    }

    if (veterinarianId) {
      where.veterinarianId = veterinarianId;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        animal: {
          include: {
            owner: true,
          },
        },
        veterinarian: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    res.json({ appointments, count: appointments.length });
  } catch (error) {
    console.error('Erreur récupération rendez-vous:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des rendez-vous' });
  }
};

// Créer un rendez-vous
exports.create = async (req, res) => {
  try {
    const { animalId, date, duration, type, reason, notes, isUrgent } = req.body;
    const userClinicId = req.user.clinicId;
    const userId = req.user.id;

    if (!animalId || !date || !type) {
      return res.status(400).json({ error: 'Animal, date et type requis' });
    }

    // Vérifier que l'animal appartient au propriétaire connecté
    if (!(await isOwnerOfAnimal(req, animalId))) {
      return res.status(403).json({ error: 'Accès non autorisé à cet animal' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        animalId,
        date: new Date(date),
        duration: duration || 30,
        type,
        reason,
        notes,
        isUrgent: isUrgent || false,
        status: 'PENDING',
        clinicId: userClinicId,
        veterinarianId: userId,
      },
      include: {
        animal: {
          include: { owner: true },
        },
        veterinarian: true,
      },
    });

    res.status(201).json({ 
      message: 'Rendez-vous créé avec succès',
      appointment 
    });
  } catch (error) {
    console.error('Erreur création rendez-vous:', error);
    res.status(500).json({ error: 'Erreur lors de la création du rendez-vous' });
  }
};

// Mettre à jour un rendez-vous
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, duration, type, reason, notes, status, isUrgent } = req.body;

    // Vérifier ownership
    if (!(await isOwnerOfAppointment(req, id))) {
      return res.status(403).json({ error: 'Accès non autorisé à ce rendez-vous' });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        duration,
        type,
        reason,
        notes,
        status,
        isUrgent,
      },
      include: {
        animal: {
          include: { owner: true },
        },
        veterinarian: true,
      },
    });

    res.json({ 
      message: 'Rendez-vous mis à jour avec succès',
      appointment 
    });
  } catch (error) {
    console.error('Erreur mise à jour rendez-vous:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rendez-vous' });
  }
};

// Supprimer un rendez-vous
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier ownership
    if (!(await isOwnerOfAppointment(req, id))) {
      return res.status(403).json({ error: 'Accès non autorisé à ce rendez-vous' });
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({ message: 'Rendez-vous annulé avec succès' });
  } catch (error) {
    console.error('Erreur annulation rendez-vous:', error);
    res.status(500).json({ error: 'Erreur lors de l\'annulation du rendez-vous' });
  }
};

// Changer le statut
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Vérifier ownership (OWNER ne peut qu'annuler)
    if (req.user.role === 'OWNER' && status !== 'CANCELLED') {
      return res.status(403).json({ error: 'Vous ne pouvez qu\'annuler un rendez-vous' });
    }
    if (!(await isOwnerOfAppointment(req, id))) {
      return res.status(403).json({ error: 'Accès non autorisé à ce rendez-vous' });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        animal: {
          include: { owner: true },
        },
      },
    });

    res.json({
      message: 'Statut mis à jour avec succès',
      appointment
    });
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};

// ============================================
// SMART COMPLETE — Tout-en-un pour le carnet de santé
// Crée consultation + vaccinations + poids + statut COMPLETED en un seul appel
// ============================================
exports.completeWithConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      // Consultation data
      symptoms,
      temperature,
      weight,
      heartRate,
      diagnosis,
      treatment,
      notes,
      nextAppointment,
      // Vaccinations array
      vaccinations,
    } = req.body;

    // Vérifier que le RDV existe et récupérer l'animal
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        animal: { include: { owner: true } },
        veterinarian: { select: { id: true, firstName: true, lastName: true } },
        consultation: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    if (appointment.consultation) {
      return res.status(400).json({ error: 'Ce rendez-vous a déjà une consultation enregistrée' });
    }

    if (appointment.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Impossible de compléter un rendez-vous annulé' });
    }

    const animalId = appointment.animalId;
    const vetName = `Dr. ${appointment.veterinarian.lastName}`;

    // Transaction atomique — tout réussit ou tout échoue
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer la consultation
      const consultation = await tx.consultation.create({
        data: {
          appointmentId: id,
          animalId,
          veterinarianId: userId,
          reason: appointment.reason || appointment.type,
          symptoms: symptoms || null,
          temperature: temperature ? parseFloat(temperature) : null,
          weight: weight ? parseFloat(weight) : null,
          heartRate: heartRate ? parseInt(heartRate) : null,
          diagnosis: diagnosis || null,
          treatment: treatment || null,
          notes: notes || null,
          nextAppointmentDate: nextAppointment ? new Date(nextAppointment) : null,
          date: new Date(),
        },
      });

      // 2. Mettre à jour le poids de l'animal + historique
      if (weight) {
        const parsedWeight = parseFloat(weight);
        await tx.animal.update({
          where: { id: animalId },
          data: { weight: parsedWeight },
        });
        await tx.weightHistory.create({
          data: {
            animalId,
            weight: parsedWeight,
            notes: `Consultation du ${new Date().toLocaleDateString('fr-FR')}`,
          },
        });
      }

      // 3. Créer les vaccinations
      const createdVaccinations = [];
      if (vaccinations && Array.isArray(vaccinations) && vaccinations.length > 0) {
        for (const vacc of vaccinations) {
          if (!vacc.name) continue;
          const vaccination = await tx.vaccination.create({
            data: {
              animalId,
              name: vacc.name,
              date: new Date(),
              nextDueDate: vacc.nextDueDate ? new Date(vacc.nextDueDate) : null,
              batchNumber: vacc.batchNumber || null,
              veterinarian: vetName,
              notes: vacc.notes || null,
            },
          });
          createdVaccinations.push(vaccination);
        }
      }

      // 4. Marquer le RDV comme terminé
      const updatedAppointment = await tx.appointment.update({
        where: { id },
        data: { status: 'COMPLETED' },
        include: {
          animal: { include: { owner: true } },
          veterinarian: { select: { id: true, firstName: true, lastName: true } },
          consultation: true,
        },
      });

      return {
        appointment: updatedAppointment,
        consultation,
        vaccinations: createdVaccinations,
        weightUpdated: !!weight,
      };
    });

    res.json({
      message: 'Consultation enregistrée et carnet de santé mis à jour',
      ...result,
    });
  } catch (error) {
    console.error('Erreur completion smart:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la consultation' });
  }
};
