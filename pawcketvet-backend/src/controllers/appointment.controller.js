const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer tous les rendez-vous
exports.getAll = async (req, res) => {
  try {
    const { date, status, veterinarianId } = req.query;
    const userClinicId = req.user.clinicId;

    const where = {
      clinicId: userClinicId,
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
