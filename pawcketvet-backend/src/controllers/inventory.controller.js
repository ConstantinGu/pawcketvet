const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer tout l'inventaire
exports.getAll = async (req, res) => {
  try {
    const { category, status } = req.query;
    const userClinicId = req.user.clinicId;

    const where = {
      clinicId: userClinicId,
    };

    if (category) {
      where.category = category;
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        movements: {
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
      orderBy: { name: 'asc' },
    });

    // Calculer le statut si demandé
    const itemsWithStatus = items.map(item => {
      let itemStatus = 'ok';
      if (item.quantity === 0) {
        itemStatus = 'critical';
      } else if (item.quantity <= item.minStock) {
        itemStatus = 'low';
      }
      return { ...item, status: itemStatus };
    });

    // Filtrer par statut si nécessaire
    const filteredItems = status 
      ? itemsWithStatus.filter(item => item.status === status)
      : itemsWithStatus;

    res.json({ items: filteredItems, count: filteredItems.length });
  } catch (error) {
    console.error('Erreur récupération inventaire:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'inventaire' });
  }
};

// Récupérer les alertes
exports.getAlerts = async (req, res) => {
  try {
    const userClinicId = req.user.clinicId;

    const items = await prisma.inventoryItem.findMany({
      where: {
        clinicId: userClinicId,
        OR: [
          { quantity: { lte: prisma.inventoryItem.fields.minStock } },
          { quantity: 0 },
        ],
      },
      orderBy: { quantity: 'asc' },
    });

    res.json({ alerts: items, count: items.length });
  } catch (error) {
    console.error('Erreur récupération alertes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des alertes' });
  }
};

// Créer un article
exports.create = async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      minStock,
      unit,
      price,
      supplier,
      barcode,
      expiryDate,
      location,
      notes,
    } = req.body;

    const userClinicId = req.user.clinicId;

    if (!name || !category || quantity === undefined || !minStock) {
      return res.status(400).json({ error: 'Nom, catégorie, quantité et stock minimum requis' });
    }

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        category,
        quantity: parseInt(quantity),
        minStock: parseInt(minStock),
        unit: unit || 'unités',
        price: price ? parseFloat(price) : null,
        supplier,
        barcode,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        location,
        notes,
        clinicId: userClinicId,
      },
    });

    // Créer un mouvement d'entrée
    await prisma.stockMovement.create({
      data: {
        itemId: item.id,
        type: 'IN',
        quantity: parseInt(quantity),
        reason: 'Stock initial',
      },
    });

    res.status(201).json({ 
      message: 'Article créé avec succès',
      item 
    });
  } catch (error) {
    console.error('Erreur création article:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'article' });
  }
};

// Mettre à jour un article
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      quantity,
      minStock,
      unit,
      price,
      supplier,
      barcode,
      expiryDate,
      location,
      notes,
    } = req.body;

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name,
        category,
        quantity: quantity !== undefined ? parseInt(quantity) : undefined,
        minStock: minStock !== undefined ? parseInt(minStock) : undefined,
        unit,
        price: price ? parseFloat(price) : undefined,
        supplier,
        barcode,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        location,
        notes,
      },
    });

    res.json({ 
      message: 'Article mis à jour avec succès',
      item 
    });
  } catch (error) {
    console.error('Erreur mise à jour article:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'article' });
  }
};

// Supprimer un article
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.inventoryItem.delete({
      where: { id },
    });

    res.json({ message: 'Article supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression article:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'article' });
  }
};

// Ajuster le stock
exports.adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type, reason } = req.body;

    if (!quantity || !type) {
      return res.status(400).json({ error: 'Quantité et type requis' });
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    let newQuantity = item.quantity;
    if (type === 'IN') {
      newQuantity += parseInt(quantity);
    } else if (type === 'OUT') {
      newQuantity -= parseInt(quantity);
    } else {
      newQuantity = parseInt(quantity);
    }

    // Empêcher les quantités négatives
    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Stock insuffisant' });
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: { quantity: newQuantity },
    });

    await prisma.stockMovement.create({
      data: {
        itemId: id,
        type,
        quantity: parseInt(quantity),
        reason,
      },
    });

    res.json({ 
      message: 'Stock ajusté avec succès',
      item: updatedItem 
    });
  } catch (error) {
    console.error('Erreur ajustement stock:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajustement du stock' });
  }
};
