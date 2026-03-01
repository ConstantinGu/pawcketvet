const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Dashboard stats globales
exports.getDashboardStats = async (req, res) => {
  try {
    const clinicId = req.user.clinicId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const clinicFilter = clinicId ? { clinicId } : {};

    // Requetes en parallele
    const [
      todayAppointments,
      activePatients,
      unreadMessages,
      lowStockItems,
      monthAppointments,
      monthRevenue,
      pendingInvoices,
      upcomingVaccinations,
      recentConsultations,
      totalOwners,
    ] = await Promise.all([
      // RDV aujourd'hui
      prisma.appointment.count({
        where: { ...clinicFilter, date: { gte: today, lt: tomorrow } },
      }),
      // Patients actifs
      prisma.animal.count({
        where: { ...clinicFilter, isActive: true },
      }),
      // Messages non lus
      prisma.message.count({
        where: { senderId: null, isRead: false },
      }),
      // Stock faible (placeholder - real count computed below)
      Promise.resolve(0),
      // RDV ce mois
      prisma.appointment.count({
        where: { ...clinicFilter, date: { gte: thisMonth, lt: nextMonth } },
      }),
      // CA ce mois
      prisma.invoice.aggregate({
        where: {
          ...clinicFilter,
          status: 'PAID',
          paymentDate: { gte: thisMonth, lt: nextMonth },
        },
        _sum: { total: true },
      }),
      // Factures en attente
      prisma.invoice.count({
        where: { ...clinicFilter, status: { in: ['PENDING', 'OVERDUE'] } },
      }),
      // Vaccinations a venir (30 jours)
      prisma.vaccination.count({
        where: {
          nextDueDate: {
            gte: today,
            lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Consultations recentes (7 jours)
      prisma.consultation.count({
        where: {
          date: { gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      // Total proprietaires
      prisma.owner.count(),
    ]);

    // Stock faible - requete alternative
    let lowStock = 0;
    try {
      const items = await prisma.inventoryItem.findMany({
        where: clinicFilter,
        select: { quantity: true, minStock: true },
      });
      lowStock = items.filter(i => i.quantity <= i.minStock).length;
    } catch (e) {
      lowStock = 0;
    }

    res.json({
      stats: {
        todayAppointments,
        activePatients,
        unreadMessages,
        lowStockItems: lowStock,
        monthAppointments,
        monthRevenue: monthRevenue._sum.total || 0,
        pendingInvoices,
        upcomingVaccinations,
        recentConsultations,
        totalOwners,
      },
    });
  } catch (error) {
    console.error('Erreur stats dashboard:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation des statistiques' });
  }
};

// RDV aujourd'hui (liste detaillee)
exports.getTodayAppointments = async (req, res) => {
  try {
    const clinicId = req.user.clinicId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        ...(clinicId ? { clinicId } : {}),
        date: { gte: today, lt: tomorrow },
      },
      include: {
        animal: {
          select: { id: true, name: true, species: true, breed: true },
        },
        veterinarian: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    res.json({ appointments, count: appointments.length });
  } catch (error) {
    console.error('Erreur RDV du jour:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation des RDV du jour' });
  }
};

// Activite recente
exports.getRecentActivity = async (req, res) => {
  try {
    const clinicId = req.user.clinicId;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [recentAppointments, recentConsultations, recentInvoices] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          ...(clinicId ? { clinicId } : {}),
          createdAt: { gte: sevenDaysAgo },
        },
        include: {
          animal: { select: { name: true, species: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.consultation.findMany({
        where: { date: { gte: sevenDaysAgo } },
        include: {
          animal: { select: { name: true, species: true } },
          veterinarian: { select: { firstName: true, lastName: true } },
        },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      prisma.invoice.findMany({
        where: {
          ...(clinicId ? { clinicId } : {}),
          createdAt: { gte: sevenDaysAgo },
        },
        include: {
          owner: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Fusionner et trier
    const activity = [
      ...recentAppointments.map(a => ({
        type: 'appointment',
        date: a.createdAt,
        description: `RDV ${a.type} - ${a.animal.name}`,
        status: a.status,
      })),
      ...recentConsultations.map(c => ({
        type: 'consultation',
        date: c.date,
        description: `Consultation ${c.animal.name} - Dr. ${c.veterinarian.lastName}`,
        diagnosis: c.diagnosis,
      })),
      ...recentInvoices.map(i => ({
        type: 'invoice',
        date: i.createdAt,
        description: `Facture ${i.number} - ${i.owner.firstName} ${i.owner.lastName}`,
        amount: i.total,
        status: i.status,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);

    res.json({ activity });
  } catch (error) {
    console.error('Erreur activite recente:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation de l\'activite' });
  }
};

// Revenue mensuel (graphique)
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const clinicId = req.user.clinicId;
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const result = await prisma.invoice.aggregate({
        where: {
          ...(clinicId ? { clinicId } : {}),
          status: 'PAID',
          paymentDate: { gte: start, lt: end },
        },
        _sum: { total: true },
        _count: true,
      });

      months.push({
        month: start.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        revenue: result._sum.total || 0,
        invoiceCount: result._count,
      });
    }

    res.json({ months });
  } catch (error) {
    console.error('Erreur revenu mensuel:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation du revenu' });
  }
};
