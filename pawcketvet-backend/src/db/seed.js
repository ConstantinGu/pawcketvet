const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seed en cours...\n');

  const password = await bcrypt.hash('Test1234!', 10);

  // ============================================
  // 1. CLINIQUE
  // ============================================
  const clinic = await prisma.clinic.create({
    data: {
      name: 'Clinique VetoPaws Paris',
      address: '42 Rue du Faubourg Saint-Antoine',
      city: 'Paris',
      postalCode: '75012',
      country: 'France',
      phone: '01 43 45 67 89',
      email: 'contact@vetopaws.fr',
      website: 'https://vetopaws.fr',
      description: 'Clinique veterinaire moderne specialisee dans les soins des animaux de compagnie.',
      openingHours: {
        lundi: { open: '08:30', close: '19:00', closed: false },
        mardi: { open: '08:30', close: '19:00', closed: false },
        mercredi: { open: '08:30', close: '19:00', closed: false },
        jeudi: { open: '08:30', close: '19:00', closed: false },
        vendredi: { open: '08:30', close: '18:00', closed: false },
        samedi: { open: '09:00', close: '13:00', closed: false },
        dimanche: { open: '', close: '', closed: true },
      },
      subscription: 'PRO',
    },
  });
  console.log('Clinique creee : ' + clinic.name);

  // ============================================
  // 2. UTILISATEURS STAFF
  // ============================================
  const admin = await prisma.user.create({
    data: {
      email: 'admin@vetopaws.fr',
      password,
      role: 'ADMIN',
      firstName: 'Sophie',
      lastName: 'Martin',
      phone: '06 12 34 56 78',
      clinicId: clinic.id,
    },
  });

  const vet = await prisma.user.create({
    data: {
      email: 'vet@vetopaws.fr',
      password,
      role: 'VETERINARIAN',
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '06 23 45 67 89',
      clinicId: clinic.id,
    },
  });

  const assistant = await prisma.user.create({
    data: {
      email: 'assistant@vetopaws.fr',
      password,
      role: 'ASSISTANT',
      firstName: 'Marie',
      lastName: 'Leroy',
      phone: '06 34 56 78 90',
      clinicId: clinic.id,
    },
  });

  console.log('Staff cree : Admin (Sophie), Vet (Jean), Assistant (Marie)');

  // ============================================
  // 3. PROPRIETAIRES + USER OWNER
  // ============================================
  const owner1 = await prisma.owner.create({
    data: {
      email: 'client@test.fr',
      password,
      firstName: 'Lucas',
      lastName: 'Bernard',
      phone: '06 45 67 89 01',
      address: '15 Rue de la Paix',
      city: 'Paris',
      postalCode: '75002',
    },
  });

  // User OWNER correspondant (lie par email)
  await prisma.user.create({
    data: {
      email: 'client@test.fr',
      password,
      role: 'OWNER',
      firstName: 'Lucas',
      lastName: 'Bernard',
      phone: '06 45 67 89 01',
    },
  });

  const owner2 = await prisma.owner.create({
    data: {
      email: 'claire@test.fr',
      password,
      firstName: 'Claire',
      lastName: 'Petit',
      phone: '06 56 78 90 12',
      address: '8 Avenue des Champs-Elysees',
      city: 'Paris',
      postalCode: '75008',
    },
  });

  await prisma.user.create({
    data: {
      email: 'claire@test.fr',
      password,
      role: 'OWNER',
      firstName: 'Claire',
      lastName: 'Petit',
      phone: '06 56 78 90 12',
    },
  });

  console.log('Proprietaires crees : Lucas Bernard, Claire Petit');

  // ============================================
  // 4. ANIMAUX
  // ============================================
  const max = await prisma.animal.create({
    data: {
      name: 'Max',
      species: 'DOG',
      breed: 'Golden Retriever',
      birthDate: new Date('2021-03-15'),
      gender: 'MALE',
      color: 'Dore',
      weight: 32.5,
      microchip: '250269812345678',
      ownerId: owner1.id,
      clinicId: clinic.id,
      createdById: vet.id,
    },
  });

  const luna = await prisma.animal.create({
    data: {
      name: 'Luna',
      species: 'CAT',
      breed: 'Europeen',
      birthDate: new Date('2022-07-20'),
      gender: 'FEMALE',
      color: 'Tigree',
      weight: 4.2,
      microchip: '250269887654321',
      ownerId: owner1.id,
      clinicId: clinic.id,
      createdById: vet.id,
    },
  });

  const rocky = await prisma.animal.create({
    data: {
      name: 'Rocky',
      species: 'DOG',
      breed: 'Bouledogue Francais',
      birthDate: new Date('2023-01-10'),
      gender: 'MALE',
      color: 'Bringe',
      weight: 12.8,
      microchip: '250269811112222',
      ownerId: owner2.id,
      clinicId: clinic.id,
      createdById: vet.id,
    },
  });

  const noisette = await prisma.animal.create({
    data: {
      name: 'Noisette',
      species: 'RABBIT',
      breed: 'Nain Belier',
      birthDate: new Date('2023-06-01'),
      gender: 'FEMALE',
      color: 'Roux',
      weight: 1.8,
      ownerId: owner2.id,
      clinicId: clinic.id,
      createdById: vet.id,
    },
  });

  console.log('Animaux crees : Max (chien), Luna (chat), Rocky (chien), Noisette (lapin)');

  // ============================================
  // 5. VACCINATIONS
  // ============================================
  await prisma.vaccination.createMany({
    data: [
      { name: 'Rage', date: new Date('2025-06-15'), nextDueDate: new Date('2026-06-15'), batchNumber: 'RAB-2025-001', veterinarian: 'Dr. Dupont', animalId: max.id },
      { name: 'CHPL', date: new Date('2025-03-10'), nextDueDate: new Date('2026-03-10'), batchNumber: 'CHPL-2025-042', veterinarian: 'Dr. Dupont', animalId: max.id },
      { name: 'Typhus (RCP)', date: new Date('2025-05-20'), nextDueDate: new Date('2026-05-20'), batchNumber: 'RCP-2025-018', veterinarian: 'Dr. Dupont', animalId: luna.id },
      { name: 'Rage', date: new Date('2025-09-01'), nextDueDate: new Date('2026-09-01'), batchNumber: 'RAB-2025-088', veterinarian: 'Dr. Dupont', animalId: rocky.id },
      { name: 'VHD + Myxomatose', date: new Date('2025-04-10'), nextDueDate: new Date('2026-04-10'), batchNumber: 'VHD-2025-007', veterinarian: 'Dr. Dupont', animalId: noisette.id },
    ],
  });
  console.log('Vaccinations creees');

  // ============================================
  // 6. RENDEZ-VOUS
  // ============================================
  const today = new Date();

  const apt1 = await prisma.appointment.create({
    data: {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
      duration: 30,
      type: 'CONSULTATION',
      status: 'CONFIRMED',
      reason: 'Boiterie patte avant droite',
      animalId: max.id,
      clinicId: clinic.id,
      veterinarianId: vet.id,
    },
  });

  await prisma.appointment.create({
    data: {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
      duration: 20,
      type: 'VACCINATION',
      status: 'CONFIRMED',
      reason: 'Rappel vaccin annuel',
      animalId: rocky.id,
      clinicId: clinic.id,
      veterinarianId: vet.id,
    },
  });

  await prisma.appointment.create({
    data: {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0),
      duration: 30,
      type: 'FOLLOWUP',
      status: 'PENDING',
      reason: 'Controle post-operation',
      animalId: luna.id,
      clinicId: clinic.id,
      veterinarianId: vet.id,
    },
  });

  console.log('Rendez-vous crees');

  // ============================================
  // 7. CONSULTATION
  // ============================================
  await prisma.consultation.create({
    data: {
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
      reason: 'Visite annuelle de controle',
      symptoms: 'Aucun symptome particulier',
      diagnosis: 'Animal en bonne sante generale',
      treatment: 'Aucun traitement necessaire. Rappel vaccin dans 3 mois.',
      temperature: 38.5,
      heartRate: 80,
      weight: 32.5,
      animalId: max.id,
      veterinarianId: vet.id,
      appointmentId: apt1.id,
    },
  });
  console.log('Consultations creees');

  // ============================================
  // 8. INVENTAIRE
  // ============================================
  await prisma.inventoryItem.createMany({
    data: [
      { name: 'Vaccin Rage (Rabisin)', category: 'VACCINE', quantity: 25, minStock: 10, unit: 'doses', price: 12.50, clinicId: clinic.id },
      { name: 'Vaccin CHPL', category: 'VACCINE', quantity: 18, minStock: 8, unit: 'doses', price: 15.00, clinicId: clinic.id },
      { name: 'Amoxicilline 250mg', category: 'MEDICATION', quantity: 50, minStock: 20, unit: 'comprimes', price: 0.45, clinicId: clinic.id },
      { name: 'Metacam 1.5mg/ml', category: 'MEDICATION', quantity: 12, minStock: 5, unit: 'flacons', price: 18.90, clinicId: clinic.id },
      { name: 'Compresses steriles', category: 'SUPPLY', quantity: 200, minStock: 50, unit: 'pieces', price: 0.15, clinicId: clinic.id },
      { name: 'Gants latex M', category: 'SUPPLY', quantity: 3, minStock: 5, unit: 'boites', price: 8.50, clinicId: clinic.id },
      { name: 'Seringues 5ml', category: 'SUPPLY', quantity: 150, minStock: 50, unit: 'pieces', price: 0.12, clinicId: clinic.id },
      { name: 'Croquettes Royal Canin Recovery', category: 'FOOD', quantity: 8, minStock: 3, unit: 'sachets', price: 4.20, clinicId: clinic.id },
    ],
  });
  console.log('Inventaire cree (8 articles)');

  // ============================================
  // 9. FACTURES
  // ============================================
  await prisma.invoice.create({
    data: {
      number: 'FAC-2026-001',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
      status: 'PAID',
      subtotal: 55.00,
      tax: 11.00,
      total: 66.00,
      paidAmount: 66.00,
      paymentMethod: 'CB',
      paymentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
      items: [
        { description: 'Consultation generale', quantity: 1, unitPrice: 45.00, total: 45.00 },
        { description: 'Vaccin CHPL', quantity: 1, unitPrice: 10.00, total: 10.00 },
      ],
      ownerId: owner1.id,
      clinicId: clinic.id,
    },
  });

  await prisma.invoice.create({
    data: {
      number: 'FAC-2026-002',
      date: today,
      status: 'PENDING',
      subtotal: 45.00,
      tax: 9.00,
      total: 54.00,
      items: [
        { description: 'Consultation generale', quantity: 1, unitPrice: 45.00, total: 45.00 },
      ],
      ownerId: owner2.id,
      clinicId: clinic.id,
    },
  });
  console.log('Factures creees');

  // ============================================
  // 10. NOTIFICATIONS
  // ============================================
  await prisma.notification.createMany({
    data: [
      { type: 'APPOINTMENT', title: 'Nouveau rendez-vous', message: 'Max - Consultation a 9h30 aujourd\'hui', userId: vet.id },
      { type: 'APPOINTMENT', title: 'Rendez-vous confirme', message: 'Rocky - Vaccination a 11h00 aujourd\'hui', userId: vet.id },
      { type: 'STOCK_ALERT', title: 'Stock bas', message: 'Gants latex M : seulement 3 boites restantes (seuil: 5)', userId: admin.id },
      { type: 'PAYMENT', title: 'Paiement recu', message: 'Facture FAC-2026-001 payee par Lucas Bernard (66.00 EUR)', userId: admin.id },
      { type: 'SYSTEM', title: 'Bienvenue sur PawcketVet', message: 'Votre clinique est configuree et prete.', userId: admin.id, isRead: true },
    ],
  });
  console.log('Notifications creees');

  // ============================================
  // 11. MESSAGES
  // ============================================
  await prisma.message.create({
    data: {
      subject: 'Question sur le traitement de Max',
      content: 'Bonjour Docteur, Max semble avoir des demangeaisons depuis le changement de croquettes. Est-ce normal ?',
      ownerId: owner1.id,
    },
  });

  await prisma.message.create({
    data: {
      content: 'Bonjour, les demangeaisons peuvent etre liees au changement alimentaire. Essayez une transition progressive sur 7 jours. Si ca persiste, prenez RDV.',
      senderId: vet.id,
    },
  });
  console.log('Messages crees');

  // ============================================
  // RESUME
  // ============================================
  console.log('\n========================================');
  console.log('  SEED TERMINE AVEC SUCCES');
  console.log('========================================\n');
  console.log('Comptes de connexion (mot de passe : Test1234!) :\n');
  console.log('  STAFF CLINIQUE :');
  console.log('    Admin       : admin@vetopaws.fr');
  console.log('    Veterinaire : vet@vetopaws.fr');
  console.log('    Assistant   : assistant@vetopaws.fr');
  console.log('');
  console.log('  PROPRIETAIRES :');
  console.log('    Lucas       : client@test.fr');
  console.log('    Claire      : claire@test.fr');
  console.log('');
  console.log('Donnees creees :');
  console.log('  - 1 clinique, 3 staff, 2 proprietaires');
  console.log('  - 4 animaux (2 chiens, 1 chat, 1 lapin)');
  console.log('  - 5 vaccinations, 3 RDV, 1 consultation');
  console.log('  - 8 articles en stock, 2 factures');
  console.log('  - 5 notifications, 2 messages');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
