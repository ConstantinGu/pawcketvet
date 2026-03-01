const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

// Get all share links created by this user
exports.getAll = async (req, res) => {
  try {
    const links = await prisma.shareLink.findMany({
      where: { createdById: req.user.id },
      include: {
        animal: {
          select: { id: true, name: true, species: true, owner: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(links);
  } catch (error) {
    console.error('Erreur getAll shareLinks:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Create a share link for an animal
exports.create = async (req, res) => {
  try {
    const { animalId, expiresInDays, maxAccess } = req.body;

    const code = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 7));

    const link = await prisma.shareLink.create({
      data: {
        code,
        animalId,
        createdById: req.user.id,
        expiresAt,
        maxAccess: maxAccess || null,
      },
      include: {
        animal: {
          select: { id: true, name: true, species: true },
        },
      },
    });

    res.status(201).json({
      ...link,
      shareUrl: `/share/${code}`,
    });
  } catch (error) {
    console.error('Erreur create shareLink:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Access a share link (public, no auth required)
exports.access = async (req, res) => {
  try {
    const { code } = req.params;

    const link = await prisma.shareLink.findUnique({
      where: { code },
      include: {
        animal: {
          include: {
            owner: { select: { firstName: true, lastName: true } },
            vaccinations: { orderBy: { date: 'desc' }, take: 10 },
            consultations: { orderBy: { date: 'desc' }, take: 5, select: { id: true, date: true, reason: true, diagnosis: true } },
            certificates: { orderBy: { issueDate: 'desc' }, take: 5, select: { id: true, type: true, issueDate: true, expiryDate: true } },
          },
        },
      },
    });

    if (!link) {
      return res.status(404).json({ error: 'Lien non trouvé' });
    }

    if (!link.isActive) {
      return res.status(410).json({ error: 'Lien désactivé' });
    }

    if (new Date() > link.expiresAt) {
      return res.status(410).json({ error: 'Lien expiré' });
    }

    if (link.maxAccess && link.accessCount >= link.maxAccess) {
      return res.status(410).json({ error: 'Nombre maximal d\'accès atteint' });
    }

    // Increment access count
    await prisma.shareLink.update({
      where: { id: link.id },
      data: { accessCount: { increment: 1 } },
    });

    res.json({
      animal: link.animal,
      expiresAt: link.expiresAt,
    });
  } catch (error) {
    console.error('Erreur access shareLink:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Deactivate a share link
exports.deactivate = async (req, res) => {
  try {
    const link = await prisma.shareLink.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json(link);
  } catch (error) {
    console.error('Erreur deactivate shareLink:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Delete a share link
exports.delete = async (req, res) => {
  try {
    await prisma.shareLink.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Lien supprimé' });
  } catch (error) {
    console.error('Erreur delete shareLink:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
