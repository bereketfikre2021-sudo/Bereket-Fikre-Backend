'use strict';

/**
 * Built-in Analytics Service
 * Queries PostgreSQL for all analytics data — no third-party services.
 * Used as primary (or fallback when GA is unavailable) on the admin dashboard.
 */

const prisma = require('../config/database');

// ── In-memory cache ───────────────────────────────────────────────────────────
const _cache = new Map();
const TTL = 5 * 60 * 1000; // 5 minutes

function cached(key, fn) {
  const hit = _cache.get(key);
  if (hit && Date.now() - hit.ts < TTL) return Promise.resolve(hit.data);
  return fn().then((data) => { _cache.set(key, { data, ts: Date.now() }); return data; });
}

// ── Date helpers ──────────────────────────────────────────────────────────────
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0,0,0,0); return d; };
const startOf = (unit) => {
  const d = new Date();
  if (unit === 'day')   { d.setHours(0,0,0,0); }
  if (unit === 'week')  { d.setDate(d.getDate() - 7); d.setHours(0,0,0,0); }
  if (unit === 'month') { d.setDate(d.getDate() - 30); d.setHours(0,0,0,0); }
  return d;
};

// ── Overview ──────────────────────────────────────────────────────────────────
async function getOverview() {
  return cached('builtin_overview', async () => {
    const now = new Date();
    const todayStart  = startOf('day');
    const weekStart   = startOf('week');
    const monthStart  = startOf('month');
    const fiveMinAgo  = new Date(now - 5 * 60 * 1000);

    const [
      totalSessions,
      uniqueVisitors,
      todaySessions,
      weekSessions,
      monthSessions,
      activeSessions,
      avgDurationRaw,
      bouncedCount,
      returningCount,
    ] = await Promise.all([
      prisma.visitorSession.count(),
      prisma.visitorSession.groupBy({ by: ['visitorId'], _count: true }).then(r => r.length),
      prisma.visitorSession.count({ where: { startedAt: { gte: todayStart } } }),
      prisma.visitorSession.count({ where: { startedAt: { gte: weekStart } } }),
      prisma.visitorSession.count({ where: { startedAt: { gte: monthStart } } }),
      prisma.visitorSession.count({ where: { lastSeenAt: { gte: fiveMinAgo } } }),
      prisma.visitorSession.aggregate({ _avg: { duration: true } }),
      prisma.visitorSession.count({ where: { bounced: true } }),
      prisma.$queryRaw`SELECT COUNT(*) as cnt FROM (SELECT "visitorId" FROM visitor_sessions GROUP BY "visitorId" HAVING COUNT(*) > 1) sub`,
    ]);

    const bounceRate = totalSessions > 0 ? Math.round((bouncedCount / totalSessions) * 100) : 0;
    const avgDuration = Math.round(avgDurationRaw._avg.duration ?? 0);

    return {
      totalSessions,
      uniqueVisitors,
      newVisitorsToday:  todaySessions,
      visitorsThisWeek:  weekSessions,
      visitorsThisMonth: monthSessions,
      activeNow:         activeSessions,
      avgSessionDuration: avgDuration,
      bounceRate,
      returningVisitors: Number(returningCount[0]?.cnt ?? 0),
    };
  });
}

