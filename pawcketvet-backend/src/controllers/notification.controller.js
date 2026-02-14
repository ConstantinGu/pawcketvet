const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Recuperer les notifications d'un utilisateur
exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isRead, type } = req.query;

    const where = { userId };
    if (isRead !== undefined) where.isRead = isRead === 'true';
    if (type) where.type = type;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({ notifications, unreadCount, count: notifications.length });
  } catch (error) {
    console.error('Erreur recuperation notifications:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation des notifications' });
  }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ message: 'Notification lue', notification });
  } catch (error) {
    console.error('Erreur marquage notification:', error);
    res.status(500).json({ error: 'Erreur lors du marquage de la notification' });
  }
};

// Marquer toutes les notifications comme lues
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'Toutes les notifications marquees comme lues' });
  } catch (error) {
    console.error('Erreur marquage notifications:', error);
    res.status(500).json({ error: 'Erreur lors du marquage des notifications' });
  }
};

// Creer une notification (usage interne / admin)
exports.create = async (req, res) => {
  try {
    const { userId, type, title, message, data } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const notification = await prisma.notification.create({
      data: { userId, type, title, message, data },
    });

    res.status(201).json({ message: 'Notification creee', notification });
  } catch (error) {
    console.error('Erreur creation notification:', error);
    res.status(500).json({ error: 'Erreur lors de la creation de la notification' });
  }
};

// Supprimer une notification
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.delete({ where: { id } });
    res.json({ message: 'Notification supprimee' });
  } catch (error) {
    console.error('Erreur suppression notification:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la notification' });
  }
};

// Supprimer toutes les notifications lues
exports.clearRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await prisma.notification.deleteMany({
      where: { userId, isRead: true },
    });

    res.json({ message: `${result.count} notification(s) supprimee(s)` });
  } catch (error) {
    console.error('Erreur nettoyage notifications:', error);
    res.status(500).json({ error: 'Erreur lors du nettoyage des notifications' });
  }
};
