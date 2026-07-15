/**
 * Google Analytics Data API v1 — service layer
 *
 * Required environment variables (set in Render dashboard, never in code):
 *   GA_PROPERTY_ID          — numeric property ID, e.g. 123456789
 *   GA_CLIENT_EMAIL         — service account email
 *   GA_PRIVATE_KEY          — service account private key (PEM, \n escaped)
 *
 * Responses are cached in-process for CACHE_TTL_MS (5 minutes) to avoid
 * hammering the GA quota and to keep dashboard loads fast.
 */

const { BetaAnalyticsDataClient } = require('@google-analytics/data');

// ─── Config ──────────────────────────────────────────────────────────────────

const PROPERTY_ID = process.env.GA_PROPERTY_ID;
const CLIENT_EMAIL = process.env.GA_CLIENT_EMAIL;
// Render stores multi-line secrets with literal \n — replace them
const PRIVATE_KEY = process.env.GA_PRIVATE_KEY
  ? process.env.GA_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─── Simple in-memory cache ───────────────────────────────────────────────────

const _cache = new Map();

function getCached(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) { _cache.delete(key); return null; }
  return entry.data;
}

function setCache(key, data) {
  _cache.set(key, { data, ts: Date.now() });
}

// ─── Client factory ───────────────────────────────────────────────────────────

let _client = null;

function getClient() {
  if (_client) return _client;
  if (!CLIENT_EMAIL || !PRIVATE_KEY) {
    throw new Error(`GA credentials missing — CLIENT_EMAIL: ${!!CLIENT_EMAIL}, PRIVATE_KEY: ${!!PRIVATE_KEY}`);
  }
  _client = new BetaAnalyticsDataClient({
    credentials: { client_email: CLIENT_EMAIL, private_key: PRIVATE_KEY },
  });
  return _client;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function prop() {
  if (!PROPERTY_ID) throw new Error(`GA_PROPERTY_ID env var not set (value: "${PROPERTY_ID}")`);
  return `properties/${PROPERTY_ID}`;
}

/** Pull a single metric value from a runReport response row. */
function metricVal(rows, metricIdx = 0) {
  return rows?.[0]?.metricValues?.[metricIdx]?.value ?? '0';
}

/** Map GA report rows → [{ dimension, value }] */
function rowsToList(rows, dimIdx = 0, metIdx = 0) {
  return (rows || []).map((row) => ({
    dimension: row.dimensionValues?.[dimIdx]?.value ?? '',
    value: parseInt(row.metricValues?.[metIdx]?.value ?? '0', 10),
  }));
}

// ─── Public service functions ─────────────────────────────────────────────────

/**
 * Overview: visitors today/week/month, total users, page views,
 * avg session duration, bounce rate.
 */
async function getOverview() {
  const cacheKey = 'overview';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const client = getClient();

  const [today, week, month, totals] = await Promise.all([
    // Visitors today
    client.runReport({
      property: prop(),
      dateRanges: [{ startDate: 'today', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }],
    }),
    // Visitors this week
    client.runReport({
      property: prop(),
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }],
    }),
    // Visitors this month
    client.runReport({
      property: prop(),
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }],
    }),
    // Total users, page views, session duration, bounce rate
    client.runReport({
      property: prop(),
      dateRanges: [{ startDate: '365daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
    }),
  ]);

  const result = {
    visitorsToday:          parseInt(metricVal(today[0]?.rows), 10),
    visitorsThisWeek:       parseInt(metricVal(week[0]?.rows), 10),
    visitorsThisMonth:      parseInt(metricVal(month[0]?.rows), 10),
    totalUsers:             parseInt(metricVal(totals[0]?.rows, 0), 10),
    pageViews:              parseInt(metricVal(totals[0]?.rows, 1), 10),
    avgSessionDuration:     parseFloat(metricVal(totals[0]?.rows, 2)).toFixed(1),
    bounceRate:             (parseFloat(metricVal(totals[0]?.rows, 3)) * 100).toFixed(1),
  };

  setCache(cacheKey, result);
  return result;
}

/** Top pages by page views (last 30 days). */
async function getTopPages() {
  const cacheKey = 'top_pages';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const client = getClient();
  const [res] = await client.runReport({
    property: prop(),
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10,
  });

  const result = rowsToList(res.rows);
  setCache(cacheKey, result);
  return result;
}

/** Traffic sources (last 30 days). */
async function getTrafficSources() {
  const cacheKey = 'traffic_sources';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const client = getClient();
  const [res] = await client.runReport({
    property: prop(),
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });

  const result = rowsToList(res.rows);
  setCache(cacheKey, result);
  return result;
}

/** Countries (last 30 days). */
async function getCountries() {
  const cacheKey = 'countries';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const client = getClient();
  const [res] = await client.runReport({
    property: prop(),
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'country' }],
    metrics: [{ name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    limit: 10,
  });

  const result = rowsToList(res.rows);
  setCache(cacheKey, result);
  return result;
}

/** Devices (last 30 days). */
async function getDevices() {
  const cacheKey = 'devices';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const client = getClient();
  const [res] = await client.runReport({
    property: prop(),
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [{ name: 'activeUsers' }],
  });

  const result = rowsToList(res.rows);
  setCache(cacheKey, result);
  return result;
}

/** Browsers (last 30 days). */
async function getBrowsers() {
  const cacheKey = 'browsers';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const client = getClient();
  const [res] = await client.runReport({
    property: prop(),
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'browser' }],
    metrics: [{ name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    limit: 8,
  });

  const result = rowsToList(res.rows);
  setCache(cacheKey, result);
  return result;
}

/** Realtime active users right now. */
async function getRealtimeUsers() {
  const cacheKey = 'realtime';
  // Short cache for realtime — 30 seconds
  const entry = _cache.get(cacheKey);
  if (entry && Date.now() - entry.ts < 30000) return entry.data;

  const client = getClient();
  const [res] = await client.runRealtimeReport({
    property: prop(),
    metrics: [{ name: 'activeUsers' }],
  });

  const result = { activeUsers: parseInt(metricVal(res.rows), 10) };
  _cache.set(cacheKey, { data: result, ts: Date.now() });
  return result;
}

module.exports = {
  getOverview,
  getTopPages,
  getTrafficSources,
  getCountries,
  getDevices,
  getBrowsers,
  getRealtimeUsers,
};
