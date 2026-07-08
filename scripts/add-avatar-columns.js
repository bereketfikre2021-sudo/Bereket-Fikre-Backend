const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(
    'ALTER TABLE admins ADD COLUMN IF NOT EXISTS avatar TEXT'
  );
  await prisma.$executeRawUnsafe(
    'ALTER TABLE admins ADD COLUMN IF NOT EXISTS "avatarPublicId" TEXT'
  );
  console.log('✅ avatar and avatarPublicId columns added to admins table');
}

main()
  .catch((e) => console.error('❌', e.message))
  .finally(() => prisma.$disconnect());
