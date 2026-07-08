/**
 * Migrates old "Brand Identity · Fashion" style categories
 * to the frontend service key format: "brand-identity-design"
 * Also fixes featured flags for the 6 Recent Projects.
 * Run: node scripts/fix-project-categories.js
 */
'use strict';

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing project categories...\n');

  // Map slug → { category, featured }
  const updates = [
    // Brand Identity
    { slug: 'full-brand-identity-swan-clothing',           category: 'brand-identity-design',         featured: false },
    { slug: 'full-brand-identity-dayer-engineering',       category: 'brand-identity-design',         featured: false },
    { slug: 'brand-identity-maleda-coffee',                category: 'brand-identity-design',         featured: false },
    { slug: 'company-logo-rebranding-alta-counseling',     category: 'brand-identity-design',         featured: false },
    { slug: 'full-brand-identity-raya-hotel',              category: 'brand-identity-design',         featured: false },
    { slug: 'brand-identity-medavail-pharmaceutical',      category: 'brand-identity-design',         featured: false },
    { slug: 'brand-identity-basha-bekele-coffee',          category: 'brand-identity-design',         featured: false },
    { slug: 'brand-identity-digital-deresegn',             category: 'brand-identity-design',         featured: false },
    { slug: 'brand-identity-criterion-home-care',          category: 'brand-identity-design',         featured: false },

    // Print & Marketing
    { slug: 'a5-flyer-design-ptgr',                        category: 'print-design',                  featured: false },
    { slug: 'business-card-design-digital-deresegn',       category: 'print-design',                  featured: false },
    { slug: 'flyer-design-digital-deresegn',               category: 'print-design',                  featured: false },
    { slug: 'employee-id-design-prime-ethiopia',           category: 'print-design',                  featured: false },
    { slug: 'prime-ethiopia-business-proposal',            category: 'print-design',                  featured: false },

    // Brand Applications
    { slug: 'rollup-banner-yat-business-group',            category: 'brand-applications-assets',     featured: false },

    // Digital / Web Banners
    { slug: 'website-banner-design-finix-bet',             category: 'digital-social-media-design',   featured: false },
    { slug: 'website-banner-design-finix-bet-1',           category: 'digital-social-media-design',   featured: false },
    { slug: 'website-banner-collection-finix-bet-2',       category: 'digital-social-media-design',   featured: false },
    { slug: 'web-banner-design-finix-bet-3',               category: 'digital-social-media-design',   featured: false },
    { slug: 'website-banner-series-finix-bet-4',           category: 'digital-social-media-design',   featured: false },
    { slug: 'web-banner-assets-finix-bet-5',               category: 'digital-social-media-design',   featured: false },
    { slug: 'website-banner-collection-finix-bet-10',      category: 'digital-social-media-design',   featured: false },

    // Social Media
    { slug: 'karaoke-event-social-media-blu-hart',         category: 'marketing-campaign-design',     featured: false },
    { slug: 'social-media-design-ace-stainless-steel',     category: 'marketing-campaign-design',     featured: false },
    { slug: 'social-media-design-awra-designs',            category: 'marketing-campaign-design',     featured: false },
    { slug: 'social-media-post-digital-deresegn',          category: 'marketing-campaign-design',     featured: false },
    { slug: 'social-media-graphics-niqat-coffee',          category: 'marketing-campaign-design',     featured: false },
    { slug: 'social-media-design-prime-ethiopia',          category: 'marketing-campaign-design',     featured: false },
    { slug: 'social-media-design-prime-ethiopia-2',        category: 'marketing-campaign-design',     featured: false },
    { slug: 'social-media-template-task-plug',             category: 'marketing-campaign-design',     featured: false },

    // Creative Direction
    { slug: 'creative-direction-visual-guidance-1',        category: 'art-direction-visual-guidance', featured: false },
    { slug: 'creative-direction-visual-guidance-2',        category: 'art-direction-visual-guidance', featured: false },
    { slug: 'creative-direction-visual-guidance-3',        category: 'art-direction-visual-guidance', featured: false },
    { slug: 'creative-direction-visual-guidance-4',        category: 'art-direction-visual-guidance', featured: false },
    { slug: 'creative-direction-visual-guidance-5',        category: 'art-direction-visual-guidance', featured: false },
    { slug: 'creative-direction-visual-guidance-6',        category: 'art-direction-visual-guidance', featured: false },
    // Old slugs (series-1/2)
    { slug: 'creative-direction-visual-guidance-series-1', category: 'art-direction-visual-guidance', featured: false },
    { slug: 'creative-direction-visual-guidance-series-2', category: 'art-direction-visual-guidance', featured: false },

    // Recent Projects (featured:true) — match RECENT_PROJECT_IDS in frontend
    { slug: 'flyer-design-prime-ethiopia',                 category: 'print-design',                  featured: true  },
    { slug: 'premium-coffee-packaging-toco',               category: 'brand-applications-assets',     featured: true  },
    { slug: 'rollup-banner-toco-coffee',                   category: 'brand-applications-assets',     featured: true  },
    { slug: 'trifold-brochure-ptgr',                       category: 'print-design',                  featured: true  },
    { slug: 'company-profile-cci-utop-goozam',             category: 'print-design',                  featured: true  },
    { slug: 'course-outline-cci-usa',                      category: 'print-design',                  featured: true  },
  ];

  let updated = 0;
  let notFound = 0;

  for (const { slug, category, featured } of updates) {
    const existing = await prisma.project.findUnique({ where: { slug }, select: { id: true, title: true } });
    if (!existing) { notFound++; continue; }
    await prisma.project.update({ where: { slug }, data: { category, featured } });
    console.log(`✅ ${existing.title}`);
    updated++;
  }

  console.log(`\n✅ Updated ${updated} projects`);
  if (notFound > 0) console.log(`⚠️  ${notFound} slugs not found in DB (safe to ignore)`);

  // Summary counts
  const counts = await Promise.all([
    prisma.project.count({ where: { category: 'brand-identity-design' } }),
    prisma.project.count({ where: { category: 'print-design' } }),
    prisma.project.count({ where: { category: 'marketing-campaign-design' } }),
    prisma.project.count({ where: { category: 'digital-social-media-design' } }),
    prisma.project.count({ where: { category: 'art-direction-visual-guidance' } }),
    prisma.project.count({ where: { featured: true } }),
  ]);

  console.log('\n📊 Category counts after migration:');
  console.log(`   Brand Identity     : ${counts[0]}`);
  console.log(`   Print & Marketing  : ${counts[1]}`);
  console.log(`   Social Media       : ${counts[2]}`);
  console.log(`   Digital/Web        : ${counts[3]}`);
  console.log(`   Creative Direction : ${counts[4]}`);
  console.log(`   Recent Projects    : ${counts[5]} (featured)`);
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
