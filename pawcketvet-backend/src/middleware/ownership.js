const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Vérifie qu'un animal appartient à l'utilisateur OWNER connecté.
 * Retourne true si l'utilisateur n'est pas OWNER (staff a accès à tout).
 */
async function isOwnerOfAnimal(req, animalId) {
  if (req.user.role !== 'OWNER') return true;
  if (!animalId) return false;

  const animal = await prisma.animal.findUnique({
    where: { id: animalId },
    select: { ownerId: true },
  });

  return animal && animal.ownerId === req.user.ownerId;
}

/**
 * Vérifie qu'un rendez-vous appartient à l'utilisateur OWNER connecté.
 */
async function isOwnerOfAppointment(req, appointmentId) {
  if (req.user.role !== 'OWNER') return true;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { animal: { select: { ownerId: true } } },
  });

  return appointment && appointment.animal.ownerId === req.user.ownerId;
}

/**
 * Filtre les requêtes getAll pour les OWNER : ne retourne que les animaux leur appartenant.
 */
function ownerAnimalFilter(req) {
  if (req.user.role !== 'OWNER') return {};
  return { animal: { ownerId: req.user.ownerId } };
}

/**
 * Filtre direct sur ownerId pour les données liées aux propriétaires.
 */
function ownerFilter(req) {
  if (req.user.role !== 'OWNER') return {};
  return { ownerId: req.user.ownerId };
}

module.exports = {
  isOwnerOfAnimal,
  isOwnerOfAppointment,
  ownerAnimalFilter,
  ownerFilter,
};
