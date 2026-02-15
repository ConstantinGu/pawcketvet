const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('=== PawcketVet - Seed exhaustif ===\n');

  const password = await bcrypt.hash('Test1234!', 10);
  const today = new Date();
  const d = (daysOffset, hour = 9, min = 0) => {
    const date = new Date(today);
    date.setDate(date.getDate() + daysOffset);
    date.setHours(hour, min, 0, 0);
    return date;
  };

  // ============================================
  // 1. CLINIQUES (2)
  // ============================================
  const clinic1 = await prisma.clinic.create({
    data: {
      name: 'Clinique VetoPaws Paris',
      address: '42 Rue du Faubourg Saint-Antoine',
      city: 'Paris',
      postalCode: '75012',
      country: 'France',
      phone: '01 43 45 67 89',
      email: 'contact@vetopaws.fr',
      website: 'https://vetopaws.fr',
      description: 'Clinique veterinaire moderne specialisee dans les soins des animaux de compagnie. Equipe de 3 veterinaires, equipee en imagerie, chirurgie et dentisterie.',
      siret: '12345678901234',
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
  console.log('Clinique: ' + clinic1.name);

  // ============================================
  // 2. STAFF (4 membres)
  // ============================================
  const admin = await prisma.user.create({
    data: {
      email: 'admin@vetopaws.fr', password, role: 'ADMIN',
      firstName: 'Sophie', lastName: 'Martin', phone: '06 12 34 56 78',
      clinicId: clinic1.id,
    },
  });
  const vet1 = await prisma.user.create({
    data: {
      email: 'vet@vetopaws.fr', password, role: 'VETERINARIAN',
      firstName: 'Jean', lastName: 'Dupont', phone: '06 23 45 67 89',
      clinicId: clinic1.id,
    },
  });
  const vet2 = await prisma.user.create({
    data: {
      email: 'vet2@vetopaws.fr', password, role: 'VETERINARIAN',
      firstName: 'Camille', lastName: 'Rousseau', phone: '06 98 76 54 32',
      clinicId: clinic1.id,
    },
  });
  const assistant = await prisma.user.create({
    data: {
      email: 'assistant@vetopaws.fr', password, role: 'ASSISTANT',
      firstName: 'Marie', lastName: 'Leroy', phone: '06 34 56 78 90',
      clinicId: clinic1.id,
    },
  });
  console.log('Staff: Admin (Sophie), Vet (Jean), Vet (Camille), Assistant (Marie)');

  // ============================================
  // 3. PROPRIETAIRES (5 clients)
  // ============================================
  const owners = [];
  const ownerData = [
    { email: 'client@test.fr', firstName: 'Lucas', lastName: 'Bernard', phone: '06 45 67 89 01', address: '15 Rue de la Paix', city: 'Paris', postalCode: '75002' },
    { email: 'claire@test.fr', firstName: 'Claire', lastName: 'Petit', phone: '06 56 78 90 12', address: '8 Avenue des Champs-Elysees', city: 'Paris', postalCode: '75008' },
    { email: 'marc@test.fr', firstName: 'Marc', lastName: 'Durand', phone: '06 67 89 01 23', address: '22 Rue de Rivoli', city: 'Paris', postalCode: '75004' },
    { email: 'amelie@test.fr', firstName: 'Amelie', lastName: 'Moreau', phone: '06 78 90 12 34', address: '5 Boulevard Haussmann', city: 'Paris', postalCode: '75009' },
    { email: 'thomas@test.fr', firstName: 'Thomas', lastName: 'Garcia', phone: '06 89 01 23 45', address: '12 Rue de la Roquette', city: 'Paris', postalCode: '75011' },
  ];

  for (const o of ownerData) {
    const owner = await prisma.owner.create({ data: { ...o, password } });
    await prisma.user.create({
      data: { email: o.email, password, role: 'OWNER', firstName: o.firstName, lastName: o.lastName, phone: o.phone },
    });
    owners.push(owner);
  }
  console.log('Proprietaires: ' + ownerData.map(o => o.firstName).join(', '));

  // ============================================
  // 4. ANIMAUX (12 animaux varies)
  // ============================================
  const animalDefs = [
    // Lucas Bernard (owners[0])
    { name: 'Max', species: 'DOG', breed: 'Golden Retriever', birthDate: new Date('2021-03-15'), gender: 'MALE', color: 'Dore', weight: 32.5, microchip: '250269812345678', allergies: 'Sensibilite au poulet', notes: 'Tres joueur, craint les orages', ownerId: 0 },
    { name: 'Luna', species: 'CAT', breed: 'Europeen', birthDate: new Date('2022-07-20'), gender: 'FEMALE', color: 'Tigree', weight: 4.2, microchip: '250269887654321', chronicConditions: 'Cystite recurrente', ownerId: 0 },
    // Claire Petit (owners[1])
    { name: 'Rocky', species: 'DOG', breed: 'Bouledogue Francais', birthDate: new Date('2023-01-10'), gender: 'MALE', color: 'Bringe', weight: 12.8, microchip: '250269811112222', allergies: 'Allergie aux acariens', ownerId: 1 },
    { name: 'Noisette', species: 'RABBIT', breed: 'Nain Belier', birthDate: new Date('2023-06-01'), gender: 'FEMALE', color: 'Roux', weight: 1.8, ownerId: 1 },
    // Marc Durand (owners[2])
    { name: 'Oscar', species: 'DOG', breed: 'Berger Australien', birthDate: new Date('2020-09-12'), gender: 'MALE', color: 'Bleu merle', weight: 28.0, microchip: '250269833334444', ownerId: 2 },
    { name: 'Mia', species: 'CAT', breed: 'Maine Coon', birthDate: new Date('2021-11-05'), gender: 'FEMALE', color: 'Brown tabby', weight: 6.8, microchip: '250269855556666', ownerId: 2 },
    { name: 'Coco', species: 'BIRD', breed: 'Perruche ondulée', birthDate: new Date('2024-02-14'), gender: 'MALE', color: 'Vert et jaune', weight: 0.035, ownerId: 2 },
    // Amelie Moreau (owners[3])
    { name: 'Bella', species: 'DOG', breed: 'Cavalier King Charles', birthDate: new Date('2022-04-22'), gender: 'FEMALE', color: 'Blenheim', weight: 7.5, microchip: '250269877778888', chronicConditions: 'Souffle cardiaque grade 2', ownerId: 3 },
    { name: 'Felix', species: 'CAT', breed: 'British Shorthair', birthDate: new Date('2023-08-30'), gender: 'MALE', color: 'Bleu', weight: 5.1, microchip: '250269899990000', ownerId: 3 },
    // Thomas Garcia (owners[4])
    { name: 'Rex', species: 'DOG', breed: 'Malinois', birthDate: new Date('2019-06-18'), gender: 'MALE', color: 'Fauve charbonne', weight: 30.2, microchip: '250269822223333', ownerId: 4 },
    { name: 'Gizmo', species: 'RODENT', breed: 'Hamster dore', birthDate: new Date('2025-03-01'), gender: 'MALE', color: 'Dore', weight: 0.14, ownerId: 4 },
    { name: 'Ziggy', species: 'REPTILE', breed: 'Gecko leopard', birthDate: new Date('2024-01-15'), gender: 'MALE', color: 'Orange et blanc', weight: 0.065, ownerId: 4 },
  ];

  const animals = [];
  for (const a of animalDefs) {
    const animal = await prisma.animal.create({
      data: {
        name: a.name, species: a.species, breed: a.breed,
        birthDate: a.birthDate, gender: a.gender, color: a.color,
        weight: a.weight, microchip: a.microchip || undefined,
        allergies: a.allergies, chronicConditions: a.chronicConditions,
        notes: a.notes,
        ownerId: owners[a.ownerId].id,
        clinicId: clinic1.id,
        createdById: vet1.id,
      },
    });
    animals.push(animal);
  }
  console.log('Animaux: ' + animalDefs.map(a => a.name).join(', ') + ` (${animals.length})`);

  // ============================================
  // 5. VACCINATIONS (exhaustives)
  // ============================================
  const vaccDefs = [
    // Max
    { name: 'Rage', date: d(-180, 10), nextDueDate: d(185, 10), batchNumber: 'RAB-2025-001', vet: 'Dr. Dupont', animalIdx: 0 },
    { name: 'CHPL (Maladie de Carre, Hepatite, Parvovirose, Leptospirose)', date: d(-90, 10), nextDueDate: d(275, 10), batchNumber: 'CHPL-2025-042', vet: 'Dr. Dupont', animalIdx: 0 },
    { name: 'Toux du chenil (Bordetella)', date: d(-60, 14), nextDueDate: d(305, 14), batchNumber: 'KC-2025-015', vet: 'Dr. Rousseau', animalIdx: 0 },
    // Luna
    { name: 'Typhus (RCP)', date: d(-120, 11), nextDueDate: d(245, 11), batchNumber: 'RCP-2025-018', vet: 'Dr. Dupont', animalIdx: 1 },
    { name: 'Leucose (FeLV)', date: d(-120, 11), nextDueDate: d(245, 11), batchNumber: 'FELV-2025-009', vet: 'Dr. Dupont', animalIdx: 1 },
    // Rocky
    { name: 'Rage', date: d(-30, 9), nextDueDate: d(335, 9), batchNumber: 'RAB-2025-088', vet: 'Dr. Dupont', animalIdx: 2 },
    { name: 'CHPL', date: d(-200, 15), nextDueDate: d(165, 15), batchNumber: 'CHPL-2025-067', vet: 'Dr. Rousseau', animalIdx: 2 },
    // Noisette
    { name: 'VHD + Myxomatose', date: d(-150, 10), nextDueDate: d(215, 10), batchNumber: 'VHD-2025-007', vet: 'Dr. Dupont', animalIdx: 3 },
    // Oscar
    { name: 'Rage', date: d(-45, 10), nextDueDate: d(320, 10), batchNumber: 'RAB-2025-102', vet: 'Dr. Dupont', animalIdx: 4 },
    { name: 'CHPL', date: d(-45, 10), nextDueDate: d(320, 10), batchNumber: 'CHPL-2025-091', vet: 'Dr. Dupont', animalIdx: 4 },
    { name: 'Piroplasmose', date: d(-45, 11), nextDueDate: d(320, 11), batchNumber: 'PIRO-2025-003', vet: 'Dr. Rousseau', animalIdx: 4 },
    // Mia
    { name: 'RCP', date: d(-100, 14), nextDueDate: d(265, 14), batchNumber: 'RCP-2025-055', vet: 'Dr. Rousseau', animalIdx: 5 },
    // Bella
    { name: 'CHPL', date: d(-75, 10), nextDueDate: d(290, 10), batchNumber: 'CHPL-2025-078', vet: 'Dr. Dupont', animalIdx: 7 },
    { name: 'Rage', date: d(-75, 10), nextDueDate: d(290, 10), batchNumber: 'RAB-2025-110', vet: 'Dr. Dupont', animalIdx: 7 },
    // Felix
    { name: 'RCP', date: d(-50, 15), nextDueDate: d(315, 15), batchNumber: 'RCP-2025-071', vet: 'Dr. Rousseau', animalIdx: 8 },
    // Rex
    { name: 'Rage', date: d(-20, 10), nextDueDate: d(345, 10), batchNumber: 'RAB-2025-120', vet: 'Dr. Dupont', animalIdx: 9 },
    { name: 'CHPL', date: d(-20, 10), nextDueDate: d(345, 10), batchNumber: 'CHPL-2025-099', vet: 'Dr. Dupont', animalIdx: 9 },
    { name: 'Leptospirose (rappel)', date: d(-20, 11), nextDueDate: d(160, 11), batchNumber: 'LEPTO-2025-044', vet: 'Dr. Rousseau', animalIdx: 9 },
  ];

  for (const v of vaccDefs) {
    await prisma.vaccination.create({
      data: {
        name: v.name, date: v.date, nextDueDate: v.nextDueDate,
        batchNumber: v.batchNumber, veterinarian: v.vet,
        animalId: animals[v.animalIdx].id,
      },
    });
  }
  console.log(`Vaccinations: ${vaccDefs.length} enregistrements`);

  // ============================================
  // 6. RENDEZ-VOUS (15 RDV varies)
  // ============================================
  const aptDefs = [
    // Aujourd'hui
    { date: d(0, 9, 0), duration: 30, type: 'CONSULTATION', status: 'CONFIRMED', reason: 'Boiterie patte avant droite', animalIdx: 0, vetId: vet1.id },
    { date: d(0, 9, 30), duration: 20, type: 'VACCINATION', status: 'CONFIRMED', reason: 'Rappel vaccin annuel', animalIdx: 2, vetId: vet1.id },
    { date: d(0, 10, 30), duration: 45, type: 'SURGERY', status: 'CONFIRMED', reason: 'Detartrage', animalIdx: 7, vetId: vet2.id, isUrgent: false },
    { date: d(0, 11, 0), duration: 30, type: 'CONSULTATION', status: 'CONFIRMED', reason: 'Vomissements repetitifs', animalIdx: 5, vetId: vet1.id },
    { date: d(0, 14, 0), duration: 20, type: 'FOLLOWUP', status: 'PENDING', reason: 'Controle post-castration', animalIdx: 8, vetId: vet2.id },
    // Demain
    { date: d(1, 9, 0), duration: 30, type: 'CONSULTATION', status: 'PENDING', reason: 'Perte de poils anormale', animalIdx: 4, vetId: vet1.id },
    { date: d(1, 10, 0), duration: 30, type: 'FOLLOWUP', status: 'PENDING', reason: 'Controle post-operation', animalIdx: 1, vetId: vet1.id },
    { date: d(1, 11, 0), duration: 20, type: 'VACCINATION', status: 'PENDING', reason: 'Primo-vaccination chaton', animalIdx: 8, vetId: vet2.id },
    { date: d(1, 14, 30), duration: 30, type: 'CONSULTATION', status: 'PENDING', reason: 'Difficultés respiratoires', animalIdx: 2, vetId: vet2.id },
    // Cette semaine
    { date: d(3, 9, 30), duration: 30, type: 'GROOMING', status: 'PENDING', reason: 'Toilettage et coupe ongles', animalIdx: 0, vetId: vet1.id },
    { date: d(3, 11, 0), duration: 20, type: 'CONSULTATION', status: 'PENDING', reason: 'Check-up annuel', animalIdx: 9, vetId: vet1.id },
    { date: d(4, 10, 0), duration: 30, type: 'EMERGENCY', status: 'PENDING', reason: 'Ingestion corps etranger', animalIdx: 2, vetId: vet2.id, isUrgent: true },
    // Passes (completes)
    { date: d(-7, 10, 0), duration: 30, type: 'CONSULTATION', status: 'COMPLETED', reason: 'Visite annuelle de controle', animalIdx: 0, vetId: vet1.id },
    { date: d(-14, 14, 0), duration: 45, type: 'SURGERY', status: 'COMPLETED', reason: 'Sterilisation', animalIdx: 1, vetId: vet2.id },
    { date: d(-21, 9, 0), duration: 20, type: 'VACCINATION', status: 'COMPLETED', reason: 'Rappel vaccin', animalIdx: 4, vetId: vet1.id },
  ];

  const appointments = [];
  for (const a of aptDefs) {
    const apt = await prisma.appointment.create({
      data: {
        date: a.date, duration: a.duration, type: a.type,
        status: a.status, reason: a.reason, isUrgent: a.isUrgent || false,
        animalId: animals[a.animalIdx].id,
        clinicId: clinic1.id, veterinarianId: a.vetId,
      },
    });
    appointments.push(apt);
  }
  console.log(`Rendez-vous: ${aptDefs.length}`);

  // ============================================
  // 7. CONSULTATIONS (8 detaillees)
  // ============================================
  const consultDefs = [
    {
      date: d(-7), reason: 'Visite annuelle de controle', symptoms: 'Aucun symptome particulier',
      diagnosis: 'Animal en bonne sante generale. Leger tartre dentaire.',
      treatment: 'Aucun traitement necessaire. Detartrage recommande dans 6 mois. Rappel vaccin dans 3 mois.',
      temperature: 38.5, heartRate: 80, weight: 32.5,
      animalIdx: 0, vetId: vet1.id, aptIdx: 12,
    },
    {
      date: d(-14), reason: 'Sterilisation',
      symptoms: 'Intervention programmee',
      diagnosis: 'Sterilisation realisee sans complication. Ovariectomie par laparoscopie.',
      treatment: 'Metacam 0.5mg/kg pendant 5 jours. Collerette 10 jours. Retrait fils J+12.',
      temperature: 38.8, heartRate: 140, weight: 4.1,
      animalIdx: 1, vetId: vet2.id, aptIdx: 13,
    },
    {
      date: d(-21), reason: 'Rappel vaccin + check-up',
      symptoms: 'Legere toux depuis 3 jours',
      diagnosis: 'Tracheobronchite benigne. Vaccination effectuee.',
      treatment: 'Toux du chenil - Doxycycline 5mg/kg pendant 10 jours. Repos modere.',
      temperature: 38.6, heartRate: 75, weight: 28.3,
      animalIdx: 4, vetId: vet1.id, aptIdx: 14,
    },
    {
      date: d(-30), reason: 'Dermatite atopique',
      symptoms: 'Demangeaisons intenses, rougeurs au niveau des plis, lecher excessif des pattes',
      diagnosis: 'Dermatite atopique canine confirmee. Test allergique recommande.',
      treatment: 'Apoquel 16mg 1x/jour pendant 14 jours. Shampooing Allermyl 2x/semaine. Regime hypoallergenique.',
      temperature: 38.9, heartRate: 100, weight: 12.6,
      animalIdx: 2, vetId: vet2.id, aptIdx: null,
    },
    {
      date: d(-45), reason: 'Consultation cardiologique',
      symptoms: 'Essoufflement a l\'effort, toux nocturne occasionnelle',
      diagnosis: 'Maladie valvulaire mitrale degenerative stade B1. Souffle grade 2/6.',
      treatment: 'Surveillance clinique. Echocardiographie de controle dans 6 mois. Regime pauvre en sodium.',
      temperature: 38.4, heartRate: 130, weight: 7.4,
      animalIdx: 7, vetId: vet1.id, aptIdx: null,
    },
    {
      date: d(-60), reason: 'Cystite recurrente',
      symptoms: 'Miaulements a la litiere, urine en petites quantites frequentes, traces de sang',
      diagnosis: 'Cystite idiopathique feline (CIF). Analyse urinaire: cristaux d\'oxalate.',
      treatment: 'Metacam pendant 5 jours. Alimentation urinaire Royal Canin Urinary. Fontaine a eau recommandee.',
      temperature: 39.1, heartRate: 160, weight: 4.3,
      animalIdx: 1, vetId: vet1.id, aptIdx: null,
    },
    {
      date: d(-90), reason: 'Visite de sante lapin',
      symptoms: 'RAS - visite de routine',
      diagnosis: 'Bon etat general. Dents en bon etat. Poids normal.',
      treatment: 'Aucun traitement. Maintenir alimentation riche en foin.',
      temperature: 38.8, heartRate: 210, weight: 1.85,
      animalIdx: 3, vetId: vet2.id, aptIdx: null,
    },
    {
      date: d(-10), reason: 'Boiterie membre posterieur',
      symptoms: 'Boiterie grade 2/5 membre posterieur droit, apparue apres promenade',
      diagnosis: 'Entorse du ligament croise anterieur partielle. Radiographies sans anomalie osseuse.',
      treatment: 'Repos strict 3 semaines. Metacam 0.1mg/kg 7 jours. Glucosamine/chondroitine. Reevaluation J+21.',
      temperature: 38.7, heartRate: 88, weight: 30.0,
      animalIdx: 9, vetId: vet1.id, aptIdx: null,
    },
  ];

  for (const c of consultDefs) {
    await prisma.consultation.create({
      data: {
        date: c.date, reason: c.reason, symptoms: c.symptoms,
        diagnosis: c.diagnosis, treatment: c.treatment,
        temperature: c.temperature, heartRate: c.heartRate, weight: c.weight,
        animalId: animals[c.animalIdx].id,
        veterinarianId: c.vetId,
        appointmentId: c.aptIdx !== null ? appointments[c.aptIdx].id : undefined,
      },
    });
  }
  console.log(`Consultations: ${consultDefs.length}`);

  // ============================================
  // 8. MEDICAMENTS (10)
  // ============================================
  const meds = [];
  const medDefs = [
    { name: 'Metacam 1.5mg/ml', category: 'Anti-inflammatoire', dosage: '0.1mg/kg', sideEffects: 'Troubles digestifs possibles', contraindications: 'Insuffisance renale' },
    { name: 'Apoquel 16mg', category: 'Anti-prurigineux', dosage: '0.4-0.6mg/kg', sideEffects: 'Vomissements, diarrhee', contraindications: 'Chien < 12 mois' },
    { name: 'Amoxicilline 250mg', category: 'Antibiotique', dosage: '12.5mg/kg', sideEffects: 'Troubles digestifs', contraindications: 'Allergie penicillines' },
    { name: 'Doxycycline 100mg', category: 'Antibiotique', dosage: '5mg/kg', sideEffects: 'Nausees, photosensibilite', contraindications: 'Gestation, jeunes animaux' },
    { name: 'Glucosamine-Chondroitine', category: 'Complement articulaire', dosage: 'Selon poids', sideEffects: 'Aucun connu', contraindications: 'Aucune' },
    { name: 'Cerenia 16mg', category: 'Anti-emetique', dosage: '2mg/kg', sideEffects: 'Somnolence', contraindications: 'Chiot < 16 semaines' },
    { name: 'Furosemide 40mg', category: 'Diuretique', dosage: '2-4mg/kg', sideEffects: 'Deshydratation, hypokaliemie', contraindications: 'Insuffisance renale anurique' },
    { name: 'Clavamox 250mg', category: 'Antibiotique', dosage: '12.5-25mg/kg', sideEffects: 'Vomissements, diarrhee', contraindications: 'Allergie penicillines' },
    { name: 'Prednisolone 5mg', category: 'Corticoide', dosage: '0.5-2mg/kg', sideEffects: 'PUPD, polyphagie', contraindications: 'Diabete, infection active' },
    { name: 'Frontline Combo', category: 'Antiparasitaire', dosage: '1 pipette/mois', sideEffects: 'Irritation locale possible', contraindications: 'Chaton < 8 semaines' },
  ];

  for (const m of medDefs) {
    const med = await prisma.medication.create({ data: m });
    meds.push(med);
  }
  console.log(`Medicaments: ${medDefs.length}`);

  // ============================================
  // 9. PRESCRIPTIONS (6)
  // ============================================
  // We need consultation IDs, so query them
  const allConsults = await prisma.consultation.findMany({ orderBy: { date: 'desc' } });

  const prescDefs = [
    { dosage: '0.1mg/kg', frequency: '1 fois par jour', duration: '7 jours', instructions: 'Donner apres le repas', startDate: d(-10), endDate: d(-3), animalIdx: 9, medIdx: 0 },
    { dosage: '16mg', frequency: '1 fois par jour', duration: '14 jours', instructions: 'Le matin a jeun', startDate: d(-30), endDate: d(-16), animalIdx: 2, medIdx: 1 },
    { dosage: '5mg/kg', frequency: '2 fois par jour', duration: '10 jours', instructions: 'Avec nourriture', startDate: d(-21), endDate: d(-11), animalIdx: 4, medIdx: 3 },
    { dosage: '0.5mg/kg', frequency: '1 fois par jour', duration: '5 jours', instructions: 'Apres repas', startDate: d(-14), endDate: d(-9), animalIdx: 1, medIdx: 0 },
    { dosage: '1 comprime', frequency: '1 fois par jour', duration: '21 jours', instructions: 'Continuer meme apres amelioration', startDate: d(-10), endDate: d(11), animalIdx: 9, medIdx: 4 },
    { dosage: '0.5mg/kg', frequency: '1 fois par jour', duration: '5 jours', instructions: 'Apres le repas du soir', startDate: d(-60), endDate: d(-55), animalIdx: 1, medIdx: 0 },
  ];

  for (const p of prescDefs) {
    const consultForAnimal = allConsults.find(c => c.animalId === animals[p.animalIdx].id);
    if (consultForAnimal) {
      await prisma.prescription.create({
        data: {
          dosage: p.dosage, frequency: p.frequency, duration: p.duration,
          instructions: p.instructions, startDate: p.startDate, endDate: p.endDate,
          animalId: animals[p.animalIdx].id,
          medicationId: meds[p.medIdx].id,
          consultationId: consultForAnimal.id,
        },
      });
    }
  }
  console.log(`Prescriptions: ${prescDefs.length}`);

  // ============================================
  // 10. CERTIFICATS (6)
  // ============================================
  const certDefs = [
    { type: 'HEALTH', issueDate: d(-7), expiryDate: d(358), content: { purpose: 'Bonne sante generale', notes: 'Apte au transport et a la vie en collectivite' }, animalIdx: 0, vetId: vet1.id },
    { type: 'VACCINATION', issueDate: d(-45), expiryDate: d(320), content: { vaccines: ['Rage', 'CHPL', 'Piroplasmose'], notes: 'Vaccinations a jour' }, animalIdx: 4, vetId: vet1.id },
    { type: 'TRAVEL', issueDate: d(-30), expiryDate: d(60), content: { destination: 'Espagne', notes: 'Animal apte au voyage. Passeport europeen a jour.' }, animalIdx: 2, vetId: vet1.id },
    { type: 'HEALTH', issueDate: d(-14), expiryDate: d(351), content: { purpose: 'Post-chirurgical', notes: 'Sterilisation realisee, bonne cicatrisation' }, animalIdx: 1, vetId: vet2.id },
    { type: 'BREEDING', issueDate: d(-90), content: { purpose: 'Aptitude reproduction', notes: 'Animal apte a la reproduction. Tests genetiques OK.' }, animalIdx: 0, vetId: vet1.id },
    { type: 'INSURANCE', issueDate: d(-60), expiryDate: d(305), content: { insurer: 'SantéVet', policy: 'Premium', notes: 'Couverture accidents + maladies' }, animalIdx: 7, vetId: vet2.id },
  ];

  for (const c of certDefs) {
    await prisma.certificate.create({
      data: {
        type: c.type, issueDate: c.issueDate, expiryDate: c.expiryDate,
        content: c.content,
        animalId: animals[c.animalIdx].id, veterinarianId: c.vetId,
      },
    });
  }
  console.log(`Certificats: ${certDefs.length}`);

  // ============================================
  // 11. INVENTAIRE (15 articles)
  // ============================================
  const invDefs = [
    { name: 'Vaccin Rage (Rabisin)', category: 'VACCINE', quantity: 25, minStock: 10, unit: 'doses', price: 12.50 },
    { name: 'Vaccin CHPL (Eurican)', category: 'VACCINE', quantity: 18, minStock: 8, unit: 'doses', price: 15.00 },
    { name: 'Vaccin RCP (Feligen)', category: 'VACCINE', quantity: 12, minStock: 5, unit: 'doses', price: 14.00 },
    { name: 'Amoxicilline 250mg', category: 'MEDICATION', quantity: 50, minStock: 20, unit: 'comprimes', price: 0.45 },
    { name: 'Metacam 1.5mg/ml', category: 'MEDICATION', quantity: 12, minStock: 5, unit: 'flacons', price: 18.90 },
    { name: 'Apoquel 16mg', category: 'MEDICATION', quantity: 30, minStock: 10, unit: 'comprimes', price: 2.80 },
    { name: 'Doxycycline 100mg', category: 'MEDICATION', quantity: 40, minStock: 15, unit: 'comprimes', price: 0.65 },
    { name: 'Frontline Combo chien M', category: 'MEDICATION', quantity: 20, minStock: 8, unit: 'pipettes', price: 6.50 },
    { name: 'Compresses steriles', category: 'SUPPLY', quantity: 200, minStock: 50, unit: 'pieces', price: 0.15 },
    { name: 'Gants latex M', category: 'SUPPLY', quantity: 3, minStock: 5, unit: 'boites', price: 8.50 },
    { name: 'Seringues 5ml', category: 'SUPPLY', quantity: 150, minStock: 50, unit: 'pieces', price: 0.12 },
    { name: 'Fils suture Vicryl 3-0', category: 'EQUIPMENT', quantity: 15, minStock: 10, unit: 'sachets', price: 4.20 },
    { name: 'Croquettes Royal Canin Recovery', category: 'FOOD', quantity: 8, minStock: 3, unit: 'sachets', price: 4.20 },
    { name: 'Croquettes Hill\'s i/d', category: 'FOOD', quantity: 6, minStock: 3, unit: 'sachets', price: 5.10 },
    { name: 'Collerette carcan taille M', category: 'EQUIPMENT', quantity: 5, minStock: 3, unit: 'pieces', price: 12.00 },
  ];

  for (const inv of invDefs) {
    await prisma.inventoryItem.create({
      data: { ...inv, clinicId: clinic1.id },
    });
  }
  console.log(`Inventaire: ${invDefs.length} articles`);

  // ============================================
  // 12. FACTURES (8)
  // ============================================
  const invoiceDefs = [
    {
      number: 'FAC-2026-001', date: d(-7), status: 'PAID', subtotal: 55, tax: 11, total: 66, paidAmount: 66, paymentMethod: 'CB', paymentDate: d(-7),
      items: [{ description: 'Consultation generale', quantity: 1, unitPrice: 45, total: 45 }, { description: 'Vaccin CHPL', quantity: 1, unitPrice: 10, total: 10 }],
      ownerIdx: 0,
    },
    {
      number: 'FAC-2026-002', date: d(-14), status: 'PAID', subtotal: 280, tax: 56, total: 336, paidAmount: 336, paymentMethod: 'CB', paymentDate: d(-12),
      items: [{ description: 'Sterilisation chatte (laparoscopie)', quantity: 1, unitPrice: 250, total: 250 }, { description: 'Metacam 5j', quantity: 1, unitPrice: 15, total: 15 }, { description: 'Collerette', quantity: 1, unitPrice: 15, total: 15 }],
      ownerIdx: 0,
    },
    {
      number: 'FAC-2026-003', date: d(0), status: 'PENDING', subtotal: 45, tax: 9, total: 54,
      items: [{ description: 'Consultation generale', quantity: 1, unitPrice: 45, total: 45 }],
      ownerIdx: 1,
    },
    {
      number: 'FAC-2026-004', date: d(-30), status: 'PAID', subtotal: 95, tax: 19, total: 114, paidAmount: 114, paymentMethod: 'Cheque', paymentDate: d(-28),
      items: [{ description: 'Consultation dermatologie', quantity: 1, unitPrice: 65, total: 65 }, { description: 'Apoquel 14j', quantity: 1, unitPrice: 30, total: 30 }],
      ownerIdx: 1,
    },
    {
      number: 'FAC-2026-005', date: d(-21), status: 'PAID', subtotal: 75, tax: 15, total: 90, paidAmount: 90, paymentMethod: 'CB', paymentDate: d(-21),
      items: [{ description: 'Consultation + Vaccination', quantity: 1, unitPrice: 55, total: 55 }, { description: 'Doxycycline 10j', quantity: 1, unitPrice: 20, total: 20 }],
      ownerIdx: 2,
    },
    {
      number: 'FAC-2026-006', date: d(-45), status: 'PAID', subtotal: 120, tax: 24, total: 144, paidAmount: 144, paymentMethod: 'CB', paymentDate: d(-45),
      items: [{ description: 'Consultation cardiologie', quantity: 1, unitPrice: 85, total: 85 }, { description: 'Echocardiographie', quantity: 1, unitPrice: 35, total: 35 }],
      ownerIdx: 3,
    },
    {
      number: 'FAC-2026-007', date: d(-10), status: 'PARTIAL', subtotal: 110, tax: 22, total: 132, paidAmount: 66, paymentMethod: 'CB', paymentDate: d(-10),
      items: [{ description: 'Consultation urgence + Radio', quantity: 1, unitPrice: 90, total: 90 }, { description: 'Traitement', quantity: 1, unitPrice: 20, total: 20 }],
      ownerIdx: 4,
    },
    {
      number: 'FAC-2026-008', date: d(-60), status: 'OVERDUE', subtotal: 55, tax: 11, total: 66, dueDate: d(-30),
      items: [{ description: 'Consultation + Analyse urinaire', quantity: 1, unitPrice: 55, total: 55 }],
      ownerIdx: 0,
    },
  ];

  for (const inv of invoiceDefs) {
    await prisma.invoice.create({
      data: {
        number: inv.number, date: inv.date, status: inv.status,
        subtotal: inv.subtotal, tax: inv.tax, total: inv.total,
        paidAmount: inv.paidAmount || 0, paymentMethod: inv.paymentMethod,
        paymentDate: inv.paymentDate, dueDate: inv.dueDate,
        items: inv.items,
        ownerId: owners[inv.ownerIdx].id, clinicId: clinic1.id,
      },
    });
  }
  console.log(`Factures: ${invoiceDefs.length}`);

  // ============================================
  // 13. MESSAGES (10 conversations realistes)
  // ============================================
  const msgDefs = [
    { subject: 'Question sur le traitement de Max', content: 'Bonjour Docteur, Max semble avoir des demangeaisons depuis le changement de croquettes. Est-ce normal ? Il se gratte surtout au niveau du ventre.', ownerId: owners[0].id },
    { content: 'Bonjour M. Bernard, les demangeaisons peuvent etre liees au changement alimentaire. Essayez une transition progressive sur 7 jours en melangeant les croquettes. Si ca persiste au-dela de 10 jours, prenez RDV pour un bilan allergique.', senderId: vet1.id },
    { subject: 'Rocky et les yeux rouges', content: 'Bonjour, Rocky a les yeux rouges depuis hier soir et il cligne beaucoup. Est-ce que je dois m\'inquieter ?', ownerId: owners[1].id },
    { content: 'Bonjour Mme Petit, les yeux rouges peuvent indiquer une conjonctivite ou un corps etranger. Nettoyez avec du serum physiologique et surveillez. Si ca ne s\'ameliore pas en 24h ou si un oeil se ferme, prenez RDV rapidement.', senderId: vet2.id },
    { subject: 'Alimentation Oscar', content: 'Bonjour, Oscar refuse de manger ses croquettes depuis 2 jours mais accepte les friandises. Que me conseillez-vous ?', ownerId: owners[2].id },
    { content: 'Bonjour M. Durand, si Oscar mange les friandises mais pas les croquettes, c\'est probablement un probleme de preference. Ne cedez pas aux friandises. Proposez uniquement les croquettes 15 min puis retirez. Si apres 48h il ne mange toujours pas, consultez.', senderId: vet1.id },
    { subject: 'Rappel vaccin Bella', content: 'Bonjour, est-ce que je peux reporter le rappel de vaccin de Bella de 2 semaines ? Nous sommes en deplacement.', ownerId: owners[3].id },
    { content: 'Bonjour Mme Moreau, oui un decalage de 2 semaines est acceptable pour le rappel. N\'hesitez pas a reprendre RDV des votre retour. Bon voyage !', senderId: vet1.id },
    { subject: 'Urgence Rex', content: 'Bonjour, Rex boite beaucoup depuis sa promenade et il refuse de poser la patte. Je suis tres inquiet, est-ce grave ?', ownerId: owners[4].id },
    { content: 'Bonjour M. Garcia, une boiterie aigue avec refus de poser la patte necessite une consultation rapide. Venez demain matin en urgence, nous ferons une radio. En attendant, limitez ses deplacements.', senderId: vet1.id },
  ];

  for (const m of msgDefs) {
    await prisma.message.create({ data: m });
  }
  console.log(`Messages: ${msgDefs.length}`);

  // ============================================
  // 14. NOTIFICATIONS (12)
  // ============================================
  const notifDefs = [
    { type: 'APPOINTMENT', title: 'Nouveau rendez-vous', message: 'Max - Consultation a 9h00 aujourd\'hui', userId: vet1.id },
    { type: 'APPOINTMENT', title: 'Rendez-vous confirme', message: 'Rocky - Vaccination a 9h30 aujourd\'hui', userId: vet1.id },
    { type: 'APPOINTMENT', title: 'Chirurgie programmee', message: 'Bella - Detartrage a 10h30 aujourd\'hui', userId: vet2.id },
    { type: 'STOCK_ALERT', title: 'Stock critique', message: 'Gants latex M : seulement 3 boites (seuil: 5)', userId: admin.id },
    { type: 'PAYMENT', title: 'Paiement recu', message: 'FAC-2026-001 payee par Lucas Bernard (66.00 EUR)', userId: admin.id },
    { type: 'PAYMENT', title: 'Facture en retard', message: 'FAC-2026-008 impayee depuis 30 jours - Lucas Bernard', userId: admin.id },
    { type: 'REMINDER', title: 'Rappel vaccination', message: 'Rocky - Rappel CHPL prevu dans 15 jours', userId: vet1.id },
    { type: 'MESSAGE', title: 'Nouveau message', message: 'Thomas Garcia vous a envoye un message concernant Rex', userId: vet1.id },
    { type: 'SYSTEM', title: 'Bienvenue sur PawcketVet', message: 'Votre clinique est configuree et prete.', userId: admin.id, isRead: true },
    { type: 'APPOINTMENT', title: 'RDV annule', message: 'Le RDV de Mia du 15/01 a ete annule par le proprietaire', userId: vet1.id, isRead: true },
    { type: 'SYSTEM', title: 'Mise a jour systeme', message: 'PawcketVet v2.1 - Carnet de sante numerique disponible', userId: admin.id },
    { type: 'REMINDER', title: 'Rappel suivi', message: 'Bella - Echocardiographie de controle prevue ce mois', userId: vet1.id },
  ];

  for (const n of notifDefs) {
    await prisma.notification.create({ data: n });
  }
  console.log(`Notifications: ${notifDefs.length}`);

  // ============================================
  // 15. RAPPELS (8)
  // ============================================
  const reminderDefs = [
    { type: 'VACCINATION', scheduledFor: d(15), channel: 'EMAIL', recipient: 'client@test.fr', subject: 'Rappel vaccination Max', message: 'Le rappel de vaccination CHPL de Max est prevu le mois prochain. Prenez rendez-vous.' },
    { type: 'VACCINATION', scheduledFor: d(30), channel: 'EMAIL', recipient: 'claire@test.fr', subject: 'Rappel vaccination Rocky', message: 'Le rappel de vaccination de Rocky arrive bientot.' },
    { type: 'FOLLOWUP', scheduledFor: d(7), channel: 'EMAIL', recipient: 'client@test.fr', subject: 'Controle Luna', message: 'N\'oubliez pas le controle post-sterilisation de Luna.' },
    { type: 'APPOINTMENT', scheduledFor: d(1, 8, 0), channel: 'EMAIL', recipient: 'marc@test.fr', subject: 'Rappel RDV Oscar', message: 'Rappel: RDV demain a 9h00 pour Oscar.' },
    { type: 'PAYMENT', scheduledFor: d(3), channel: 'EMAIL', recipient: 'client@test.fr', subject: 'Facture en attente', message: 'La facture FAC-2026-008 est en attente de paiement.' },
    { type: 'BIRTHDAY', scheduledFor: d(28), channel: 'EMAIL', recipient: 'amelie@test.fr', subject: 'Joyeux anniversaire Bella !', message: 'Bella fete bientot ses 4 ans ! L\'equipe VetoPaws lui souhaite un bon anniversaire.' },
    { type: 'VACCINATION', scheduledFor: d(45), channel: 'EMAIL', recipient: 'thomas@test.fr', subject: 'Rappel vaccination Rex', message: 'Le rappel Leptospirose de Rex est prevu.' },
    { type: 'FOLLOWUP', scheduledFor: d(14), channel: 'EMAIL', recipient: 'thomas@test.fr', subject: 'Controle Rex', message: 'Reevaluation de la boiterie de Rex dans 2 semaines.' },
  ];

  for (const r of reminderDefs) {
    await prisma.reminder.create({ data: r });
  }
  console.log(`Rappels: ${reminderDefs.length}`);

  // ============================================
  // 16. WEIGHT HISTORY (pour courbe poids)
  // ============================================
  const weightDefs = [
    { weight: 30.0, date: d(-365), animalId: animals[0].id },
    { weight: 31.2, date: d(-270), animalId: animals[0].id },
    { weight: 31.8, date: d(-180), animalId: animals[0].id },
    { weight: 32.0, date: d(-90), animalId: animals[0].id },
    { weight: 32.5, date: d(-7), animalId: animals[0].id },
    { weight: 3.5, date: d(-300), animalId: animals[1].id },
    { weight: 3.8, date: d(-200), animalId: animals[1].id },
    { weight: 4.1, date: d(-100), animalId: animals[1].id },
    { weight: 4.3, date: d(-60), animalId: animals[1].id },
    { weight: 4.2, date: d(-14), animalId: animals[1].id },
    { weight: 10.5, date: d(-200), animalId: animals[2].id },
    { weight: 11.8, date: d(-120), animalId: animals[2].id },
    { weight: 12.6, date: d(-30), animalId: animals[2].id },
    { weight: 26.0, date: d(-180), animalId: animals[4].id },
    { weight: 27.5, date: d(-90), animalId: animals[4].id },
    { weight: 28.3, date: d(-21), animalId: animals[4].id },
    { weight: 7.2, date: d(-120), animalId: animals[7].id },
    { weight: 7.4, date: d(-45), animalId: animals[7].id },
  ];

  for (const w of weightDefs) {
    await prisma.weightHistory.create({ data: w });
  }
  console.log(`Historique poids: ${weightDefs.length}`);

  // ============================================
  // 17. REVIEWS (4)
  // ============================================
  const reviewDefs = [
    { rating: 5, comment: 'Equipe formidable et tres attentionnee. Le Dr Dupont a sauve notre Max. Merci !', ownerName: 'Lucas Bernard', ownerEmail: 'client@test.fr', isVerified: true, isPublished: true, response: 'Merci beaucoup Lucas ! Max est un patient formidable. A bientot pour la visite de controle.' },
    { rating: 4, comment: 'Bonne clinique, tarifs raisonnables. Petit temps d\'attente parfois.', ownerName: 'Marc Durand', ownerEmail: 'marc@test.fr', isVerified: true, isPublished: true },
    { rating: 5, comment: 'Dr Rousseau est exceptionnelle avec les animaux nerveux. Bella etait si calme !', ownerName: 'Amelie Moreau', ownerEmail: 'amelie@test.fr', isVerified: true, isPublished: true },
    { rating: 3, comment: 'Le suivi est bien, mais la prise de RDV par telephone est parfois compliquee.', ownerName: 'Thomas Garcia', ownerEmail: 'thomas@test.fr', isVerified: true, isPublished: false },
  ];

  for (const r of reviewDefs) {
    await prisma.review.create({ data: { ...r, clinicId: clinic1.id } });
  }
  console.log(`Avis: ${reviewDefs.length}`);

  // ============================================
  // 18. TEMPLATES (3)
  // ============================================
  const templates = [
    { name: 'Consultation generale', type: 'CONSULTATION', template: { sections: ['Motif', 'Examen clinique', 'Diagnostic', 'Traitement', 'Notes'] }, clinicId: clinic1.id },
    { name: 'Visite vaccinale', type: 'VACCINATION', template: { sections: ['Vaccin', 'N° lot', 'Voie administration', 'Reactions'], checkList: ['Examen general', 'Temperature', 'Auscultation'] }, clinicId: clinic1.id },
    { name: 'Chirurgie standard', type: 'SURGERY', template: { sections: ['Anesthesie', 'Procedure', 'Complications', 'Post-op'], preOp: ['Jeune 12h', 'Bilan sanguin', 'ECG'] }, clinicId: clinic1.id },
  ];

  for (const t of templates) {
    await prisma.consultationTemplate.create({ data: t });
  }
  console.log(`Templates: ${templates.length}`);

  // ============================================
  // 19. ACTIVITY LOGS (10)
  // ============================================
  const logDefs = [
    { action: 'CREATE', entity: 'Appointment', entityId: appointments[0].id, details: { type: 'CONSULTATION', animal: 'Max' }, userId: assistant.id },
    { action: 'UPDATE', entity: 'Appointment', entityId: appointments[1].id, details: { status: 'CONFIRMED' }, userId: assistant.id },
    { action: 'CREATE', entity: 'Consultation', entityId: allConsults[0].id, details: { animal: 'Max', reason: 'Visite annuelle' }, userId: vet1.id },
    { action: 'CREATE', entity: 'Invoice', entityId: 'FAC-2026-001', details: { total: 66, owner: 'Lucas Bernard' }, userId: admin.id },
    { action: 'UPDATE', entity: 'Invoice', entityId: 'FAC-2026-001', details: { status: 'PAID' }, userId: admin.id },
    { action: 'CREATE', entity: 'Vaccination', entityId: 'vacc-1', details: { vaccine: 'Rage', animal: 'Max' }, userId: vet1.id },
    { action: 'CREATE', entity: 'Certificate', entityId: 'cert-1', details: { type: 'HEALTH', animal: 'Max' }, userId: vet1.id },
    { action: 'UPDATE', entity: 'Animal', entityId: animals[0].id, details: { field: 'weight', value: 32.5 }, userId: vet1.id },
    { action: 'CREATE', entity: 'Prescription', entityId: 'presc-1', details: { medication: 'Metacam', animal: 'Rex' }, userId: vet1.id },
    { action: 'CREATE', entity: 'Message', entityId: 'msg-1', details: { from: 'Thomas Garcia', subject: 'Urgence Rex' }, userId: vet1.id },
  ];

  for (const l of logDefs) {
    await prisma.activityLog.create({ data: l });
  }
  console.log(`Logs activite: ${logDefs.length}`);

  // ============================================
  // RESUME
  // ============================================
  console.log('\n========================================');
  console.log('  SEED TERMINE AVEC SUCCES');
  console.log('========================================\n');
  console.log('Comptes de connexion (mot de passe : Test1234!) :\n');
  console.log('  STAFF CLINIQUE :');
  console.log('    Admin        : admin@vetopaws.fr');
  console.log('    Veterinaire  : vet@vetopaws.fr');
  console.log('    Veterinaire  : vet2@vetopaws.fr');
  console.log('    Assistant    : assistant@vetopaws.fr');
  console.log('');
  console.log('  PROPRIETAIRES :');
  console.log('    Lucas Bernard  : client@test.fr   (Max, Luna)');
  console.log('    Claire Petit   : claire@test.fr   (Rocky, Noisette)');
  console.log('    Marc Durand    : marc@test.fr     (Oscar, Mia, Coco)');
  console.log('    Amelie Moreau  : amelie@test.fr   (Bella, Felix)');
  console.log('    Thomas Garcia  : thomas@test.fr   (Rex, Gizmo, Ziggy)');
  console.log('');
  console.log('Donnees creees :');
  console.log('  - 1 clinique, 4 staff, 5 proprietaires');
  console.log('  - 12 animaux (5 chiens, 3 chats, 1 lapin, 1 oiseau, 1 rongeur, 1 reptile)');
  console.log(`  - ${vaccDefs.length} vaccinations, ${aptDefs.length} RDV, ${consultDefs.length} consultations`);
  console.log(`  - ${medDefs.length} medicaments, ${prescDefs.length} prescriptions`);
  console.log(`  - ${certDefs.length} certificats, ${invDefs.length} articles stock`);
  console.log(`  - ${invoiceDefs.length} factures, ${msgDefs.length} messages`);
  console.log(`  - ${notifDefs.length} notifications, ${reminderDefs.length} rappels`);
  console.log(`  - ${weightDefs.length} mesures poids, ${reviewDefs.length} avis, ${templates.length} templates`);
  console.log(`  - ${logDefs.length} logs activite`);
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
