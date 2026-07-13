/**
 * Fixes project categories to match the two Digital Design sub-sections
 * in the frontend Portfolio.jsx exactly:
 *   - Social Media posts  → 'Digital Design · Social Media'  (service: marketing-campaign-design)
 *   - Web/Campaign Banners → 'Digital Design · Web Banners'  (service: digital-social-media-design)
 *   - All other categories stay the same
 * Run: node scripts/fix-project-categories.js
 */
'use strict';

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing Digital Design sub-categories...\n');

  const updates = [
    // ── Brand Identity ──────────────────────────────────────────────────────
    { slug: 'full-brand-identity-swan-clothing',           category: 'Brand Identity',                  featured: false },
    { slug: 'full-brand-identity-dayer-engineering',       category: 'Brand Identity',                  featured: false },
    { slug: 'brand-identity-maleda-coffee',                category: 'Brand Identity',                  featured: false },
    { slug: 'company-logo-rebranding-alta-counseling',     category: 'Brand Identity',                  featured: false },
    { slug: 'full-brand-identity-raya-hotel',              category: 'Brand Identity',                  featured: false },
    { slug: 'brand-identity-medavail-pharmaceutical',      category: 'Brand Identity',                  featured: false },
    { slug: 'brand-identity-basha-bekele-coffee',          category: 'Brand Identity',                  featured: false },
    { slug: 'brand-identity-digital-deresegn',             category: 'Brand Identity',                  featured: false },
    { slug: 'brand-identity-criterion-home-care',          category: 'Brand Identity',                  featured: false },

    // ── Print & Marketing ───────────────────────────────────────────────────
    { slug: 'a5-flyer-design-ptgr',                        category: 'Print & Marketing',               featured: false },
    { slug: 'business-card-design-digital-deresegn',       category: 'Print & Marketing',               featured: false },
    { slug: 'flyer-design-digital-deresegn',               category: 'Print & Marketing',               featured: false },
    { slug: 'employee-id-design-prime-ethiopia',           category: 'Print & Marketing',               featured: false },
    { slug: 'prime-ethiopia-business-proposal',            category: 'Print & Marketing',               featured: false },
    { slug: 'rollup-banner-yat-business-group',            category: 'Print & Marketing',               featured: false },

    // ── Digital Design · Web Banners (service: digital-social-media-design) ─
    { slug: 'website-banner-design-finix-bet',             category: 'Digital Design · Web Banners',    featured: false },
    { slug: 'website-banner-design-finix-bet-1',           category: 'Digital Design · Web Banners',    featured: false },
    { slug: 'website-banner-collection-finix-bet-2',       category: 'Digital Design · Web Banners',    featured: false },
    { slug: 'web-banner-design-finix-bet-3',               category: 'Digital Design · Web Banners',    featured: false },
    { slug: 'website-banner-series-finix-bet-4',           category: 'Digital Design · Web Banners',    featured: false },
    { slug: 'web-banner-assets-finix-bet-5',               category: 'Digital Design · Web Banners',    featured: false },
    { slug: 'website-banner-collection-finix-bet-10',      category: 'Digital Design · Web Banners',    featured: false },

    // ── Digital Design · Social Media (service: marketing-campaign-design) ──
    { slug: 'karaoke-event-social-media-blu-hart',         category: 'Digital Design · Social Media',   featured: false },
    { slug: 'social-media-design-ace-stainless-steel',     category: 'Digital Design · Social Media',   featured: false },
    { slug: 'social-media-design-awra-designs',            category: 'Digital Design · Social Media',   featured: false },
    { slug: 'social-media-post-digital-deresegn',          category: 'Digital Design · Social Media',   featured: false },
    { slug: 'social-media-graphics-niqat-coffee',          category: 'Digital Design · Social Media',   featured: false },
    { slug: 'social-media-design-prime-ethiopia',          category: 'Digital Design · Social Media',   featured: false },
    { slug: 'social-media-design-prime-ethiopia-2',        category: 'Digital Design · Social Media',   featured: false },
    { slug: 'social-media-template-task-plug',             category: 'Digital Design · Social Media',   featured: false },

    // ── Creative Direction ──────────────────────────────────────────────────
    { slug: 'creative-direction-visual-guidance-1',        category: 'Creative Direction',              featured: false },
    { slug: 'creative-direction-visual-guidance-2',        category: 'Creative Direction',              featured: false },
    { slug: 'creative-direction-visual-guidance-3',        category: 'Creative Direction',              featured: false },
    { slug: 'creative-direction-visual-guidance-4',        category: 'Creative Direction',              featured: false },
    { slug: 'creative-direction-visual-guidance-5',        category: 'Creative Direction',              featured: false },
    { slug: 'creative-direction-visual-guidance-6',        category: 'Creative Direction',              featured: false },
    { slug: 'creative-direction-visual-guidance-series-1', category: 'Creative Direction',              featured: false },
    { slug: 'creative-direction-visual-guidance-series-2', category: 'Creative Direction',              featured: false },

    // ── Recent Projects (featured: true) ────────────────────────────────────
    { slug: 'flyer-design-prime-ethiopia',                 category: 'Recent Projects',                 featured: true  },
    { slug: 'premium-coffee-packaging-toco',               category: 'Recent Projects',                 featured: true  },
    { slug: 'rollup-banner-toco-coffee',                   category: 'Recent Projects',                 featured: true  },
    { slug: 'trifold-brochure-ptgr',                       category: 'Recent Projects',                 featured: true  },
    { slug: 'company-profile-cci-utop-goozam',             category: 'Recent Projects',                 featured: true  },
    { slug: 'course-outline-cci-usa',                      category: 'Recent Projects',                 featured: true  },
  ];

  let updated = 0;
  for (const { slug, category, featured } of updates) {
    const p = await prisma.project.findUnique({ where: { slug }, select: { id: true, title: true, category: true } });
    if (!p) { console.log(`⚠️  Not found: ${slug}`); continue; }
    await prisma.project.update({ where: { slug }, data: { category, featured } });
    console.log(`✅ ${category.padEnd(35)} ${p.title}`);
    updated++;
  }

  console.log(`\n✅ Updated ${updated} projects\n`);

  const [bi, sm, wb, pm, cd, rp, total] = await Promise.all([
    prisma.project.count({ where: { category: 'Brand Identity' } }),
    prisma.project.count({ where: { category: 'Digital Design · Social Media' } }),
    prisma.project.count({ where: { category: 'Digital Design · Web Banners' } }),
    prisma.project.count({ where: { category: 'Print & Marketing' } }),
    prisma.project.count({ where: { category: 'Creative Direction' } }),
    prisma.project.count({ where: { category: 'Recent Projects' } }),
    prisma.project.count(),
  ]);

  console.log('📊 Final category counts:');
  console.log(`   Brand Identity                  : ${bi}`);
  console.log(`   Digital Design · Social Media   : ${sm}`);
  console.log(`   Digital Design · Web Banners    : ${wb}`);
  console.log(`   Print & Marketing               : ${pm}`);
  console.log(`   Creative Direction              : ${cd}`);
  console.log(`   Recent Projects                 : ${rp}`);
  console.log(`   Total projects                  : ${total}`);
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
