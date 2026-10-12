const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // Find all insights where seoTitle > 60 chars and truncate them
  const insights = await prisma.insight.findMany({
    where: { seoTitle: { not: null } },
    select: { id: true, title: true, seoTitle: true, seoDescription: true },
  });

  const longTitle = insights.filter((i) => i.seoTitle && i.seoTitle.length > 60);
  const longDesc  = insights.filter((i) => i.seoDescription && i.seoDescription.length > 160);

  console.log(`Found ${longTitle.length} insights with seoTitle > 60 chars`);
  console.log(`Found ${longDesc.length} insights with seoDescription > 160 chars`);

  for (const i of longTitle) {
    const truncated = i.seoTitle.slice(0, 60);
    await prisma.insight.update({ where: { id: i.id }, data: { seoTitle: truncated } });
    console.log(`Fixed seoTitle for "${i.title}": "${i.seoTitle}" → "${truncated}"`);
  }

  for (const i of longDesc) {
    const truncated = i.seoDescription.slice(0, 160);
    await prisma.insight.update({ where: { id: i.id }, data: { seoDescription: truncated } });
    console.log(`Fixed seoDescription for "${i.title}"`);
  }

  // Same for projects
  const projects = await prisma.project.findMany({
    where: { OR: [{ seoTitle: { not: null } }, { seoDescription: { not: null } }] },
    select: { id: true, title: true, seoTitle: true, seoDescription: true },
  });

  const longProjTitle = projects.filter((p) => p.seoTitle && p.seoTitle.length > 60);
  const longProjDesc  = projects.filter((p) => p.seoDescription && p.seoDescription.length > 160);

  console.log(`Found ${longProjTitle.length} projects with seoTitle > 60 chars`);
  console.log(`Found ${longProjDesc.length} projects with seoDescription > 160 chars`);

  for (const p of longProjTitle) {
    const truncated = p.seoTitle.slice(0, 60);
    await prisma.project.update({ where: { id: p.id }, data: { seoTitle: truncated } });
    console.log(`Fixed project seoTitle for "${p.title}"`);
  }

  for (const p of longProjDesc) {
    const truncated = p.seoDescription.slice(0, 160);
    await prisma.project.update({ where: { id: p.id }, data: { seoDescription: truncated } });
    console.log(`Fixed project seoDescription for "${p.title}"`);
  }

  console.log('Done.');
  await prisma.$disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
