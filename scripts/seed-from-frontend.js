/**
 * seed-from-frontend.js
 * ---------------------
 * Upserts the 15 curated projects from the frontend's staticProjects.js
 * and seeds insights (case studies + blog posts) from the main seed file.
 *
 * Images: the frontend serves static images from its /public folder.
 * We store the public-site URL so the admin can see thumbnails immediately.
 * Replace FRONTEND_BASE_URL below if the site URL changes.
 *
 * Run:  node scripts/seed-from-frontend.js   (from Backend folder)
 */

'use strict';

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ── Config ────────────────────────────────────────────────────────────────────
const FRONTEND_BASE_URL = process.env.FRONTEND_URL || 'https://bereketfikre.et';

// Build the full image URL from the relative path used in staticProjects.js
const img = (path) => (path ? `${FRONTEND_BASE_URL}${path}` : null);

// ── Projects (from Frontend/src/data/staticProjects.js) ──────────────────────
const PROJECTS = [
  {
    slug: 'connect-digitals',
    title: 'Connect Digitals',
    category: 'Creative & Digital Agency',
    shortDescription: 'Creative and digital agency founded to help businesses gain digital visibility. Brand design, marketing, web development, and a self-service promotion platform.',
    fullDescription: 'Connect Digitals is a full-service creative and digital agency I founded to help businesses establish and grow their digital presence. Services include brand identity, social media management, web development, and a self-service digital promotion platform.',
    thumbnail: img('/Grow/Connect Digitals.jpg'),
    technologies: ['Brand Design', 'Web Development', 'Social Media'],
    liveUrl: 'https://web.bereketfikre.et',
    featured: true,
    tier: 'flagship',
    primaryPillar: 'GROW',
    secondaryPillars: ['BUILD', 'CREATE'],
    status: 'PUBLISHED',
    displayOrder: 1,
  },
  {
    slug: 'fit-track-pro',
    title: 'Fit Track Pro',
    category: 'Digital Products',
    shortDescription: 'Fitness and meal planning web application built for an Ethiopian audience — with an Ethiopian food database, Amharic language support, and a mobile-first PWA.',
    fullDescription: 'Fit Track Pro is a fitness and meal planning web application designed specifically for Ethiopian users. It features an Ethiopian food database, Amharic language support, workout tracking, and is built as a mobile-first PWA.',
    thumbnail: img('/Case Studies/Fit Track Pro.webp'),
    technologies: ['React', 'Node.js', 'PostgreSQL', 'PWA'],
    liveUrl: 'https://app.bereketfikre.et',
    appUrl: 'https://app.bereketfikre.et',
    featured: true,
    tier: 'flagship',
    primaryPillar: 'BUILD',
    secondaryPillars: [],
    status: 'PUBLISHED',
    displayOrder: 2,
  },
  {
    slug: 'date-invitation-pro',
    title: 'Date Invitation Pro',
    category: 'Digital Products',
    shortDescription: 'Interactive digital invitation platform — personalized invitations, recipient responses, and Telegram-based notifications.',
    fullDescription: 'Date Invitation Pro is an interactive digital invitation platform where users create personalized invitations, recipients can respond, and hosts receive Telegram-based notifications in real time.',
    thumbnail: img('/Case Studies/Date Invitation Pro.webp'),
    technologies: ['React', 'Node.js', 'Telegram API'],
    liveUrl: 'https://date.bereketfikre.et',
    appUrl: 'https://date.bereketfikre.et',
    featured: true,
    tier: 'flagship',
    primaryPillar: 'BUILD',
    secondaryPillars: ['CREATE'],
    status: 'PUBLISHED',
    displayOrder: 3,
  },
  {
    slug: 'connect-digitals-platform',
    title: 'Connect Digitals — Self-Service Promotion Platform',
    category: 'Digital Products',
    shortDescription: 'The digital ordering platform I built for Connect Digitals — clients select a service, choose a platform and pricing tier, place orders independently, and receive automated status notifications.',
    fullDescription: 'The self-service promotion platform built for Connect Digitals allows clients to browse services, select platforms and pricing tiers, place orders independently, and receive automated status notifications — reducing manual sales overhead.',
    thumbnail: img('/Grow/Connect Digitals.jpg'),
    technologies: ['React', 'Node.js', 'Telegram Bot'],
    liveUrl: 'https://web.bereketfikre.et',
    featured: false,
    tier: 'selected',
    primaryPillar: 'BUILD',
    secondaryPillars: ['GROW'],
    status: 'PUBLISHED',
    displayOrder: 4,
  },
  {
    slug: 'andegna-furniture',
    title: 'Andegna Furniture',
    category: 'Brand & Social Media',
    shortDescription: 'Graphic design, social media management, and art direction for Andegna Furniture.',
    fullDescription: 'Full brand and social media service for Andegna Furniture — graphic design, social media management, content creation, and art direction to build their online presence and brand consistency.',
    thumbnail: img('/Create/Office Signage For Andegna Furniture.webp'),
    technologies: ['Adobe Illustrator', 'Adobe Photoshop', 'Figma'],
    featured: false,
    tier: 'selected',
    primaryPillar: 'CREATE',
    secondaryPillars: ['GROW'],
    status: 'PUBLISHED',
    displayOrder: 5,
  },
  {
    slug: 'company-logo-rebranding-alta-counseling',
    title: 'Alta Counseling — Logo Rebranding',
    category: 'Brand Identity',
    shortDescription: 'Complete company logo rebrand for Alta Counseling Ethiopia — clarity, warmth, and professional consistency.',
    fullDescription: 'Complete logo rebranding for Alta Counseling Ethiopia — a refreshed identity focused on clarity, warmth, and professional consistency across all brand touchpoints.',
    thumbnail: img('/Create/Company Logo Rebranding - Alta Counseling Ethiopia.webp'),
    technologies: ['Adobe Illustrator'],
    featured: false,
    tier: 'selected',
    primaryPillar: 'CREATE',
    secondaryPillars: [],
    status: 'PUBLISHED',
    displayOrder: 6,
  },
  {
    slug: 'full-brand-identity-raya-hotel',
    title: 'Raya Hotel & Convention Center',
    category: 'Brand Identity',
    shortDescription: 'Full brand identity for a hospitality and convention centre — premium positioning, cohesive visual language.',
    fullDescription: 'Full brand identity for Raya Hotel & Convention Center — a comprehensive visual system including logo, color palette, typography, brand guidelines, and application across stationery and signage.',
    thumbnail: img('/Create/Branding Raya Hotel and Convention Center.webp'),
    technologies: ['Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign'],
    featured: false,
    tier: 'selected',
    primaryPillar: 'CREATE',
    secondaryPillars: [],
    status: 'PUBLISHED',
    displayOrder: 7,
  },
  {
    slug: 'brand-identity-criterion-home-care',
    title: 'Criterion In Home Care — Brand Identity',
    category: 'Brand Identity',
    shortDescription: 'Full brand identity for Criterion In Home Care (USA) — a professional, trustworthy visual system for a home care services provider.',
    fullDescription: 'Full brand identity for Criterion In Home Care (USA) — logo design, color palette, typography, and brand guidelines crafted to communicate professionalism and trust for a home care services provider.',
    thumbnail: img('/Create/Criterion In Home Care - USA.webp'),
    technologies: ['Adobe Illustrator', 'Adobe InDesign'],
    featured: false,
    tier: 'selected',
    primaryPillar: 'CREATE',
    secondaryPillars: [],
    status: 'PUBLISHED',
    displayOrder: 8,
  },
  {
    slug: 'brand-identity-medavail-pharmaceutical',
    title: 'Medavail Pharmaceuticals — Branding',
    category: 'Brand Identity',
    shortDescription: 'Full company branding for Medavail Pharmaceuticals — professional identity system for the pharmaceutical sector.',
    fullDescription: 'Full company branding for Medavail Pharmaceuticals — logo, brand guidelines, and identity system designed to communicate credibility and professionalism in the pharmaceutical import and wholesale sector.',
    thumbnail: img('/Create/Medavail Pharmaceutical Import and Wholesale.webp'),
    technologies: ['Adobe Illustrator', 'Adobe InDesign'],
    featured: false,
    tier: 'selected',
    primaryPillar: 'CREATE',
    secondaryPillars: [],
    status: 'PUBLISHED',
    displayOrder: 9,
  },
  {
    slug: 'brand-identity-digital-deresegn',
    title: 'Digital Deresegn — Brand Identity',
    category: 'Brand Identity',
    shortDescription: 'Visual identity, campaigns, and digital content for Digital Deresegn — a creative and digital studio.',
    fullDescription: 'Visual identity, campaigns, and digital content for Digital Deresegn — brand direction, consistent design language, and adaptable assets for a creative and digital studio.',
    thumbnail: img('/Create/Digital Deresegn.webp'),
    technologies: ['Adobe Illustrator', 'Figma'],
    featured: false,
    tier: 'selected',
    primaryPillar: 'CREATE',
    secondaryPillars: [],
    status: 'PUBLISHED',
    displayOrder: 10,
  },
  {
    slug: 'gedy-law-website',
    title: 'Gedy-Law Website',
    category: 'Web Development',
    shortDescription: 'Website designed, developed, and managed for Gedy-Law.',
    fullDescription: 'Website designed, developed, and managed for Gedy-Law — a professional law firm website with clean UI, clear service presentation, and reliable hosting.',
    thumbnail: null,
    technologies: ['Web Design', 'Web Development'],
    liveUrl: 'https://gedylaw.com',
    featured: false,
    tier: 'selected',
    primaryPillar: 'BUILD',
    secondaryPillars: ['CREATE'],
    status: 'PUBLISHED',
    displayOrder: 11,
  },
  {
    slug: 'awra-designs-website-app',
    title: 'Awra Designs — Website & App',
    category: 'Web Development',
    shortDescription: 'Website and application designed, developed, and managed for Awra Designs. Active and under ongoing development.',
    fullDescription: 'Website and application for Awra Designs — ongoing design, development, and management. Active and continuously evolving with new features.',
    thumbnail: null,
    technologies: ['Web Design', 'Web Development', 'App Development'],
    liveUrl: 'https://awradesigns.et',
    featured: false,
    tier: 'selected',
    primaryPillar: 'BUILD',
    secondaryPillars: ['CREATE'],
    status: 'PUBLISHED',
    displayOrder: 12,
  },
  {
    slug: 'g-power-website',
    title: 'G-Power Website',
    category: 'Web Development',
    shortDescription: 'Corporate website designed and developed for G-Power. Presented as completed past work — the site is currently inactive.',
    fullDescription: 'Corporate website designed and developed for G-Power. Completed past work — the site is currently inactive but served as a professional web presence for the company.',
    thumbnail: null,
    technologies: ['Web Design', 'Web Development'],
    liveUrl: 'https://gpower.et',
    featured: false,
    tier: 'archive',
    primaryPillar: 'BUILD',
    secondaryPillars: [],
    status: 'PUBLISHED',
    displayOrder: 13,
  },
  {
    slug: 'social-media-graphics-niqat-coffee',
    title: 'Niqat Coffee — Social Media',
    category: 'Social Media',
    shortDescription: 'Social media management and visual content for Niqat Coffee — building brand presence, content direction, and audience engagement.',
    fullDescription: 'Social media management and visual content creation for Niqat Coffee — content strategy, post design, story templates, and audience engagement to build a consistent brand presence.',
    thumbnail: img('/Grow/Niqat Coffee.webp'),
    technologies: ['Adobe Photoshop', 'Figma', 'Canva Pro'],
    featured: false,
    tier: 'selected',
    primaryPillar: 'GROW',
    secondaryPillars: ['CREATE'],
    status: 'PUBLISHED',
    displayOrder: 14,
  },
  {
    slug: 'buna-labs-head-of-social-media',
    title: 'Buna Labs — Head of Social Media',
    category: 'Social Media Management',
    shortDescription: 'Head of Social Media at Buna Labs — content planning, creative direction, and performance analysis for Nexa Tracker and Bete Nibab.',
    fullDescription: 'Head of Social Media at Buna Labs — responsible for content planning, creative direction, and performance analysis across Nexa Tracker and Bete Nibab brands.',
    thumbnail: img('/Grow/Buna Labs.jpg'),
    technologies: ['Content Strategy', 'Social Media', 'Analytics'],
    featured: false,
    tier: 'selected',
    primaryPillar: 'GROW',
    secondaryPillars: ['CREATE'],
    status: 'PUBLISHED',
    displayOrder: 15,
  },
];

