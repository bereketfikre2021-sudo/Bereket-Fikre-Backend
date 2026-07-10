/**
 * Migrates project categories to match the frontend filter tab labels exactly:
 * "Recent Projects" | "Brand Identity" | "Digital Design" | "Print & Marketing" | "Creative Direction"
 * Run: node scripts/fix-project-categories.js
 */
'use strict';

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing project categories to match frontend tabs...\n');

  const updates = [
    // Brand Identity
    { slug: 'full-brand-identity-swan-clothing',           category: 'Brand Identity',     featured: false },
    { slug: 'full-brand-identity-dayer-engineering',       category: 'Brand Identity',     featured: false },
    { slug: 'brand-identity-maleda-coffee',                category: 'Brand Identity',     featured: false },
    { slug: 'company-logo-rebranding-alta-counseling',     category: 'Brand Identity',     featured: false },
    { slug: 'full-brand-identity-raya-hotel',              category: 'Brand Identity',     featured: false },
    { slug: 'brand-identity-medavail-pharmaceutical',      category: 'Brand Identity',     featured: false },
    { slug: 'brand-identity-basha-bekele-coffee',          category: 'Brand Identity',     featured: false },
    { slug: 'brand-identity-digital-deresegn',             category: 'Brand Identity',     featured: false },
    { slug: 'brand-identity-criterion-home-care',          category: 'Brand Identity',     featured: false },

    // Print & Marketing
    { slug: 'a5-flyer-design-ptgr',                        category: 'Print & Marketing',  featured: false },
    { slug: 'business-card-design-digital-deresegn',       category: 'Print & Marketing',  featured: false },
    { slug: 'flyer-design-digital-deresegn',               category: 'Print & Marketing',  featured: false },
    { slug: 'employee-id-design-prime-ethiopia',           category: 'Print & Marketing',  featured: false },
    { slug: 'prime-ethiopia-business-proposal',            category: 'Print & Marketing',  featured: false },
    { slug: 'rollup-banner-yat-business-group',            category: 'Print & Marketing',  featured: false },

    // Digital Design
    { slug: 'website-banner-design-finix-bet',             category: 'Digital Design',     featured: false },
    { slug: 'website-banner-design-finix-bet-1',           category: 'Digital Design',     featured: false },
    { slug: 'website-banner-collection-finix-bet-2',       category: 'Digital Design',     featured: false },
    { slug: 'web-banner-design-finix-bet-3',               category: 'Digital Design',     featured: false },
    { slug: 'website-banner-series-finix-bet-4',           category: 'Digital Design',     featured: false },
    { slug: 'web-banner-assets-finix-bet-5',               category: 'Digital Design',     featured: false },
    { slug: 'website-banner-collection-finix-bet-10',      category: 'Digital Design',     featured: false },
    { slug: 'karaoke-event-social-media-blu-hart',         category: 'Digital Design',     featured: false },
    { slug: 'social-media-design-ace-stainless-steel',     category: 'Digital Design',     featured: false },
    { slug: 'social-media-design-awra-designs',            category: 'Digital Design',     featured: false },
    { slug: 'social-media-post-digital-deresegn',          category: 'Digital Design',     featured: false },
    { slug: 'social-media-graphics-niqat-coffee',          category: 'Digital Design',     featured: false },
    { slug: 'social-media-design-prime-ethiopia',          category: 'Digital Design',     featured: false },
    { slug: 'social-media-design-prime-ethiopia-2',        category: 'Digital Design',     featured: false },
    { slug: 'social-media-template-task-plug',             category: 'Digital Design',     featured: false },

    // Creative Direction
    { slug: 'creative-direction-visual-guidance-1',        category: 'Creative Direction', featured: false },
    { slug: 'creative-direction-visual-guidance-2',        category: 'Creative Direction', featured: false },
    { slug: 'creative-direction-visual-guidance-3',        category: 'Creative Direction', featured: false },
    { slug: 'creative-direction-visual-guidance-4',        category: 'Creative Direction', featured: false },
    { slug: 'creative-direction-visual-guidance-5',        category: 'Creative Direction', featured: false },
    { slug: 'creative-direction-visual-guidance-6',        category: 'Creative Direction', featured: false },
    { slug: 'creative-direction-visual-guidance-series-1', category: 'Creative Direction', featured: false },
    { slug: 'creative-direction-visual-guidance-series-2', category: 'Creative Direction', featured: false },

    // Recent Projects (featured:true)
    { slug: 'flyer-design-prime-ethiopia',                 category: 'Recent Projects',    featured: true  },
    { slug: 'premium-coffee-packaging-toco',               category: 'Recent Projects',    featured: true  },
    { slug: 'rollup-banner-toco-coffee',                   category: 'Recent Projects',    featured: true  },
    { slug: 'trifold-brochure-ptgr',                       category: 'Recent Projects',    featured: true  },
    { slug: 'company-profile-cci-utop-goozam',             category: 'Recent Projects',    featured: true  },
    { slug: 'course-outline-cci-usa',                      category: 'Recent Projects',    featured: true  },
  ];

  let updated = 0;
  for (const { slug, category, featured } of updates) {
    const p = await prisma.project.findUnique({ where: { slug }, select: { id: true, title: true } });
    if (!p) continue;
    await prisma.project.update({ where: { slug }, data: { category, featured } });
    console.log(`✅ ${category.padEnd(20)} ${p.title}`);
    updated++;
  }

  console.log(`\n✅ Updated ${updated} projects`);

  const counts = await Promise.all([
    prisma.project.count({ where: { category: 'Brand Identity' } }),
    prisma.project.count({ where: { category: 'Print & Marketing' } }),
    prisma.project.count({ where: { category: 'Digital Design' } }),
    prisma.project.count({ where: { category: 'Creative Direction' } }),
    prisma.project.count({ where: { category: 'Recent Projects' } }),
  ]);
  console.log('\n📊 Counts:');
  console.log(`   Brand Identity    : ${counts[0]}`);
  console.log(`   Print & Marketing : ${counts[1]}`);
  console.log(`   Digital Design    : ${counts[2]}`);
  console.log(`   Creative Direction: ${counts[3]}`);
  console.log(`   Recent Projects   : ${counts[4]}`);
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
