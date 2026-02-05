const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer toutes les vaccinations d'un animal
exports.getByAnimal = async (req, res) => {
  try {
    const { animalId } = req.params;

    const vaccinations = await prisma.vaccination.findMany({
      where: { animalId },
      orderBy: { date: 'desc' },
    });

    res.json({ vaccinations, count: vaccinations.length });
  } catch (error) {
    console.error('Erreur récupération vaccinations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des vaccinations' });
  }
};

// Récupérer les vaccinations à venir (toutes)
exports.getUpcoming = async (req, res) => {
  try {
    const clinicId = req.user.clinicId;

    const vaccinations = await prisma.vaccination.findMany({
      where: {
        nextDueDate: {
          not: null,
          gte: new Date(),
        },
        animal: {
          isActive: true,
          ...(clinicId ? { clinicId } : {}),
        },
      },
      include: {
        animal: {
          select: {
            id: true,
            name: true,
            species: true,
            owner: {
              select: { firstName: true, lastName: true, phone: true, email: true },
            },
          },
        },
      },
      orderBy: { nextDueDate: 'asc' },
    });

    res.json({ vaccinations, count: vaccinations.length });
  } catch (error) {
    console.error('Erreur récupération vaccinations à venir:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des vaccinations' });
  }
};

// Créer une vaccination
exports.create = async (req, res) => {
  try {
    const { animalId, name, date, nextDueDate, batchNumber, veterinarian, notes } = req.body;

    if (!animalId || !name || !date) {
      return res.status(400).json({ error: 'Animal, nom du vaccin et date requis' });
    }

    const vaccination = await prisma.vaccination.create({
      data: {
        animalId,
        name,
        date: new Date(date),
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        batchNumber,
        veterinarian: veterinarian || `Dr. ${req.user.email}`,
        notes,
      },
    });

    res.status(201).json({
      message: 'Vaccination enregistrée avec succès',
      vaccination,
    });
  } catch (error) {
    console.error('Erreur création vaccination:', error);
    res.status(500).json({ error: "Erreur lors de l'enregistrement de la vaccination" });
  }
};

// Mettre à jour une vaccination
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, nextDueDate, batchNumber, veterinarian, notes } = req.body;

    const vaccination = await prisma.vaccination.update({
      where: { id },
      data: {
        name,
        date: date ? new Date(date) : undefined,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
        batchNumber,
        veterinarian,
        notes,
      },
    });

    res.json({ message: 'Vaccination mise à jour', vaccination });
  } catch (error) {
    console.error('Erreur mise à jour vaccination:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la vaccination' });
  }
};

// Supprimer une vaccination
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.vaccination.delete({ where: { id } });

    res.json({ message: 'Vaccination supprimée' });
  } catch (error) {
    console.error('Erreur suppression vaccination:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la vaccination' });
  }
};