// ── Insights: Case Studies ────────────────────────────────────────────────────
const CASE_STUDIES = [
  {
    type: 'CASE_STUDY',
    title: 'Medavail Pharmaceuticals — Company Profile Design',
    slug: 'medavail-pharmaceuticals-company-profile',
    excerpt: "Company profile design for Medavail Pharmaceuticals, an Ethiopia-based pharmaceutical and medical equipment import company.",
    content: `<h2>Overview</h2><p>Medavail Pharmaceuticals needed a professional company profile that could represent their vision and credibility to partners, investors, and healthcare stakeholders in Ethiopia and beyond.</p><h2>The Challenge</h2><p>Design a comprehensive company profile that communicates Medavail's expertise in pharmaceutical import and wholesale while maintaining a clean, trustworthy, and medically appropriate visual language.</p><h2>The Solution</h2><p>I developed a structured, professional company profile with a clean layout, consistent brand application, and clear hierarchy. Each section was designed to guide readers through the company story — mission, services, team, and contact — with visual clarity and professional tone.</p><h2>Results</h2><p>The company profile successfully elevated Medavail's professional presence, creating a credible document used in stakeholder meetings, partnership discussions, and market presentations.</p><h2>Deliverables</h2><ul><li>Full Company Profile (Print-ready PDF)</li><li>Digital Version (Screen-optimised)</li><li>Brand-consistent layouts</li><li>Cover and section dividers</li></ul>`,
    category: 'Company Profile Design',
    tags: ['pharmaceutical', 'company profile', 'print design', 'brand identity'],
    readingTime: 4,
    status: 'PUBLISHED',
    publishDate: new Date('2024-06-01'),
  },
  {
    type: 'CASE_STUDY',
    title: 'Alta Counseling — Brand Identity Redesign',
    slug: 'alta-counseling-brand-identity-redesign',
    excerpt: 'Brand identity redesign for Alta Counseling focused on clarity, trust, and consistency through a calm, professional visual system.',
    content: `<h2>Overview</h2><p>Alta Counseling Ethiopia required a brand identity redesign that reflected professionalism, trust, and a modern approach to counseling services.</p><h2>The Challenge</h2><p>The previous identity lacked consistency and did not effectively communicate the warmth and professionalism of a counseling practice. The new identity needed to appeal to both individual clients and corporate partners.</p><h2>The Solution</h2><p>I developed a refined visual system with a calming color palette, clean typography, and a refreshed logo that communicates care and reliability. The brand guidelines ensure consistent application across all materials.</p><h2>Results</h2><p>The redesigned identity improved brand recognition and trust among clients. The consistent visual system made it easier for the team to produce on-brand materials independently.</p><h2>Deliverables</h2><ul><li>Logo Redesign (primary, secondary, icon)</li><li>Brand Guidelines Document</li><li>Color Palette & Typography System</li><li>Stationery Design (business cards, letterhead)</li><li>Social Media Templates</li></ul>`,
    category: 'Brand Identity Redesign',
    tags: ['brand identity', 'logo design', 'counseling', 'rebrand'],
    readingTime: 5,
    status: 'PUBLISHED',
    publishDate: new Date('2024-07-15'),
  },
  {
    type: 'CASE_STUDY',
    title: 'Niqat Coffee — Social Media Campaign & Brand Presence',
    slug: 'niqat-coffee-social-media-campaign',
    excerpt: 'Social media campaign and content design for Niqat Coffee, building brand presence, visual consistency, and audience engagement from scratch.',
    content: `<h2>Overview</h2><p>Niqat Coffee needed to establish a strong social media presence and build audience engagement from the ground up.</p><h2>The Challenge</h2><p>Create a social media content strategy and visual system that stands out in a crowded coffee market, communicates premium quality, and builds a loyal online community.</p><h2>The Solution</h2><p>I designed a comprehensive social media visual system including post templates, story formats, and promotional graphics. Each design maintained brand consistency while allowing flexibility for different content types.</p><h2>Results</h2><p>Niqat Coffee's social media presence grew significantly following the campaign launch. The consistent visual identity helped establish brand recognition and drove increased engagement.</p><h2>Deliverables</h2><ul><li>Social Media Post Templates</li><li>Story & Reel Templates</li><li>Product Photography Direction</li><li>Promotional Campaign Graphics</li><li>Content Style Guide</li></ul>`,
    category: 'Social Media Campaign & Brand Presence',
    tags: ['social media', 'coffee', 'campaign design', 'digital marketing'],
    readingTime: 5,
    status: 'PUBLISHED',
    publishDate: new Date('2024-08-20'),
  },
  {
    type: 'CASE_STUDY',
    title: 'Andegna Furniture — Product Catalog Design',
    slug: 'andegna-furniture-product-catalog',
    excerpt: 'Product catalog design and visual direction for Andegna Furniture — clear, professional presentation of a wide range of furniture products.',
    content: `<h2>Overview</h2><p>Andegna Furniture needed a comprehensive product catalog that showcased their full range of furniture with clarity, elegance, and strong brand consistency.</p><h2>The Challenge</h2><p>Design a catalog that could present dozens of products with consistent visual quality, clear specifications, and a premium feel that matched the brand's market positioning.</p><h2>The Solution</h2><p>I designed a structured catalog layout with a clean grid system, consistent product photography guidelines, and clear typographic hierarchy.</p><h2>Results</h2><p>The catalog became a key sales tool for Andegna Furniture's showroom and client presentations.</p><h2>Deliverables</h2><ul><li>Full Product Catalog (Print-ready)</li><li>Digital PDF Version</li><li>Photography Direction Guidelines</li><li>Product Page Templates</li></ul>`,
    category: 'Product Catalog Design',
    tags: ['catalog design', 'furniture', 'print design', 'product photography'],
    readingTime: 4,
    status: 'PUBLISHED',
    publishDate: new Date('2024-09-10'),
  },
];

