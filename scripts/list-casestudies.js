const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.insight
  .findMany({
    where: { type: 'CASE_STUDY' },
    select: { id: true, slug: true, title: true, coverImage: true },
    orderBy: { publishDate: 'asc' },
  })
  .then((rows) => rows.forEach((r) => console.log(r.id, '|', r.slug, '|', r.title, '|', r.coverImage?.slice(0,60))))
  .finally(() => prisma.$disconnect());
