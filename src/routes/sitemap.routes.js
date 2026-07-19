'use strict';

/**
 * Sitemap & robots.txt routes
 * GET /sitemap.xml  — dynamic XML sitemap (DB-driven, cached 5 min)
 * GET /robots.txt   — static robots file
 */

const { Router } = require('express');
const prisma = require('../config/database');
const logger = require('../utils/logger');

const router = Router();

const SITE_URL = (process.env.SITE_URL || 'https://bereketfikre.et').replace(/\/$/, '');

// ── In-memory cache ────────────────────────────────────────────────────────
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Call this whenever content is published/unpublished to bust the cache */
const bustSitemapCache = () => { _cache = null; _cacheTime = 0; };

// ── XML helpers ────────────────────────────────────────────────────────────
const esc  = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const date = (d) => d ? new Date(d).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

const urlEntry = ({ loc, lastmod, changefreq, priority }) =>
  `  <url>\n    <loc>${esc(SITE_URL + loc)}</loc>\n    <lastmod>${date(lastmod)}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

// ── Static pages ───────────────────────────────────────────────────────────
const STATIC_PAGES = [
  { loc: '/',           changefreq: 'weekly',  priority: '1.0' },
  { loc: '/#about',     changefreq: 'monthly', priority: '0.7' },
  { loc: '/#portfolio', changefreq: 'weekly',  priority: '0.9' },
  { loc: '/#services',  changefreq: 'monthly', priority: '0.8' },
  { loc: '/#blog',      changefreq: 'weekly',  priority: '0.8' },
  { loc: '/#faq',       changefreq: 'monthly', priority: '0.5' },
  { loc: '/#contact',   changefreq: 'monthly', priority: '0.6' },
];

// ── Build XML ──────────────────────────────────────────────────────────────
async function buildSitemap() {
  const now = Date.now();
  if (_cache && now - _cacheTime < CACHE_TTL_MS) return _cache;

  try {
    // Fetch only published content
    const [projects, insights] = await Promise.all([
      prisma.project.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.insight.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, type: true, updatedAt: true },
        orderBy: { publishDate: 'desc' },
      }),
    ]);

    const now2 = new Date().toISOString().slice(0, 10);

    const entries = [
      // Static pages — use today as lastmod
      ...STATIC_PAGES.map((p) => urlEntry({ ...p, lastmod: now2 })),

      // Published projects → link to /#portfolio (single-page app)
      ...projects.map((p) =>
        urlEntry({ loc: `/#portfolio`, lastmod: p.updatedAt, changefreq: 'monthly', priority: '0.8' })
      ),

      // Published case studies
      ...insights
        .filter((i) => i.type === 'CASE_STUDY')
        .map((i) =>
          urlEntry({ loc: `/#portfolio`, lastmod: i.updatedAt, changefreq: 'monthly', priority: '0.9' })
        ),

      // Published blog posts
      ...insights
        .filter((i) => i.type === 'BLOG_POST')
        .map((i) =>
          urlEntry({ loc: `/#blog`, lastmod: i.updatedAt, changefreq: 'monthly', priority: '0.7' })
        ),
    ];

    // Deduplicate by loc+lastmod — keep newest lastmod per loc
    const seen = new Map();
    for (const raw of entries) {
      const locMatch = raw.match(/<loc>([^<]+)<\/loc>/);
      const modMatch = raw.match(/<lastmod>([^<]+)<\/lastmod>/);
      if (!locMatch) continue;
      const loc = locMatch[1];
      const mod = modMatch?.[1] ?? '';
      if (!seen.has(loc) || mod > seen.get(loc).mod) {
        seen.set(loc, { xml: raw, mod });
      }
    }

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
      '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
      '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
      '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
      ...[...seen.values()].map((v) => v.xml),
      '</urlset>',
    ].join('\n');

    _cache = xml;
    _cacheTime = Date.now();
    return xml;
  } catch (err) {
    logger.error(`Sitemap generation failed: ${err.message}`);
    throw err;
  }
}

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    const xml = await buildSitemap();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min browser cache
    res.send(xml);
  } catch {
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Sitemap unavailable</error>');
  }
});

// GET /robots.txt
router.get('/robots.txt', (req, res) => {
  const txt = [
    '# Robots.txt — Bereket Fikre Portfolio',
    '# https://bereketfikre.et',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# Block admin & API routes',
    'Disallow: /admin',
    'Disallow: /dashboard',
    'Disallow: /login',
    'Disallow: /api/',
    'Disallow: /auth/',
    'Disallow: /uploads/temp',
    'Disallow: /preview',
    'Disallow: /draft',
    '',
    '# Allow assets',
    'Allow: /assets/',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hr browser cache
  res.send(txt);
});

module.exports = { router, bustSitemapCache };
