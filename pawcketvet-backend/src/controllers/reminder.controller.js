const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer tous les rappels
exports.getAll = async (req, res) => {
  try {
    const { type, sent } = req.query;

    const where = {};
    if (type) where.type = type;
    if (sent !== undefined) where.sent = sent === 'true';

    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: { scheduledFor: 'asc' },
    });

    res.json({ reminders, count: reminders.length });
  } catch (error) {
    console.error('Erreur récupération rappels:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des rappels' });
  }
};

// Récupérer les rappels pour un owner (par email)
exports.getByOwner = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;
    const userEmail = req.user.email;

    // Chercher les rappels adressés à cet email
    const reminders = await prisma.reminder.findMany({
      where: {
        recipient: userEmail,
      },
      orderBy: { scheduledFor: 'asc' },
    });

    // Aussi chercher les vaccinations à venir pour les animaux de l'owner
    let upcomingVaccinations = [];
    if (ownerId) {
      const animals = await prisma.animal.findMany({
        where: { ownerId, isActive: true },
        include: {
          vaccinations: {
            where: {
              nextDueDate: { not: null },
            },
            orderBy: { nextDueDate: 'asc' },
          },
        },
      });

      upcomingVaccinations = animals.flatMap(animal =>
        animal.vaccinations
          .filter(v => v.nextDueDate && new Date(v.nextDueDate) > new Date())
          .map(v => ({
            id: v.id,
            type: 'VACCINATION',
            animalName: animal.name,
            animalSpecies: animal.species,
            vaccineName: v.name,
            scheduledFor: v.nextDueDate,
            sent: false,
          }))
      );
    }

    res.json({ reminders, upcomingVaccinations });
  } catch (error) {
    console.error('Erreur récupération rappels owner:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des rappels' });
  }
};

// Créer un rappel
exports.create = async (req, res) => {
  try {
    const { type, scheduledFor, channel, recipient, subject, message } = req.body;

    if (!type || !scheduledFor || !channel || !recipient || !message) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const reminder = await prisma.reminder.create({
      data: {
        type,
        scheduledFor: new Date(scheduledFor),
        channel,
        recipient,
        subject,
        message,
      },
    });

    res.status(201).json({
      message: 'Rappel créé avec succès',
      reminder,
    });
  } catch (error) {
    console.error('Erreur création rappel:', error);
    res.status(500).json({ error: 'Erreur lors de la création du rappel' });
  }
};

// Mettre à jour un rappel
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, scheduledFor, channel, recipient, subject, message } = req.body;

    const reminder = await prisma.reminder.update({
      where: { id },
      data: {
        type,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        channel,
        recipient,
        subject,
        message,
      },
    });

    res.json({ message: 'Rappel mis à jour', reminder });
  } catch (error) {
    console.error('Erreur mise à jour rappel:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rappel' });
  }
};

// Supprimer un rappel
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.reminder.delete({ where: { id } });

    res.json({ message: 'Rappel supprimé' });
  } catch (error) {
    console.error('Erreur suppression rappel:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du rappel' });
  }
};

// Marquer un rappel comme envoyé
exports.markSent = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await prisma.reminder.update({
      where: { id },
      data: { sent: true, sentAt: new Date() },
    });

    res.json({ message: 'Rappel marqué comme envoyé', reminder });
  } catch (error) {
    console.error('Erreur marquage rappel:', error);
    res.status(500).json({ error: 'Erreur lors du marquage du rappel' });
  }
};
