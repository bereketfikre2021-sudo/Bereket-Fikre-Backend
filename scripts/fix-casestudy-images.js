const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Map case study id → local public path (served as /Case Studies/<name>.webp)
const UPDATES = [
  {
    id:    'cb20d4f2-38bf-459c-8b85-4aba25082b71',
    title: 'Nexa Tracker',
    coverImage: '/Case Studies/Nexa Tracker.webp',
  },
  {
    id:    '86aa5c94-3d93-4efd-867f-dbb3a58ec1f5',
    title: 'Connect Digitals',
    coverImage: '/Case Studies/Connect Digitals.webp',
  },
  {
    id:    '54be80bb-78a5-4213-af06-8db94d298131',
    title: 'Date Invitation Pro',
    coverImage: '/Case Studies/Date Invitation Pro.webp',
  },
  {
    id:    '259e6f8b-1b8b-423e-9c13-975d90dcd043',
    title: 'Fit Track Pro',
    coverImage: '/Case Studies/Fit Track Pro.webp',
  },
];

async function run() {
  for (const { id, title, coverImage } of UPDATES) {
    await prisma.insight.update({
      where: { id },
      data:  { coverImage, coverPublicId: null },
    });
    console.log(`Updated "${title}" → ${coverImage}`);
  }
  console.log('Done.');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