// ── Insights: Blog Posts ──────────────────────────────────────────────────────
const BLOG_POSTS = [
  {
    type: 'BLOG_POST',
    title: 'Essential Graphic Design Principles Every Designer Should Master',
    slug: 'essential-graphic-design-principles',
    excerpt: 'Explore the 7 fundamental principles of graphic design including balance, contrast, hierarchy, alignment, repetition, proportion, and movement.',
    content: `<h2>Introduction</h2><p>Every great design starts with a solid foundation. The 7 fundamental principles of graphic design are the building blocks that separate professional work from amateur attempts.</p><h2>1. Balance</h2><p>Balance refers to the visual weight of elements in a composition. Symmetrical balance creates a formal, stable feel while asymmetrical balance creates dynamic, interesting layouts.</p><h2>2. Contrast</h2><p>Contrast is the difference between elements — light vs dark, large vs small, simple vs complex. Strong contrast draws attention and creates visual interest.</p><h2>3. Hierarchy</h2><p>Visual hierarchy guides the viewer's eye through a composition in a specific order. Size, color, contrast, and position all contribute to hierarchy.</p><h2>4. Alignment</h2><p>Alignment creates order and organisation. Even when elements appear to float freely, they should be aligned to an invisible grid.</p><h2>5. Repetition</h2><p>Repetition creates consistency and unity. Repeating colors, fonts, shapes, and spacing throughout a design creates a cohesive system.</p><h2>6. Proportion</h2><p>Proportion refers to the size relationship between elements. The golden ratio and rule of thirds are classic proportion systems.</p><h2>7. Movement</h2><p>Movement guides the viewer's eye through a design. Lines, shapes, and the placement of elements can create a visual path.</p><h2>Conclusion</h2><p>Mastering these principles takes practice, but understanding them is the first step. Study great designs and identify which principles are at work.</p>`,
    category: 'Design Principles · Fundamentals',
    tags: ['design principles', 'graphic design', 'fundamentals', 'typography', 'layout'],
    readingTime: 7,
    status: 'PUBLISHED',
    publishDate: new Date('2025-01-15'),
  },
  {
    type: 'BLOG_POST',
    title: "Graphic Design Trends 2026: What's Shaping the Future",
    slug: 'graphic-design-trends-2026',
    excerpt: 'Discover the latest graphic design trends for 2026, from bold typography to sustainable design practices.',
    content: `<h2>Introduction</h2><p>Design trends reflect the cultural and technological moment we're in. In 2026, several powerful forces are shaping the visual landscape.</p><h2>1. Bold, Expressive Typography</h2><p>Typography is taking center stage. Large, bold display fonts with personality are replacing safe, corporate typefaces.</p><h2>2. Authentic Imperfection</h2><p>There's a growing desire for authenticity. Hand-drawn elements, imperfect textures, and deliberately raw aesthetics signal realness.</p><h2>3. Sustainable Design</h2><p>Sustainable design is about designing systems that last, reducing waste in digital and print workflows.</p><h2>4. AI-Assisted Creativity</h2><p>AI tools are becoming standard in the designer's toolkit. The most effective designers use AI for ideation and iteration — not replacement.</p><h2>5. Maximalism Returns</h2><p>After years of minimalism, maximalism is making a comeback. Rich layering, complex compositions, and visual abundance communicate confidence.</p><h2>6. Inclusive Design Systems</h2><p>Accessibility is no longer optional. Inclusive design is becoming a fundamental requirement for professional work.</p><h2>Conclusion</h2><p>The best designers don't chase trends — they understand them. Use these insights to inform your work, not dictate it.</p>`,
    category: 'Trends · 2026',
    tags: ['design trends', '2026', 'typography', 'AI design', 'sustainable design'],
    readingTime: 6,
    status: 'PUBLISHED',
    publishDate: new Date('2025-02-01'),
  },
  {
    type: 'BLOG_POST',
    title: 'Building Strong Brand Identities: A Complete Guide',
    slug: 'building-strong-brand-identities-complete-guide',
    excerpt: 'Learn how to create cohesive brand identities that resonate with audiences.',
    content: `<h2>Introduction</h2><p>A brand identity is more than a logo. It's the complete visual and emotional system that represents a company in the world.</p><h2>Step 1: Understand the Brand</h2><p>Before designing anything, deeply understand the brand — who they are, what they value, their audience, and their personality.</p><h2>Step 2: Research Competitors</h2><p>Understanding the visual landscape helps you design something that stands out. Look for patterns and find opportunities to differentiate.</p><h2>Step 3: Design the Logo</h2><p>The logo is the cornerstone of the brand identity. It should work at every size, in color and black and white.</p><h2>Step 4: Establish Color and Typography</h2><p>Color and typography carry enormous emotional weight. Choose a color palette that reflects the brand's personality.</p><h2>Step 5: Build Brand Applications</h2><p>A brand identity comes to life through applications — business cards, letterheads, social media, packaging, signage.</p><h2>Step 6: Document Everything</h2><p>A brand guidelines document ensures the identity is applied consistently by everyone.</p><h2>Conclusion</h2><p>Building a strong brand identity is one of the most rewarding challenges in design.</p>`,
    category: 'Brand Design · Identity',
    tags: ['brand identity', 'logo design', 'brand guidelines', 'visual system'],
    readingTime: 8,
    status: 'PUBLISHED',
    publishDate: new Date('2025-03-10'),
  },
  {
    type: 'BLOG_POST',
    title: 'Why Consistency Is the Real Luxury in Branding',
    slug: 'why-consistency-is-the-real-luxury-in-branding',
    excerpt: "Consistency is often mistaken for repetition. In reality, it's discipline. Strong brands rely on systems that work everywhere.",
    content: `<h2>Introduction</h2><p>The most powerful brands in the world share one common trait: consistency. Not because they're boring, but because trust is built through repetition of the right signals.</p><h2>Consistency vs Repetition</h2><p>Consistency isn't doing the same thing over and over. It's maintaining the same principles while adapting to different contexts.</p><h2>The System Behind the Consistency</h2><p>Consistent brands have built systems. Brand guidelines, design systems, tone of voice documents — these are creative infrastructure, not bureaucracy.</p><h2>Why Inconsistency Is Expensive</h2><p>Every time a brand sends mixed signals, it erodes trust. Audiences notice inconsistency even when they can't articulate why.</p><h2>Building for Consistency</h2><p>Build systems that make the right choice the easy choice. When brand assets are easily accessible, teams use them correctly.</p><h2>Consistency Over Time</h2><p>The most valuable consistency is over time. Brands that maintain their core identity through decades build recognition money can't buy quickly.</p><h2>Conclusion</h2><p>Consistency is a competitive advantage. A brand that remains recognisable and trustworthy becomes a landmark that audiences return to.</p>`,
    category: 'Brand Design · Strategy',
    tags: ['branding', 'consistency', 'brand strategy', 'design systems'],
    readingTime: 5,
    status: 'PUBLISHED',
    publishDate: new Date('2025-04-05'),
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding projects and insights from frontend data...\n');

  // ── Projects ────────────────────────────────────────────────────────────────
  console.log('📁 Upserting projects...');
  for (const p of PROJECTS) {
    const { secondaryPillars, ...rest } = p;
    await prisma.project.upsert({
      where:  { slug: p.slug },
      update: {
        ...rest,
        secondaryPillars: secondaryPillars ?? [],
        thumbnailPublicId: null,
      },
      create: {
        ...rest,
        secondaryPillars: secondaryPillars ?? [],
        thumbnailPublicId: null,
        githubUrl: null,
      },
    });
    console.log(`  ✅ Project: ${p.title}`);
  }

  // ── Case Studies ────────────────────────────────────────────────────────────
  console.log('\n📖 Upserting case studies...');
  for (const cs of CASE_STUDIES) {
    await prisma.insight.upsert({
      where:  { slug: cs.slug },
      update: { ...cs, updatedAt: new Date() },
      create: { ...cs, coverImage: null, coverPublicId: null },
    });
    console.log(`  ✅ Case Study: ${cs.title}`);
  }

  // ── Blog Posts ──────────────────────────────────────────────────────────────
  console.log('\n📝 Upserting blog posts...');
  for (const bp of BLOG_POSTS) {
    await prisma.insight.upsert({
      where:  { slug: bp.slug },
      update: { ...bp, updatedAt: new Date() },
      create: { ...bp, coverImage: null, coverPublicId: null },
    });
    console.log(`  ✅ Blog Post: ${bp.title}`);
  }

  console.log('\n✨ Seed complete!');
  console.log(`\n📌 Notes:`);
  console.log(`   • Project thumbnails point to ${FRONTEND_BASE_URL}/...`);
  console.log(`     They'll show in the admin immediately. Upload proper Cloudinary`);
  console.log(`     images via the admin edit page to replace them.`);
  console.log(`   • Insights have no cover images — upload them via the admin.\n`);

  // ── Capabilities ─────────────────────────────────────────────────────────────
  const CAPABILITIES = [
    { pillar: 'CREATE', label: 'Create', headline: 'Creative Direction & Brand Design', description: 'Brand identity systems, visual communication, creative direction, and art direction for brands that need to make a clear and lasting first impression.', displayOrder: 1, isActive: true },
    { pillar: 'BUILD',  label: 'Build',  headline: 'Digital Products & Web Development', description: 'Websites, web applications, and digital products — from concept through design and development to a live, working product.', displayOrder: 2, isActive: true },
    { pillar: 'GROW',   label: 'Grow',   headline: 'Digital Marketing & Social Media', description: 'Social media strategy, content creation, digital marketing campaigns, advertising, and analytics to build an audience and drive measurable growth.', displayOrder: 3, isActive: true },
  ];

  console.log('\n🎯 Upserting capabilities...');
  for (const c of CAPABILITIES) {
    const existing = await prisma.capability.findFirst({ where: { pillar: c.pillar } });
    if (existing) {
      await prisma.capability.update({ where: { id: existing.id }, data: c });
    } else {
      await prisma.capability.create({ data: c });
    }
    console.log(`  ✅ Capability: ${c.label}`);
  }

  // ── Working Principles ────────────────────────────────────────────────────────
  const PRINCIPLES = [
    { number: '01', heading: 'Concept first.', body: 'Every project starts with a clear idea of what it should feel like and who it is for. Design and code without direction is just decoration.', displayOrder: 1, isActive: true },
    { number: '02', heading: 'Make it real.', body: 'Strategy only becomes valuable when it ships. The goal is always a working product, a live brand, a published campaign — not a finished presentation.', displayOrder: 2, isActive: true },
    { number: '03', heading: 'Grow from evidence.', body: 'What performs, scales. Analytics, feedback, and iteration are part of the work — not an afterthought added once something is live.', displayOrder: 3, isActive: true },
  ];

  console.log('\n💡 Upserting working principles...');
  for (const p of PRINCIPLES) {
    const existing = await prisma.workingPrinciple.findFirst({ where: { number: p.number } });
    if (existing) {
      await prisma.workingPrinciple.update({ where: { id: existing.id }, data: p });
    } else {
      await prisma.workingPrinciple.create({ data: p });
    }
    console.log(`  ✅ Principle: ${p.number} ${p.heading}`);
  }
}

main()
  .catch((e) => { console.error('\n❌ Seed failed:', e.message); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
