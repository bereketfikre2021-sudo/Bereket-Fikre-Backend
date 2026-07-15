/**
 * Analytics routes — all protected by JWT authentication.
 * GA credentials never leave the server; the frontend only sees clean JSON.
 */

const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getOverview,
  getTopPages,
  getTrafficSources,
  getCountries,
  getDevices,
  getBrowsers,
  getRealtimeUsers,
  getAll,
} = require('../controllers/analytics.controller');

const router = Router();

// All routes require a valid admin JWT
router.use(authenticate);

router.get('/all',             getAll);
router.get('/overview',        getOverview);
router.get('/top-pages',       getTopPages);
router.get('/traffic-sources', getTrafficSources);
router.get('/countries',       getCountries);
router.get('/devices',         getDevices);
router.get('/browsers',        getBrowsers);
router.get('/realtime',        getRealtimeUsers);

module.exports = router;
