const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer toutes les factures
exports.getAll = async (req, res) => {
  try {
    const { status, ownerId } = req.query;
    const userClinicId = req.user.clinicId;

    const where = {
      clinicId: userClinicId,
    };

    if (status) {
      where.status = status;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json({ invoices, count: invoices.length });
  } catch (error) {
    console.error('Erreur récupération factures:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des factures' });
  }
};

// Créer une facture
exports.create = async (req, res) => {
  try {
    const {
      ownerId,
      items,
      subtotal,
      tax,
      discount,
      total,
      notes,
      dueDate,
    } = req.body;

    const userClinicId = req.user.clinicId;

    if (!ownerId || !items || !total) {
      return res.status(400).json({ error: 'Propriétaire, articles et total requis' });
    }

    // Générer un numéro de facture unique
    const count = await prisma.invoice.count({
      where: { clinicId: userClinicId },
    });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        date: new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'PENDING',
        subtotal: parseFloat(subtotal),
        tax: parseFloat(tax) || 0,
        discount: parseFloat(discount) || 0,
        total: parseFloat(total),
        items: { items },
        notes,
        ownerId,
        clinicId: userClinicId,
      },
      include: {
        owner: true,
      },
    });

    res.status(201).json({ 
      message: 'Facture créée avec succès',
      invoice 
    });
  } catch (error) {
    console.error('Erreur création facture:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la facture' });
  }
};

// Mettre à jour une facture
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      items,
      subtotal,
      tax,
      discount,
      total,
      notes,
      dueDate,
      status,
    } = req.body;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        items: items ? { items } : undefined,
        subtotal: subtotal ? parseFloat(subtotal) : undefined,
        tax: tax !== undefined ? parseFloat(tax) : undefined,
        discount: discount !== undefined ? parseFloat(discount) : undefined,
        total: total ? parseFloat(total) : undefined,
        notes,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
      },
      include: {
        owner: true,
      },
    });

    res.json({ 
      message: 'Facture mise à jour avec succès',
      invoice 
    });
  } catch (error) {
    console.error('Erreur mise à jour facture:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la facture' });
  }
};

// Marquer comme payée
exports.markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paidAmount } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    const amount = paidAmount ? parseFloat(paidAmount) : invoice.total;
    const newPaidAmount = invoice.paidAmount + amount;

    let status = 'PENDING';
    if (newPaidAmount >= invoice.total) {
      status = 'PAID';
    } else if (newPaidAmount > 0) {
      status = 'PARTIAL';
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidAmount: newPaidAmount,
        paymentMethod,
        paymentDate: status === 'PAID' ? new Date() : invoice.paymentDate,
      },
      include: {
        owner: true,
      },
    });

    res.json({ 
      message: 'Paiement enregistré avec succès',
      invoice: updatedInvoice 
    });
  } catch (error) {
    console.error('Erreur enregistrement paiement:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du paiement' });
  }
};

// Supprimer une facture
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.invoice.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({ message: 'Facture annulée avec succès' });
  } catch (error) {
    console.error('Erreur annulation facture:', error);
    res.status(500).json({ error: 'Erreur lors de l\'annulation de la facture' });
  }
};
