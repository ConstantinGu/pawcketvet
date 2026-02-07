const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all reviews for the clinic
exports.getAll = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { clinicId: true },
    });

    if (!user?.clinicId) {
      return res.status(404).json({ error: 'Aucune clinique associée' });
    }

    const { published, rating } = req.query;

    const where = { clinicId: user.clinicId };
    if (published !== undefined) where.isPublished = published === 'true';
    if (rating) where.rating = parseInt(rating);

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(reviews);
  } catch (error) {
    console.error('Erreur getAll reviews:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get review by id
exports.getById = async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review) {
      return res.status(404).json({ error: 'Avis non trouvé' });
    }

    res.json(review);
  } catch (error) {
    console.error('Erreur getById review:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Create a review (from owner/public)
exports.create = async (req, res) => {
  try {
    const { clinicId, rating, comment, ownerName, ownerEmail } = req.body;

    const review = await prisma.review.create({
      data: {
        clinicId,
        rating: parseInt(rating),
        comment,
        ownerName,
        ownerEmail,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Erreur create review:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Respond to a review (vet/admin)
exports.respond = async (req, res) => {
  try {
    const { response } = req.body;

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { response },
    });

    res.json(review);
  } catch (error) {
    console.error('Erreur respond review:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Publish/unpublish a review
exports.togglePublish = async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review) {
      return res.status(404).json({ error: 'Avis non trouvé' });
    }

    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data: { isPublished: !review.isPublished },
    });

    res.json(updated);
  } catch (error) {
    console.error('Erreur togglePublish:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Delete a review
exports.delete = async (req, res) => {
  try {
    await prisma.review.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Avis supprimé' });
  } catch (error) {
    console.error('Erreur delete review:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
