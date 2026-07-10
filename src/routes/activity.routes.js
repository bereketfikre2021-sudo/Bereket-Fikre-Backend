const { Router } = require('express');
const { getActivityLogs } = require('../controllers/activity.controller');
const { authenticate } = require('../middleware/auth');
const { attachActivityLogger } = require('../middleware/activityLogger');

const router = Router();

router.get('/', authenticate, attachActivityLogger, getActivityLogs);

module.exports = router;
