const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.insight
  .findMany({
    where: { type: 'BLOG_POST' },
    select: { id: true, title: true, publishDate: true },
    orderBy: { publishDate: 'asc' },
  })
  .then((rows) => rows.forEach((r, i) => console.log(i + 1, r.id, '|', r.title)))
  .finally(() => prisma.$disconnect());
