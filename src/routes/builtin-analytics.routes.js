'use strict';

const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const service = require('../services/builtin-analytics.service');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

const router = Router();
router.use(authenticate);

const run = (res, fn) =>
  fn().then((data) => success(res, data)).catch((err) => {
    logger.error(`Built-in analytics error: ${err.message}`);
    return error(res, `Analytics error: ${err.message}`, 503);
  });

router.get('/all',        (req, res) => run(res, service.getAll));
router.get('/overview',   (req, res) => run(res, service.getOverview));
router.get('/trend/7',    (req, res) => run(res, () => service.getDailyTrend(7)));
router.get('/trend/30',   (req, res) => run(res, () => service.getDailyTrend(30)));
router.get('/devices',    (req, res) => run(res, () => service.getBreakdown('device')));
router.get('/browsers',   (req, res) => run(res, () => service.getBreakdown('browser')));
router.get('/countries',  (req, res) => run(res, () => service.getBreakdown('country')));
router.get('/sections',   (req, res) => run(res, service.getSectionAnalytics));
router.get('/conversions',(req, res) => run(res, service.getConversions));
router.get('/live',       (req, res) => run(res, service.getLive));
router.get('/health',     (req, res) => run(res, service.getSystemHealth));

module.exports = router;
