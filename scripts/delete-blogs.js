const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const IDS_TO_DELETE = [
  '6fb6e9ed-0e77-4215-85a8-04eac279dac9', // Essential Graphic Design Principles...
  'db939f47-f3e0-487a-9bd7-dd4b625e3fbf', // Graphic Design Trends 2026...
  '54db60fe-a02f-48c9-a272-f718883906cf', // Building Strong Brand Identities...
  'fb09dc32-4799-4cd0-aaae-7e3042d05fe9', // Why Consistency Is the Real Luxury...
];

async function run() {
  for (const id of IDS_TO_DELETE) {
    const row = await prisma.insight.findUnique({ where: { id }, select: { title: true } });
    await prisma.insight.delete({ where: { id } });
    console.log('Deleted:', row?.title ?? id);
  }
  console.log('Done.');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