// ── Daily trend (last N days) ─────────────────────────────────────────────────
async function getDailyTrend(days = 30) {
  return cached(`builtin_trend_${days}`, async () => {
    const since = daysAgo(days - 1);
    const rows = await prisma.visitorSession.findMany({
      where: { startedAt: { gte: since } },
      select: { startedAt: true },
      orderBy: { startedAt: 'asc' },
    });
    const counts = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      counts[d.toISOString().slice(0, 10)] = 0;
    }
    rows.forEach(({ startedAt }) => {
      const k = new Date(startedAt).toISOString().slice(0, 10);
      if (k in counts) counts[k]++;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  });
}

// ── Breakdown helpers ─────────────────────────────────────────────────────────
async function getBreakdown(field, limit = 10) {
  return cached(`builtin_breakdown_${field}`, async () => {
    const rows = await prisma.visitorSession.groupBy({
      by: [field],
      _count: { [field]: true },
      orderBy: { _count: { [field]: 'desc' } },
      take: limit,
      where: { [field]: { not: null } },
    });
    return rows.map((r) => ({ dimension: r[field] || 'Unknown', value: r._count[field] }));
  });
}

// ── Section analytics ─────────────────────────────────────────────────────────
async function getSectionAnalytics() {
  return cached('builtin_sections', async () => {
    const rows = await prisma.analyticsEvent.groupBy({
      by: ['target'],
      where: { event: 'section_view', target: { not: null } },
      _count: { target: true },
      _avg: { duration: true },
      orderBy: { _count: { target: 'desc' } },
    });

    // Unique section views
    const uniqueRows = await prisma.$queryRaw`
      SELECT target, COUNT(DISTINCT "sessionId") as unique_views
      FROM analytics_events
      WHERE event = 'section_view' AND target IS NOT NULL
      GROUP BY target
      ORDER BY unique_views DESC
    `;
    const uniqueMap = Object.fromEntries(uniqueRows.map((r) => [r.target, Number(r.unique_views)]));

    return rows.map((r) => ({
      section:    r.target,
      totalViews: r._count.target,
      uniqueViews: uniqueMap[r.target] ?? 0,
      avgTimeSpent: Math.round(r._avg.duration ?? 0),
    }));
  });
}

// ── Conversion analytics ──────────────────────────────────────────────────────
async function getConversions() {
  return cached('builtin_conversions', async () => {
    const rows = await prisma.analyticsEvent.groupBy({
      by: ['target'],
      where: { event: 'conversion' },
      _count: { target: true },
      orderBy: { _count: { target: 'desc' } },
    });
    const total = await prisma.visitorSession.count();
    return rows.map((r) => ({
      action: r.target,
      count:  r._count.target,
      rate:   total > 0 ? ((r._count.target / total) * 100).toFixed(1) : '0',
    }));
  });
}

// ── Top content ────────────────────────────────────────────────────────────────
async function getTopContent(eventTarget) {
  return cached(`builtin_top_${eventTarget}`, async () => {
    const rows = await prisma.analyticsEvent.groupBy({
      by: ['targetId'],
      where: { event: 'content_view', target: eventTarget, targetId: { not: null } },
      _count: { targetId: true },
      _avg:   { duration: true },
      orderBy: { _count: { targetId: 'desc' } },
      take: 10,
    });
    return rows.map((r) => ({
      slug:     r.targetId,
      views:    r._count.targetId,
      avgTime:  Math.round(r._avg.duration ?? 0),
    }));
  });
}

// ── Live ──────────────────────────────────────────────────────────────────────
async function getLive() {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const [activeSessions, latestVisitor, recentSection] = await Promise.all([
    prisma.visitorSession.count({ where: { lastSeenAt: { gte: fiveMinAgo } } }),
    prisma.visitorSession.findFirst({
      orderBy: { startedAt: 'desc' },
      select: { country: true, device: true, browser: true, startedAt: true },
    }),
    prisma.analyticsEvent.findFirst({
      where: { event: 'section_view' },
      orderBy: { createdAt: 'desc' },
      select: { target: true, createdAt: true },
    }),
  ]);
  return { activeSessions, latestVisitor, recentSection };
}

// ── System health ─────────────────────────────────────────────────────────────
async function getSystemHealth() {
  const start = Date.now();
  let dbStatus = 'ok';
  try { await prisma.$queryRaw`SELECT 1`; } catch { dbStatus = 'error'; }
  const dbLatency = Date.now() - start;

  const uptimeSeconds = Math.round(process.uptime());

  return {
    database:    { status: dbStatus, latencyMs: dbLatency },
    api:         { status: 'ok', uptimeSeconds },
    server: {
      nodeVersion: process.version,
      memoryMB:    Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  };
}

// ── Combined (single call for dashboard) ─────────────────────────────────────
async function getAll() {
  const [overview, trend7, trend30, devices, browsers, countries, sections, conversions, topProjects, topInsights, live, health] =
    await Promise.all([
      getOverview(),
      getDailyTrend(7),
      getDailyTrend(30),
      getBreakdown('device'),
      getBreakdown('browser'),
      getBreakdown('country'),
      getSectionAnalytics(),
      getConversions(),
      getTopContent('project'),
      getTopContent('insight'),
      getLive(),
      getSystemHealth(),
    ]);

  return { overview, trend7, trend30, devices, browsers, countries, sections, conversions, topProjects, topInsights, live, health };
}

module.exports = { getAll, getOverview, getDailyTrend, getBreakdown, getSectionAnalytics, getConversions, getTopContent, getLive, getSystemHealth };
