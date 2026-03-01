const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get clinic info (for the current user's clinic)
exports.getMyClinic = async (req, res) => {
  try {
    const clinicId = req.user.clinicId;

    if (!clinicId) {
      return res.status(404).json({ error: 'Aucune clinique associée' });
    }

    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        users: {
          where: { isActive: true },
          select: { id: true, firstName: true, lastName: true, role: true, email: true, phone: true },
        },
        _count: {
          select: {
            animals: true,
            appointments: true,
            inventory: true,
            invoices: true,
            reviews: true,
          },
        },
      },
    });

    res.json(clinic);
  } catch (error) {
    console.error('Erreur getMyClinic:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Update clinic info
exports.update = async (req, res) => {
  try {
    const clinicId = req.user.clinicId;

    if (!clinicId) {
      return res.status(404).json({ error: 'Aucune clinique associée' });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Seuls les admins peuvent modifier la clinique' });
    }

    const { name, address, city, postalCode, country, phone, email, website, description, openingHours } = req.body;

    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(city && { city }),
        ...(postalCode && { postalCode }),
        ...(country && { country }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(website !== undefined && { website }),
        ...(description !== undefined && { description }),
        ...(openingHours !== undefined && { openingHours }),
      },
    });

    res.json(clinic);
  } catch (error) {
    console.error('Erreur update clinic:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get clinic stats
exports.getStats = async (req, res) => {
  try {
    const clinicId = req.user.clinicId;

    if (!clinicId) {
      return res.status(404).json({ error: 'Aucune clinique associée' });
    }

    const [totalAnimals, totalAppointments, totalInvoices, reviews] = await Promise.all([
      prisma.animal.count({ where: { clinicId } }),
      prisma.appointment.count({ where: { clinicId } }),
      prisma.invoice.count({ where: { clinicId } }),
      prisma.review.findMany({ where: { clinicId }, select: { rating: true } }),
    ]);

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      totalAnimals,
      totalAppointments,
      totalInvoices,
      totalReviews: reviews.length,
      averageRating: Math.round(avgRating * 10) / 10,
    });
  } catch (error) {
    console.error('Erreur getStats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
