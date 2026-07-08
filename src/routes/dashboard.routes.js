const { Router } = require('express');
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

// GET /api/admin/dashboard
router.get('/', authenticate, getDashboardStats);

module.exports = router;
