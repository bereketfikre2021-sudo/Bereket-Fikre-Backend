/**
 * Database Seed Script
 * Seeds: admin, services, FAQs, partners, testimonials, projects, insights
 * Run: node prisma/seed.js  (from Backend folder)
 */
'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ── ADMIN ──────────────────────────────────────────────────────────────────
  const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@bereketfikre.et';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe!Strong#2024';
  const adminName     = process.env.ADMIN_NAME     || 'Bereket Fikre';

  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 12);
    await prisma.admin.create({
      data: { name: adminName, email: adminEmail, password: hashed, role: 'SUPER_ADMIN' },
    });
    console.log(`✅ Admin created: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Admin already exists: ${adminEmail}`);
  }

  // ── SERVICES ───────────────────────────────────────────────────────────────
  const services = [
    { serviceNumber:'01', title:'Brand Identity',    slug:'brand-identity',    category:'Branding Service',  shortDescription:'Logo design, visual systems, brand consistency',            fullDescription:'Complete brand identity systems that establish a memorable visual language for your business.',          bulletPoints:['Logo Design','Visual Systems','Brand Consistency','Brand Guidelines','Color Palette & Typography','Brand Applications'],    technologies:['Adobe Illustrator','Adobe Photoshop','Figma','Adobe InDesign'],  ctaText:'Request Brand Identity',  ctaLink:'#contact', displayOrder:1, featured:true, isActive:true, type:'Complete Branding',           deliveryTime:'14-21 Business Days' },
    { serviceNumber:'02', title:'Creative Direction', slug:'creative-direction', category:'Creative Service',  shortDescription:'Concept development, visual storytelling, art direction',     fullDescription:'Strategic creative direction that transforms concepts into compelling visual narratives.',              bulletPoints:['Concept Development','Visual Storytelling','Art Direction','Campaign Direction','Creative Strategy','Visual Communication'], technologies:['Adobe Creative Suite','Figma','Sketch','Miro'],                   ctaText:'Discuss Your Vision',      ctaLink:'#contact', displayOrder:2, featured:true, isActive:true, type:'Creative Leadership',         deliveryTime:'7-14 Business Days'  },
    { serviceNumber:'03', title:'Digital Design',     slug:'digital-design',     category:'Digital Service',   shortDescription:'Social media visuals, campaigns, content creation',          fullDescription:'High-impact digital design solutions for every screen and platform.',                                  bulletPoints:['Social Media Visuals','Digital Campaigns','Content Creation','Web Visuals','Digital Branding','Online Marketing Materials'],  technologies:['Adobe Photoshop','Adobe Illustrator','Figma','Canva Pro'],        ctaText:'Start Digital Campaign',   ctaLink:'#contact', displayOrder:3, featured:true, isActive:true, type:'Digital Design',              deliveryTime:'7-14 Business Days'  },
    { serviceNumber:'04', title:'Print & Marketing',  slug:'print-marketing',    category:'Print Service',     shortDescription:'Catalogs, brochures, brand collateral',                     fullDescription:'Print design that commands attention and leaves a lasting impression.',                                  bulletPoints:['Catalogs','Brochures','Brand Collateral','Print Marketing Materials','Brand Applications','Marketing Design'],               technologies:['Adobe InDesign','Adobe Illustrator','Adobe Photoshop'],           ctaText:'Get Print Design',         ctaLink:'#contact', displayOrder:4, featured:true, isActive:true, type:'Print & Marketing Design',    deliveryTime:'7-14 Business Days'  },
  ];
  for (const s of services) {
    const ex = await prisma.service.findUnique({ where: { slug: s.slug } });
    if (!ex) { await prisma.service.create({ data: s }); console.log(`✅ Service: ${s.title}`); }
    else       { console.log(`ℹ️  Service exists: ${s.title}`); }
  }

  // ── PROJECTS — complete list matching Portfolio.jsx exactly ─────────────────
  // featured:true  = shown in "Recent Projects" tab (RECENT_PROJECT_IDS in frontend)
  // service field  = maps to frontend filter tabs
  const projects = [
    // ── BRAND IDENTITY (service: brand-identity-design) ──────────────────────
    { slug:'full-brand-identity-swan-clothing',              title:'Full Brand Identity - Swan Clothing',                             category:'Brand Identity',           shortDescription:'Complete brand identity for a modern fashion brand.',                     fullDescription:'Complete brand identity package including logo design, product packaging mockups, and comprehensive brand guidelines for a modern fashion brand.',           technologies:['Adobe Illustrator','Adobe Photoshop'],            status:'PUBLISHED', featured:false, displayOrder:1  },
    { slug:'full-brand-identity-dayer-engineering',          title:'Full Brand Identity - Dayer Engineering PLC',                     category:'Brand Identity',           shortDescription:'Comprehensive brand identity system for an engineering company.',         fullDescription:'Comprehensive brand identity system including logo design, brand guidelines, and corporate materials for an engineering company.',                         technologies:['Adobe Illustrator','Adobe InDesign'],             status:'PUBLISHED', featured:false, displayOrder:2  },
    { slug:'brand-identity-maleda-coffee',                   title:'Brand Identity - Maleda Coffee',                                  category:'Brand Identity',           shortDescription:'Premium coffee brand identity with rich visual storytelling.',             fullDescription:'Premium coffee brand identity with rich visual storytelling, packaging design, and complete brand experience from bean to cup.',                           technologies:['Adobe Illustrator','Adobe Photoshop'],            status:'PUBLISHED', featured:false, displayOrder:3  },
    { slug:'company-logo-rebranding-alta-counseling',        title:'Company Logo Rebranding - Alta Counseling Ethiopia',               category:'Brand Identity',           shortDescription:'Complete brand identity and logo rebranding for Alta Counseling Ethiopia.', fullDescription:'Complete brand identity and logo rebranding including refreshed logo design, brand guidelines, and visual identity system.',                                technologies:['Adobe Illustrator'],                              status:'PUBLISHED', featured:false, displayOrder:4  },
    { slug:'full-brand-identity-raya-hotel',                 title:'Full Brand Identity - Raya Hotel & Convention Center',             category:'Brand Identity',           shortDescription:'Comprehensive brand identity system for a hospitality and convention center.', fullDescription:'Comprehensive brand identity system including logo design, brand guidelines, visual identity, color palette, typography, and complete brand applications.', technologies:['Adobe Illustrator','Adobe Photoshop','Adobe InDesign'], status:'PUBLISHED', featured:false, displayOrder:5  },
    { slug:'brand-identity-medavail-pharmaceutical',         title:'Brand Identity - Medavail Pharmaceutical Import & Wholesale',      category:'Brand Identity',           shortDescription:'Brand identity to strengthen credibility and professional market presence.', fullDescription:'Brand identity development for Medavail Pharmaceutical Import & Wholesale to strengthen credibility, recognition, and professional market presence.',    technologies:['Adobe Illustrator','Adobe InDesign'],             status:'PUBLISHED', featured:false, displayOrder:6  },
    { slug:'brand-identity-basha-bekele-coffee',             title:'Brand Identity - Basha Bekele Specialty Coffee',                   category:'Brand Identity',           shortDescription:'Brand identity to communicate quality, origin, and premium export positioning.', fullDescription:'Brand identity for Basha Bekele Specialty Coffee Producer & Exporter, crafted to communicate quality, origin, and a premium export-ready brand presence.',technologies:['Adobe Illustrator','Adobe Photoshop'],            status:'PUBLISHED', featured:false, displayOrder:7  },
    { slug:'brand-identity-digital-deresegn',                title:'Brand Identity - Digital Deresegn',                                category:'Brand Identity',           shortDescription:'Complete visual identity direction including brand look-and-feel and adaptable assets.', fullDescription:'Complete visual identity direction for Digital Deresegn, including brand look-and-feel, design consistency, and adaptable brand assets.',         technologies:['Adobe Illustrator','Figma'],                      status:'PUBLISHED', featured:false, displayOrder:8  },
    { slug:'brand-identity-criterion-home-care',             title:'Brand Identity - Criterion In Home Care (USA)',                    category:'Brand Identity',           shortDescription:'Professional brand identity focused on trust, care, and clean visual system.', fullDescription:'Professional brand identity for Criterion In Home Care (USA) focused on trust, care, and a clean visual system for service communication.',            technologies:['Adobe Illustrator','Adobe InDesign'],             status:'PUBLISHED', featured:false, displayOrder:9  },

    // ── PRINT & MARKETING (service: print-design) ────────────────────────────
    { slug:'a5-flyer-design-ptgr',                           title:'A5 Flyer Design - PTGR',                                          category:'Print \& Marketing',                    shortDescription:'Professional A5 flyer design featuring modern layouts and compelling visuals.', fullDescription:'Professional A5 flyer design featuring modern layouts, compelling visuals, and clear messaging for marketing campaigns.',                                technologies:['Adobe Photoshop','Adobe Illustrator'],            status:'PUBLISHED', featured:false, displayOrder:10 },
    { slug:'business-card-design-digital-deresegn',          title:'Business Card Design - Digital Deresegn',                          category:'Print \& Marketing',                    shortDescription:'Professional business card with clean, brand-consistent layout.',          fullDescription:'Professional business card design for Digital Deresegn with a clean, brand-consistent layout optimized for clear contact communication.',               technologies:['Adobe Illustrator','Adobe InDesign'],             status:'PUBLISHED', featured:false, displayOrder:11 },
    { slug:'flyer-design-digital-deresegn',                  title:'Flyer Design - Digital Deresegn',                                  category:'Print \& Marketing',                    shortDescription:'Marketing flyer focused on strong hierarchy and visual impact.',            fullDescription:'Marketing flyer design for Digital Deresegn focused on strong hierarchy, clear messaging, and visual impact for campaign distribution.',                technologies:['Adobe Photoshop','Adobe Illustrator'],            status:'PUBLISHED', featured:false, displayOrder:12 },
    { slug:'employee-id-design-prime-ethiopia',              title:'Employee ID Design - Prime Ethiopia',                               category:'Print \& Marketing',                    shortDescription:'Professional employee ID card design with clear layout and print-ready specifications.', fullDescription:'Professional employee ID card design for Prime Ethiopia, featuring clear layout, branding, and print-ready specifications for corporate identification.',technologies:['Adobe InDesign','Adobe Illustrator'],             status:'PUBLISHED', featured:false, displayOrder:13 },
    { slug:'prime-ethiopia-business-proposal',               title:'Prime Ethiopia Business Proposal Cover',                           category:'Print \& Marketing',                    shortDescription:'Professional business proposal cover with modern layout and corporate branding.', fullDescription:'Professional business proposal cover design for Prime Ethiopia, featuring modern layout and corporate branding for company proposal documents.',       technologies:['Adobe InDesign','Adobe Illustrator'],             status:'PUBLISHED', featured:false, displayOrder:14 },

    // ── BRAND APPLICATIONS (service: brand-applications-assets) ──────────────
    { slug:'rollup-banner-yat-business-group',               title:'Rollup Banner Design - YAT Business Group',                        category:'Print \& Marketing',       shortDescription:'Professional rollup banner mockup for exhibitions and corporate events.',    fullDescription:'Professional rollup banner mockup design for exhibitions and corporate events, showcasing brand identity and messaging.',                               technologies:['Adobe Illustrator','Adobe Photoshop'],            status:'PUBLISHED', featured:false, displayOrder:15 },

    // ── DIGITAL / WEB (service: digital-social-media-design) ─────────────────
    { slug:'website-banner-design-finix-bet-1',              title:'Website Banner Design - Finix Bet',                                category:'Digital Design � Web Banners',     shortDescription:'Professional website banner optimized for web display and digital marketing.', fullDescription:'Professional website banner design for Finix Bet, optimized for web display and digital marketing campaigns.',                                          technologies:['Adobe Photoshop'],                               status:'PUBLISHED', featured:false, displayOrder:16 },
    { slug:'website-banner-collection-finix-bet-2',          title:'Website Banner Collection - Finix Bet (Series 2)',                 category:'Digital Design � Web Banners',     shortDescription:'Website banner featuring modern layouts and engaging visuals.',             fullDescription:'Website banner design featuring modern layouts and engaging visuals for effective online presence.',                                                   technologies:['Adobe Photoshop'],                               status:'PUBLISHED', featured:false, displayOrder:17 },
    { slug:'web-banner-design-finix-bet-3',                  title:'Web Banner Design - Finix Bet (Series 3)',                         category:'Digital Design � Web Banners',     shortDescription:'Professional web banner optimized for various screen sizes and digital platforms.', fullDescription:'Professional web banner design optimized for various screen sizes and digital platforms.',                                                         technologies:['Adobe Photoshop'],                               status:'PUBLISHED', featured:false, displayOrder:18 },
    { slug:'website-banner-series-finix-bet-4',              title:'Website Banner Series - Finix Bet (Series 4)',                     category:'Digital Design � Web Banners',     shortDescription:'Comprehensive website banner series for consistent brand communication.',    fullDescription:'Comprehensive website banner series designed for consistent brand communication across digital platforms.',                                             technologies:['Adobe Photoshop'],                               status:'PUBLISHED', featured:false, displayOrder:19 },
    { slug:'web-banner-assets-finix-bet-5',                  title:'Web Banner Assets - Finix Bet (Series 5)',                         category:'Digital Design � Web Banners',     shortDescription:'Professional web banner assets featuring modern design for digital marketing.', fullDescription:'Professional web banner assets featuring modern design and engaging visuals for digital marketing.',                                                   technologies:['Adobe Photoshop'],                               status:'PUBLISHED', featured:false, displayOrder:20 },
    { slug:'website-banner-collection-finix-bet-10',         title:'Website Banner Collection - Finix Bet (Series 10)',                category:'Digital Design � Web Banners',     shortDescription:'Engaging website banner collection for digital marketing.',                 fullDescription:'Engaging website banner collection featuring modern design and compelling visuals for digital marketing.',                                              technologies:['Adobe Photoshop'],                               status:'PUBLISHED', featured:false, displayOrder:21 },

    // ── SOCIAL MEDIA (service: marketing-campaign-design) ────────────────────
    { slug:'karaoke-event-social-media-blu-hart',            title:'Karaoke Event Social Media - Blu Hart',                            category:'Digital Design � Social Media',       shortDescription:'Social media design collection for a karaoke event to drive attendance.',   fullDescription:'Social media design collection for a karaoke event, featuring engaging posts and promotional graphics to drive event attendance and engagement.',      technologies:['Adobe Photoshop','Figma'],                        status:'PUBLISHED', featured:false, displayOrder:22 },
    { slug:'social-media-design-ace-stainless-steel',        title:'Social Media Design - Ace Stainless Steel',                        category:'Digital Design � Social Media',       shortDescription:'Professional social media design showcasing products and services.',         fullDescription:'Professional social media design collection for a stainless steel manufacturing company, showcasing products and services.',                          technologies:['Adobe Photoshop','Figma'],                        status:'PUBLISHED', featured:false, displayOrder:23 },
    { slug:'social-media-design-awra-designs',               title:'Social Media Design - Awra Designs',                               category:'Digital Design � Social Media',       shortDescription:'Professional social media collection for digital marketing campaigns.',       fullDescription:'Professional social media design collection for Awra Designs, featuring engaging posts and promotional graphics for digital marketing campaigns.',     technologies:['Adobe Photoshop','Figma'],                        status:'PUBLISHED', featured:false, displayOrder:24 },
    { slug:'social-media-post-digital-deresegn',             title:'Social Media Post Design - Digital Deresegn',                      category:'Digital Design � Social Media',       shortDescription:'Social media post for brand consistency and campaign-ready publishing.',     fullDescription:'Social media post design for Digital Deresegn built for brand consistency, strong engagement, and campaign-ready digital publishing.',                technologies:['Adobe Photoshop','Figma'],                        status:'PUBLISHED', featured:false, displayOrder:25 },
    { slug:'social-media-graphics-niqat-coffee',             title:'Social Media Graphics Collection - Niqat Coffee',                  category:'Digital Design � Social Media',       shortDescription:'Comprehensive social media graphics for digital marketing campaigns.',       fullDescription:'Comprehensive collection of social media graphics designed for various digital marketing campaigns and promotions.',                                    technologies:['Adobe Photoshop','Figma'],                        status:'PUBLISHED', featured:false, displayOrder:26 },
    { slug:'social-media-design-prime-ethiopia',             title:'Social Media Design - Prime Ethiopia',                             category:'Digital Design � Social Media',       shortDescription:'Professional social media collection for digital marketing campaigns.',       fullDescription:'Professional social media design collection for Prime Ethiopia, featuring engaging posts and promotional graphics for digital marketing campaigns.',   technologies:['Adobe Photoshop','Figma'],                        status:'PUBLISHED', featured:false, displayOrder:27 },
    { slug:'social-media-design-prime-ethiopia-2',           title:'Social Media Design For Prime Ethiopia (Campaign)',                 category:'Digital Design � Social Media',       shortDescription:'Campaign social media visual for strong reach and consistent brand presentation.', fullDescription:'Campaign social media visual for Prime Ethiopia designed for strong reach, fast readability, and consistent brand presentation.',                    technologies:['Adobe Photoshop','Figma'],                        status:'PUBLISHED', featured:false, displayOrder:28 },
    { slug:'social-media-template-task-plug',                title:'Social Media Template Series - Task Plug',                         category:'Digital Design � Social Media',       shortDescription:'Social media template with promotional graphics for digital marketing.',     fullDescription:'Additional social media template design featuring promotional graphics and engaging visual content for digital marketing.',                            technologies:['Adobe Photoshop','Figma'],                        status:'PUBLISHED', featured:false, displayOrder:29 },

    // ── CREATIVE DIRECTION (service: art-direction-visual-guidance) ───────────
    { slug:'creative-direction-visual-guidance-1',           title:'Creative Direction & Visual Guidance - Project 1',                 category:'Creative Direction',   shortDescription:'Comprehensive creative direction for product presentation and brand assets.', fullDescription:'Comprehensive creative direction and visual guidance for product presentation, photography, and creative assets across multiple touchpoints.',         technologies:['Adobe Creative Suite'],                          status:'PUBLISHED', featured:false, displayOrder:30 },
    { slug:'creative-direction-visual-guidance-2',           title:'Creative Direction & Visual Guidance - Project 2',                 category:'Creative Direction',   shortDescription:'Professional creative direction for campaigns and brand storytelling.',       fullDescription:'Professional creative direction and visual guidance for creative campaigns and brand storytelling, including photography and video production guidance.',technologies:['Adobe Creative Suite'],                          status:'PUBLISHED', featured:false, displayOrder:31 },
    { slug:'creative-direction-visual-guidance-3',           title:'Creative Direction & Visual Guidance - Project 3',                 category:'Creative Direction',   shortDescription:'Strategic creative direction for product launches and marketing initiatives.', fullDescription:'Strategic creative direction for product launches and marketing initiatives, including visual guidelines for product photography.',                    technologies:['Adobe Creative Suite'],                          status:'PUBLISHED', featured:false, displayOrder:32 },
    { slug:'creative-direction-visual-guidance-4',           title:'Creative Direction & Visual Guidance - Project 4',                 category:'Creative Direction',   shortDescription:'Comprehensive creative direction for brand campaigns and visual communication.', fullDescription:'Comprehensive creative direction for brand campaigns and visual communication, encompassing concepts, style guides, and direction for photo/video teams.', technologies:['Adobe Creative Suite'],                         status:'PUBLISHED', featured:false, displayOrder:33 },
    { slug:'creative-direction-visual-guidance-5',           title:'Creative Direction & Visual Guidance - Project 5',                 category:'Creative Direction',   shortDescription:'Professional creative direction for digital and print marketing materials.',   fullDescription:'Professional creative direction for digital and print marketing materials, including social media content, advertising campaigns, and promotional materials.', technologies:['Adobe Creative Suite'],                        status:'PUBLISHED', featured:false, displayOrder:34 },
    { slug:'creative-direction-visual-guidance-6',           title:'Creative Direction & Visual Guidance - Project 6',                 category:'Creative Direction',   shortDescription:'Strategic creative direction for brand campaigns and visual storytelling.',    fullDescription:'Strategic creative direction for brand campaigns and visual storytelling, directing creative teams and ensuring brand consistency across all visual touchpoints.', technologies:['Adobe Creative Suite'],                       status:'PUBLISHED', featured:false, displayOrder:35 },

    // ── RECENT PROJECTS (featured:true = shown in "Recent Projects" tab) ──────
    // These match RECENT_PROJECT_IDS in Frontend/src/components/Portfolio.jsx
    { slug:'flyer-design-prime-ethiopia',                    title:'Flyer Design - Prime Ethiopia',                                    category:'Print \& Marketing',                    shortDescription:'Professional flyer featuring compelling visuals for marketing campaigns.',     fullDescription:'Professional flyer design for Prime Ethiopia, featuring compelling visuals and clear messaging for marketing campaigns.',                               technologies:['Adobe Photoshop','Adobe Illustrator'],            status:'PUBLISHED', featured:true,  displayOrder:36, category:'Recent Projects' },
    { slug:'premium-coffee-packaging-toco',                  title:'Premium Coffee Packaging - Toco Speciality Coffee',                category:'Print \& Marketing',       shortDescription:'Premium packaging combining visual appeal with functional design.',           fullDescription:'Premium packaging design for Toco Speciality Coffee, combining visual appeal with functional design for retail and distribution.',                     technologies:['Adobe Illustrator','Adobe Photoshop'],            status:'PUBLISHED', featured:true,  displayOrder:37, category:'Recent Projects' },
    { slug:'rollup-banner-toco-coffee',                      title:'Rollup Banner - Toco Speciality Coffee',                           category:'Print \& Marketing',       shortDescription:'Professional rollup banner for exhibitions and retail environments.',          fullDescription:'Professional rollup banner design for Toco Speciality Coffee, showcasing brand identity for exhibitions and retail environments.',                     technologies:['Adobe Illustrator'],                              status:'PUBLISHED', featured:true,  displayOrder:38, category:'Recent Projects' },
    { slug:'trifold-brochure-ptgr',                          title:'Trifold Brochure - PTGR',                                          category:'Print \& Marketing',                    shortDescription:'Professional trifold brochure featuring modern layouts for marketing materials.', fullDescription:'Professional trifold brochure design for PTGR, featuring modern layouts and engaging visual content for marketing materials.',                        technologies:['Adobe InDesign','Adobe Illustrator'],             status:'PUBLISHED', featured:true,  displayOrder:39, category:'Recent Projects' },
    { slug:'company-profile-cci-utop-goozam',                title:'Company Profile - CCI, Utop & Goozam Technologies',                category:'Print \& Marketing',                    shortDescription:'Professional company profile for print and digital use.',                     fullDescription:'Professional company profile design for CCI, Utop and Goozam Technologies, showcasing brand identity, services, and corporate messaging.',             technologies:['Adobe InDesign','Adobe Illustrator'],             status:'PUBLISHED', featured:true,  displayOrder:40, category:'Recent Projects' },
    { slug:'course-outline-cci-usa',                         title:'Course Outline - Center For Computer Intelligence (CCI)',           category:'Print \& Marketing',                    shortDescription:'Professional course outline design for educational materials.',               fullDescription:'Professional course outline design for Center For Computer Intelligence (CCI) USA, featuring clear structure and engaging layout for educational materials.', technologies:['Adobe InDesign'],                             status:'PUBLISHED', featured:true,  displayOrder:41, category:'Recent Projects' },
  ];

  const existingProjectCount = await prisma.project.count();
  if (existingProjectCount === 0) {
    for (const p of projects) {
      await prisma.project.create({
        data: { ...p, liveUrl: null, githubUrl: null, thumbnail: null, thumbnailPublicId: null },
      });
      console.log(`✅ Project: ${p.title}`);
    }
  } else {
    console.log(`ℹ️  Projects already seeded (${existingProjectCount} found) — skipping to preserve manual changes.`);
  }

  // ── INSIGHTS: CASE STUDIES (from CaseStudyModal / Insights.jsx) ────────────
  const caseStudies = [
    {
      type: 'CASE_STUDY',
      title: 'Medavail Pharmaceuticals — Company Profile Design',
      slug: 'medavail-pharmaceuticals-company-profile',
      excerpt: 'Company profile design for Medavail Pharmaceuticals, an Ethiopia-based pharmaceutical and medical equipment import company. The profile communicates Medavail\'s vision, credibility, and operational strength to partners and stakeholders.',
      content: `<h2>Overview</h2><p>Medavail Pharmaceuticals needed a professional company profile that could represent their vision and credibility to partners, investors, and healthcare stakeholders in Ethiopia and beyond.</p><h2>The Challenge</h2><p>Design a comprehensive company profile that communicates Medavail's expertise in pharmaceutical import and wholesale while maintaining a clean, trustworthy, and medically appropriate visual language.</p><h2>The Solution</h2><p>I developed a structured, professional company profile with a clean layout, consistent brand application, and clear hierarchy. Each section was designed to guide readers through the company story — mission, services, team, and contact — with visual clarity and professional tone.</p><h2>Results</h2><p>The company profile successfully elevated Medavail's professional presence, creating a credible document used in stakeholder meetings, partnership discussions, and market presentations.</p><h2>Deliverables</h2><ul><li>Full Company Profile (Print-ready PDF)</li><li>Digital Version (Screen-optimised)</li><li>Brand-consistent layouts</li><li>Cover and section dividers</li></ul>`,
      category: 'Company Profile Design',
      tags: ['pharmaceutical', 'company profile', 'print design', 'brand identity'],
      author: 'Bereket Fikre',
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
      author: 'Bereket Fikre',
      readingTime: 5,
      status: 'PUBLISHED',
      publishDate: new Date('2024-07-15'),
    },
    {
      type: 'CASE_STUDY',
      title: 'Niqat Coffee — Social Media Campaign & Brand Presence',
      slug: 'niqat-coffee-social-media-campaign',
      excerpt: 'Social media campaign and content design for Niqat Coffee, building brand presence, visual consistency, and audience engagement from scratch.',
      content: `<h2>Overview</h2><p>Niqat Coffee needed to establish a strong social media presence and build audience engagement from the ground up. The brand required a cohesive visual identity for digital platforms.</p><h2>The Challenge</h2><p>Create a social media content strategy and visual system that stands out in a crowded coffee market, communicates premium quality, and builds a loyal online community.</p><h2>The Solution</h2><p>I designed a comprehensive social media visual system including post templates, story formats, and promotional graphics. Each design maintained brand consistency while allowing flexibility for different content types — product showcases, promotions, and storytelling.</p><h2>Results</h2><p>Niqat Coffee's social media presence grew significantly following the campaign launch. The consistent visual identity helped establish brand recognition and drove increased engagement across platforms.</p><h2>Deliverables</h2><ul><li>Social Media Post Templates</li><li>Story & Reel Templates</li><li>Product Photography Direction</li><li>Promotional Campaign Graphics</li><li>Content Style Guide</li></ul>`,
      category: 'Social Media Campaign & Brand Presence',
      tags: ['social media', 'coffee', 'campaign design', 'digital marketing'],
      author: 'Bereket Fikre',
      readingTime: 5,
      status: 'PUBLISHED',
      publishDate: new Date('2024-08-20'),
    },
    {
      type: 'CASE_STUDY',
      title: 'Andegna Furniture — Product Catalog Design',
      slug: 'andegna-furniture-product-catalog',
      excerpt: 'Product catalog design and visual direction for Andegna Furniture — clear, professional presentation of a wide range of furniture products.',
      content: `<h2>Overview</h2><p>Andegna Furniture needed a comprehensive product catalog that showcased their full range of furniture with clarity, elegance, and strong brand consistency.</p><h2>The Challenge</h2><p>Design a catalog that could present dozens of products with consistent visual quality, clear specifications, and a premium feel that matched the brand's market positioning.</p><h2>The Solution</h2><p>I designed a structured catalog layout with a clean grid system, consistent product photography guidelines, and clear typographic hierarchy. The design allows readers to easily browse and compare products while maintaining a premium aesthetic throughout.</p><h2>Results</h2><p>The catalog became a key sales tool for Andegna Furniture's showroom and client presentations. The professional presentation helped establish the brand's premium positioning and improved the sales process.</p><h2>Deliverables</h2><ul><li>Full Product Catalog (Print-ready)</li><li>Digital PDF Version</li><li>Photography Direction Guidelines</li><li>Product Page Templates</li></ul>`,
      category: 'Product Catalog Design',
      tags: ['catalog design', 'furniture', 'print design', 'product photography'],
      author: 'Bereket Fikre',
      readingTime: 4,
      status: 'PUBLISHED',
      publishDate: new Date('2024-09-10'),
    },
  ];

  for (const cs of caseStudies) {
    const ex = await prisma.insight.findUnique({ where: { slug: cs.slug } });
    if (!ex) {
      await prisma.insight.create({ data: { ...cs, coverImage: null, coverPublicId: null } });
      console.log(`✅ Case Study: ${cs.title}`);
    } else {
      console.log(`ℹ️  Case Study exists: ${cs.title}`);
    }
  }

  // ── INSIGHTS: DESIGN BLOGS (from BlogModal / Insights.jsx) ─────────────────
  const blogPosts = [
    {
      type: 'BLOG_POST',
      title: 'Essential Graphic Design Principles Every Designer Should Master',
      slug: 'essential-graphic-design-principles',
      excerpt: 'Explore the 7 fundamental principles of graphic design including balance, contrast, hierarchy, alignment, repetition, proportion, and movement.',
      content: `<h2>Introduction</h2><p>Every great design starts with a solid foundation. The 7 fundamental principles of graphic design are the building blocks that separate professional work from amateur attempts. Whether you're designing a logo, a poster, or a website, these principles guide every decision.</p><h2>1. Balance</h2><p>Balance refers to the visual weight of elements in a composition. Symmetrical balance creates a formal, stable feel while asymmetrical balance creates dynamic, interesting layouts. Neither is inherently better — the choice depends on the message you want to communicate.</p><h2>2. Contrast</h2><p>Contrast is the difference between elements — light vs dark, large vs small, simple vs complex. Strong contrast draws attention and creates visual interest. Without contrast, designs feel flat and forgettable.</p><h2>3. Hierarchy</h2><p>Visual hierarchy guides the viewer's eye through a composition in a specific order. Size, color, contrast, and position all contribute to hierarchy. A clear hierarchy ensures the most important information is seen first.</p><h2>4. Alignment</h2><p>Alignment creates order and organisation. Even when elements appear to float freely, they should be aligned to an invisible grid. Consistent alignment creates a professional, polished look.</p><h2>5. Repetition</h2><p>Repetition creates consistency and unity. Repeating colors, fonts, shapes, and spacing throughout a design creates a cohesive system that feels intentional and professional.</p><h2>6. Proportion</h2><p>Proportion refers to the size relationship between elements. The golden ratio and rule of thirds are classic proportion systems that create naturally pleasing compositions.</p><h2>7. Movement</h2><p>Movement guides the viewer's eye through a design. Lines, shapes, and the placement of elements can create a visual path that leads the viewer from one element to the next.</p><h2>Conclusion</h2><p>Mastering these principles takes practice, but understanding them is the first step. Study great designs and identify which principles are at work. Then apply them consciously in your own work.</p>`,
      category: 'Design Principles · Fundamentals',
      tags: ['design principles', 'graphic design', 'fundamentals', 'typography', 'layout'],
      author: 'Bereket Fikre',
      readingTime: 7,
      status: 'PUBLISHED',
      publishDate: new Date('2025-01-15'),
    },
    {
      type: 'BLOG_POST',
      title: 'Graphic Design Trends 2026: What\'s Shaping the Future',
      slug: 'graphic-design-trends-2026',
      excerpt: 'Discover the latest graphic design trends for 2026, from bold typography to sustainable design practices. Stay ahead with insights into emerging visual styles and techniques.',
      content: `<h2>Introduction</h2><p>Design trends reflect the cultural and technological moment we're in. In 2026, several powerful forces are shaping the visual landscape — from AI-assisted creativity to a renewed focus on authenticity and sustainability.</p><h2>1. Bold, Expressive Typography</h2><p>Typography is taking center stage. Large, bold display fonts with personality are replacing safe, corporate typefaces. Variable fonts allow for fluid, animated text that responds to interaction.</p><h2>2. Authentic Imperfection</h2><p>In reaction to years of polished, algorithm-optimised content, there's a growing desire for authenticity. Hand-drawn elements, imperfect textures, and deliberately raw aesthetics signal realness in a world of AI-generated perfection.</p><h2>3. Sustainable Design</h2><p>Sustainable design isn't just about using recycled paper. It's about designing systems that last, reducing waste in digital and print workflows, and communicating environmental values through visual language.</p><h2>4. AI-Assisted Creativity</h2><p>AI tools are becoming standard in the designer's toolkit. The most effective designers are using AI for ideation, iteration, and exploration — not replacement. The human creative vision remains irreplaceable.</p><h2>5. Maximalism Returns</h2><p>After years of minimalism dominating design, maximalism is making a comeback. Rich layering, complex compositions, and visual abundance communicate confidence and personality.</p><h2>6. Inclusive Design Systems</h2><p>Accessibility is no longer optional. Inclusive design — considering diverse users from the start — is becoming a fundamental requirement for professional work.</p><h2>Conclusion</h2><p>The best designers don't chase trends — they understand them. Use these insights to inform your work, not dictate it. The most enduring designs are those that solve problems beautifully, regardless of trend cycles.</p>`,
      category: 'Trends · 2026',
      tags: ['design trends', '2026', 'typography', 'AI design', 'sustainable design'],
      author: 'Bereket Fikre',
      readingTime: 6,
      status: 'PUBLISHED',
      publishDate: new Date('2025-02-01'),
    },
    {
      type: 'BLOG_POST',
      title: 'Building Strong Brand Identities: A Complete Guide',
      slug: 'building-strong-brand-identities-complete-guide',
      excerpt: 'Learn how to create cohesive brand identities that resonate with audiences. Discover the essential elements of brand design and how to build memorable visual systems.',
      content: `<h2>Introduction</h2><p>A brand identity is more than a logo. It's the complete visual and emotional system that represents a company in the world. Strong brand identities are instantly recognisable, emotionally resonant, and consistently applied.</p><h2>Step 1: Understand the Brand</h2><p>Before designing anything, you need to deeply understand the brand. Who are they? What do they value? Who is their audience? What's their personality? The answers to these questions drive every design decision.</p><h2>Step 2: Research Competitors</h2><p>Understanding the visual landscape of a brand's industry helps you design something that stands out. Look for patterns — what everyone is doing — and find opportunities to differentiate.</p><h2>Step 3: Design the Logo</h2><p>The logo is the cornerstone of the brand identity. It should work at every size, in color and black and white, and communicate the brand's personality at a glance. Design multiple concepts and refine the strongest.</p><h2>Step 4: Establish Color and Typography</h2><p>Color and typography carry enormous emotional weight. Choose a color palette that reflects the brand's personality and a type system that's both expressive and highly legible.</p><h2>Step 5: Build Brand Applications</h2><p>A brand identity comes to life through applications — business cards, letterheads, social media, packaging, signage. Each application tests the system and reveals gaps.</p><h2>Step 6: Document Everything</h2><p>A brand guidelines document ensures the identity is applied consistently by everyone — the client, their team, and future designers. Clear guidelines protect the investment in the brand.</p><h2>Conclusion</h2><p>Building a strong brand identity is one of the most rewarding and challenging challenges in design. Done well, it creates lasting value for the client and their audience.</p>`,
      category: 'Brand Design · Identity',
      tags: ['brand identity', 'logo design', 'brand guidelines', 'visual system'],
      author: 'Bereket Fikre',
      readingTime: 8,
      status: 'PUBLISHED',
      publishDate: new Date('2025-03-10'),
    },
    {
      type: 'BLOG_POST',
      title: 'Why Consistency Is the Real Luxury in Branding',
      slug: 'why-consistency-is-the-real-luxury-in-branding',
      excerpt: 'Consistency is often mistaken for repetition. In reality, it\'s discipline. Strong brands don\'t rely on constant reinvention; they rely on systems that work everywhere.',
      content: `<h2>Introduction</h2><p>The most powerful brands in the world share one common trait: consistency. Not because they're boring or afraid to evolve, but because they understand that trust is built through repetition of the right signals.</p><h2>Consistency vs Repetition</h2><p>Consistency isn't doing the same thing over and over. It's maintaining the same principles, values, and visual language while adapting to different contexts. A luxury brand doesn't post the same image every day — but every post feels unmistakably like them.</p><h2>The System Behind the Consistency</h2><p>Consistent brands are consistent because they've built systems. Brand guidelines, design systems, tone of voice documents — these aren't bureaucratic tools, they're creative infrastructure. They allow teams to move fast while staying on-brand.</p><h2>Why Inconsistency Is Expensive</h2><p>Every time a brand sends mixed signals — different colors here, different fonts there, a completely different tone in this email — it erodes trust. Audiences notice inconsistency even when they can't articulate why they feel uncertain about a brand.</p><h2>Building for Consistency</h2><p>The key is to build systems that make the right choice the easy choice. When the logo file, the color codes, and the approved fonts are all easily accessible, teams are more likely to use them correctly.</p><h2>Consistency Over Time</h2><p>The most valuable consistency is consistency over time. Brands that maintain their core identity through decades — evolving thoughtfully rather than reacting randomly — build the kind of recognition that money can't buy quickly.</p><h2>Conclusion</h2><p>Consistency is a competitive advantage. In a world of constant change, a brand that remains recognisable, trustworthy, and coherent becomes a landmark that audiences return to.</p>`,
      category: 'Brand Design · Strategy',
      tags: ['branding', 'consistency', 'brand strategy', 'design systems'],
      author: 'Bereket Fikre',
      readingTime: 5,
      status: 'PUBLISHED',
      publishDate: new Date('2025-04-05'),
    },
  ];

  for (const bp of blogPosts) {
    const ex = await prisma.insight.findUnique({ where: { slug: bp.slug } });
    if (!ex) {
      await prisma.insight.create({ data: { ...bp, coverImage: null, coverPublicId: null } });
      console.log(`✅ Blog Post: ${bp.title}`);
    } else {
      console.log(`ℹ️  Blog Post exists: ${bp.title}`);
    }
  }

  // ── FAQs ───────────────────────────────────────────────────────────────────
  const faqs = [
    { question:'What services do you offer?',                   answer:"I offer comprehensive design services including brand identity design, UI/UX design, graphic design, web design, logo design, packaging design, and digital marketing materials. Each project is tailored to meet your specific business needs and goals.",                                                                                                                                                                                                                                                                                    category:'Services',    displayOrder:1 },
    { question:'How long does a typical project take?',         answer:"Project timelines vary based on scope and complexity. A logo design typically takes 7-14 business days, brand identity packages take 14-21 business days, UI/UX projects take 21-30 business days, and web design projects take 14-28 business days. I'll provide a detailed timeline after understanding your project requirements.",                                                                                                                                                                                                         category:'Process',     displayOrder:2 },
    { question:'What is your design process?',                  answer:"My design process involves several key stages: discovery and research, concept development, design creation, client feedback and revisions, and final delivery. I believe in collaborative communication throughout the process to ensure the final design exceeds your expectations and aligns with your brand vision.",                                                                                                                                                                                                                       category:'Process',     displayOrder:3 },
    { question:'Do you work with clients remotely?',            answer:"Yes! I work with clients worldwide through remote collaboration. I use video calls, email, and project management tools to ensure seamless communication regardless of location. I'm based in Addis Ababa, Ethiopia, but my services are accessible globally.",                                                                                                                                                                                                                                                                                category:'General',     displayOrder:4 },
    { question:'What file formats do you provide?',             answer:"I provide all necessary file formats for your project. This typically includes vector files (AI, EPS, SVG), raster files (PNG, JPG) in various sizes, PDF files for print, and source files in Adobe Creative Suite formats. I ensure you have everything needed for both digital and print applications.",                                                                                                                                                                                                                                    category:'Deliverables', displayOrder:5 },
    { question:'How many revisions are included?',              answer:"I include 2-3 rounds of revisions in my standard packages to ensure the design meets your expectations. Additional revisions can be arranged if needed. My goal is to deliver a design you're completely satisfied with while maintaining project timelines.",                                                                                                                                                                                                                                                                                 category:'Process',     displayOrder:6 },
    { question:'Do you provide ongoing design support?',        answer:"Yes, I offer ongoing design support and maintenance services. After project completion, I can provide continued design services for social media graphics, marketing materials, and design updates. We can discuss a retainer or per-project arrangement based on your needs.",                                                                                                                                                                                                                                                                 category:'Services',    displayOrder:7 },
    { question:'What information do you need to start a project?', answer:"To start a project, I'll need details about your business, target audience, design preferences, project goals, and any existing brand guidelines. I'll send you a brief questionnaire to gather all necessary information, and we'll schedule a consultation call to discuss your vision in detail.",                                                                                                                                                                                                                                       category:'Process',     displayOrder:8 },
  ];
  for (const f of faqs) {
    const ex = await prisma.faq.findFirst({ where: { question: f.question } });
    if (!ex) { await prisma.faq.create({ data: { ...f, isActive: true } }); console.log(`✅ FAQ: "${f.question.substring(0,45)}..."`); }
    else       { console.log(`ℹ️  FAQ exists: "${f.question.substring(0,45)}..."`); }
  }

  // ── TRUSTED PARTNERS ───────────────────────────────────────────────────────
  const partners = [
    { companyName:'Andegna',              website:'https://andegnafurniture.com/', displayOrder:1 },
    { companyName:'Gedylaw',              website:'https://gedy-law.com/welcome',  displayOrder:2 },
    { companyName:'Medavail',             website:null,                            displayOrder:3 },
    { companyName:'Toco Speciality Coffee', website:'https://ssaragroup.com/',     displayOrder:4 },
    { companyName:'Digital Deresegn',     website:'https://deresegn.et/',          displayOrder:5 },
    { companyName:'Niqat',                website:'https://linktr.ee/Niqatcoffee', displayOrder:6 },
    { companyName:'PDC',                  website:'https://pdc-et.com/',           displayOrder:7 },
    { companyName:'Prime All',            website:'https://primesoftwaresolution.net/', displayOrder:8 },
    { companyName:'Awra Designs',         website:null,                            displayOrder:9 },
  ];
  for (const p of partners) {
    const ex = await prisma.trustedPartner.findFirst({ where: { companyName: p.companyName } });
    if (!ex) { await prisma.trustedPartner.create({ data: { ...p, isActive:true } }); console.log(`✅ Partner: ${p.companyName}`); }
    else       { console.log(`ℹ️  Partner exists: ${p.companyName}`); }
  }

  // ── TESTIMONIALS ──────────────────────────────────────────────────────────
  const testimonials = [
    { clientName:'Andegna Team',    company:'Andegna Furniture',      testimonial:"On-brand apparel and signage that elevated our team's everyday presence.",            rating:5, displayOrder:1 },
    { clientName:'Gedylaw Team',    company:'Gedylaw',                 testimonial:"A polished identity that communicates trust from the first impression.",              rating:5, displayOrder:2 },
    { clientName:'Medavail Team',   company:'Medavail',                testimonial:"A credible brand system that strengthened our pharmaceutical market presence.",       rating:5, displayOrder:3 },
    { clientName:'Toco Team',       company:'Toco Speciality Coffee',  testimonial:"Premium packaging and event visuals that match our specialty positioning.",           rating:5, displayOrder:4 },
    { clientName:'Deresegn Team',   company:'Digital Deresegn',        testimonial:"Cohesive branding across print, social, and every digital touchpoint.",              rating:5, displayOrder:5 },
    { clientName:'Niqat Team',      company:'Niqat Coffee',            testimonial:"Engaging social and packaging design that brought our coffee brand to life.",         rating:5, displayOrder:6 },
    { clientName:'PDC Team',        company:'PDC',                     testimonial:"Clear, professional visuals that reflect the quality of our diagnostic services.",   rating:5, displayOrder:7 },
    { clientName:'Prime All Team',  company:'Prime All',               testimonial:"Consistent corporate design across proposals, IDs, and social campaigns.",           rating:5, displayOrder:8 },
    { clientName:'Awra Designs Team', company:'Awra Designs',          testimonial:"Polished social graphics ready for every campaign and platform.",                    rating:5, displayOrder:9 },
  ];
  for (const t of testimonials) {
    const ex = await prisma.testimonial.findFirst({ where: { clientName: t.clientName } });
    if (!ex) { await prisma.testimonial.create({ data: { ...t, featured: t.displayOrder <= 3, isActive:true } }); console.log(`✅ Testimonial: ${t.clientName}`); }
    else       { console.log(`ℹ️  Testimonial exists: ${t.clientName}`); }
  }

  console.log('\n✨ Database seed completed successfully!');
  console.log(`\n📋 Admin credentials:`);
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('\n⚠️  IMPORTANT: Change the admin password immediately after first login!\n');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
