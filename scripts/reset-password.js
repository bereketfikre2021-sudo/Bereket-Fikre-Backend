/**
 * Reset admin password to match ADMIN_PASSWORD in .env
 * Run: node scripts/reset-password.js
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error('❌  ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  // Find the first active admin regardless of email
  const existing = await prisma.admin.findFirst({
    where: { isActive: true },
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!existing) {
    console.error('❌  No admin found in database');
    process.exit(1);
  }

  console.log('Found admin:', existing.email, '|', existing.name);

  const hashed = await bcrypt.hash(password, 12);

  await prisma.admin.update({
    where: { id: existing.id },
    data:  { password: hashed },
  });

  console.log('✅  Password reset successfully');
  console.log('   Email   :', existing.email);
  console.log('   Password: (your ADMIN_PASSWORD from Backend/.env)');
}

main()
  .catch((e) => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
