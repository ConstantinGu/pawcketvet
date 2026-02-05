const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer les messages (conversations)
exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id;
    const ownerId = req.user.ownerId;
    const role = req.user.role;

    let where = {};
    if (role === 'OWNER' && ownerId) {
      where = { ownerId };
    } else {
      where = { senderId: userId };
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true, avatar: true },
        },
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ messages, count: messages.length });
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
};

// Récupérer un message par ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    res.json({ message });
  } catch (error) {
    console.error('Erreur récupération message:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du message' });
  }
};

// Envoyer un message
exports.send = async (req, res) => {
  try {
    const { subject, content, recipientOwnerId, recipientUserId } = req.body;
    const userId = req.user.id;
    const ownerId = req.user.ownerId;
    const role = req.user.role;

    if (!content) {
      return res.status(400).json({ error: 'Le contenu du message est requis' });
    }

    const data = {
      subject,
      content,
    };

    // Si c'est un OWNER qui envoie
    if (role === 'OWNER' && ownerId) {
      data.ownerId = ownerId;
      if (recipientUserId) {
        data.senderId = recipientUserId;
      }
    } else {
      // C'est un véto/admin qui envoie
      data.senderId = userId;
      if (recipientOwnerId) {
        data.ownerId = recipientOwnerId;
      }
    }

    const message = await prisma.message.create({
      data,
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    res.status(201).json({
      message: 'Message envoyé avec succès',
      data: message,
    });
  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({ error: "Erreur lors de l'envoi du message" });
  }
};

// Marquer un message comme lu
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ message: 'Message marqué comme lu', data: message });
  } catch (error) {
    console.error('Erreur marquage message:', error);
    res.status(500).json({ error: 'Erreur lors du marquage du message' });
  }
};

// Récupérer les conversations pour un owner (regroupées)
exports.getConversations = async (req, res) => {
  try {
    const ownerId = req.user.ownerId;

    if (!ownerId) {
      return res.status(400).json({ error: 'Owner ID requis' });
    }

    const messages = await prisma.message.findMany({
      where: { ownerId },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = messages.filter(m => !m.isRead && m.senderId).length;

    res.json({ messages, unreadCount });
  } catch (error) {
    console.error('Erreur récupération conversations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
  }
};
