/**
 * Mark the 6 "Latest" projects as featured:true
 * These match RECENT_PROJECT_IDS in Frontend/src/components/Portfolio.jsx
 * Run: node scripts/mark-latest-projects.js
 */
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Slugs of the 6 projects shown in the frontend "Latest" tab
const LATEST_SLUGS = [
  'premium-coffee-packaging-toco',       // toco-premium-coffee-packaging
  'rollup-banner-toco-coffee',           // toco-rollup-banner
  'flyer-design-prime-ethiopia',         // prime-ethiopia-flyer
  'trifold-brochure-ptgr',              // ptgr-trifold
  'company-profile-cci-utop-goozam',    // company-profile-cci-utop-goozam
  'course-outline-cci-usa',             // course-outline-cci
];

async function main() {
  // Mark these 6 as featured
  for (const slug of LATEST_SLUGS) {
    const p = await prisma.project.findUnique({ where: { slug }, select: { id: true, title: true, featured: true } });
    if (!p) { console.log(`⚠️  Not found: ${slug}`); continue; }
    if (!p.featured) {
      await prisma.project.update({ where: { slug }, data: { featured: true } });
      console.log(`✅ Marked featured: ${p.title}`);
    } else {
      console.log(`ℹ️  Already featured: ${p.title}`);
    }
  }

  const total = await prisma.project.count({ where: { featured: true } });
  console.log(`\n✅ Done — ${total} projects are now featured (Latest)`);
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
