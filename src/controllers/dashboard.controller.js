/**
 * Dashboard Controller
 * Statistics, recent activity, and overview data
 */

const prisma = require('../config/database');
const { success } = require('../utils/response');

// GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      projectCount,
      publishedProjectCount,
      serviceCount,
      insightCount,
      caseStudyCount,
      blogCount,
      partnerCount,
      testimonialCount,
      faqCount,
      contactCount,
      newContactCount,
      projectRequestCount,
      newRequestCount,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'PUBLISHED' } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.insight.count(),
      prisma.insight.count({ where: { type: 'CASE_STUDY' } }),
      prisma.insight.count({ where: { type: 'BLOG_POST' } }),
      prisma.trustedPartner.count({ where: { isActive: true } }),
      prisma.testimonial.count({ where: { isActive: true } }),
      prisma.faq.count({ where: { isActive: true } }),
      prisma.contactSubmission.count(),
      prisma.contactSubmission.count({ where: { status: 'NEW' } }),
      prisma.projectRequest.count(),
      prisma.projectRequest.count({ where: { status: 'NEW' } }),
    ]);

    // Recent inbox
    const [recentContacts, recentRequests] = await Promise.all([
      prisma.contactSubmission.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, subject: true, status: true, createdAt: true },
      }),
      prisma.projectRequest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, firstName: true, lastName: true, email: true,
          serviceNeeded: true, status: true, createdAt: true,
        },
      }),
    ]);

    // ── 30-day trend data (contacts + requests per day) ──────────────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [contactTrend, requestTrend] = await Promise.all([
      prisma.contactSubmission.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.projectRequest.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Build day-by-day counts for the last 30 days
    const buildDailyTrend = (items) => {
      const counts = {};
      for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo);
        d.setDate(d.getDate() + i);
        counts[d.toISOString().slice(0, 10)] = 0;
      }
      items.forEach(({ createdAt }) => {
        const key = new Date(createdAt).toISOString().slice(0, 10);
        if (key in counts) counts[key]++;
      });
      return Object.entries(counts).map(([date, count]) => ({ date, count }));
    };

    return success(res, {
      stats: {
        projects: {
          total: projectCount,
          published: publishedProjectCount,
          draft: projectCount - publishedProjectCount,
        },
        services: { total: serviceCount },
        insights: { total: insightCount, caseStudies: caseStudyCount, blogPosts: blogCount },
        partners: { total: partnerCount },
        testimonials: { total: testimonialCount },
        faqs: { total: faqCount },
        contacts: { total: contactCount, new: newContactCount },
        projectRequests: { total: projectRequestCount, new: newRequestCount },
        unread: newContactCount + newRequestCount,
      },
      recentActivity: {
        contacts: recentContacts,
        projectRequests: recentRequests,
      },
      trends: {
        contacts: buildDailyTrend(contactTrend),
        requests: buildDailyTrend(requestTrend),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats };
