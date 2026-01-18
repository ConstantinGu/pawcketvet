const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed en cours...');
  
  const password = await bcrypt.hash('Test1234!', 10);
  
  const clinic = await prisma.clinic.create({
    data: {
      name: 'Clinique Test',
      address: '123 Rue Test',
      city: 'Paris',
      postalCode: '75001',
      phone: '0123456789',
      email: 'test@clinic.com'
    }
  });
  
  console.log('✅ Seed terminé!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
