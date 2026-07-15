/**
 * Analytics Controller
 * Wraps the GA Data API service and returns clean JSON.
 * All endpoints require admin authentication (enforced in routes).
 */

const analyticsService = require('../services/analytics.service');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

// Helper — runs a service fn and returns a standard response or 503
async function run(res, fn) {
  try {
    const data = await fn();
    return success(res, data);
  } catch (err) {
    logger.error('GA API error:', err.message);
    // Don't expose credential details to the client
    return error(res, 'Analytics data unavailable. Check GA credentials.', 503);
  }
}

/** GET /api/admin/analytics/overview */
const getOverview = (req, res) => run(res, analyticsService.getOverview);

/** GET /api/admin/analytics/top-pages */
const getTopPages = (req, res) => run(res, analyticsService.getTopPages);

/** GET /api/admin/analytics/traffic-sources */
const getTrafficSources = (req, res) => run(res, analyticsService.getTrafficSources);

/** GET /api/admin/analytics/countries */
const getCountries = (req, res) => run(res, analyticsService.getCountries);

/** GET /api/admin/analytics/devices */
const getDevices = (req, res) => run(res, analyticsService.getDevices);

/** GET /api/admin/analytics/browsers */
const getBrowsers = (req, res) => run(res, analyticsService.getBrowsers);

/** GET /api/admin/analytics/realtime */
const getRealtimeUsers = (req, res) => run(res, analyticsService.getRealtimeUsers);

/**
 * GET /api/admin/analytics/all
 * Fetches all reports in parallel — single call for the dashboard.
 */
const getAll = async (req, res) => {
  try {
    const [overview, topPages, trafficSources, countries, devices, browsers, realtime] =
      await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getTopPages(),
        analyticsService.getTrafficSources(),
        analyticsService.getCountries(),
        analyticsService.getDevices(),
        analyticsService.getBrowsers(),
        analyticsService.getRealtimeUsers(),
      ]);

    return success(res, {
      overview,
      topPages,
      trafficSources,
      countries,
      devices,
      browsers,
      realtime,
    });
  } catch (err) {
    logger.error('GA API error (all):', err.message);
    return error(res, 'Analytics data unavailable. Check GA credentials.', 503);
  }
};

module.exports = {
  getOverview,
  getTopPages,
  getTrafficSources,
  getCountries,
  getDevices,
  getBrowsers,
  getRealtimeUsers,
  getAll,
};
