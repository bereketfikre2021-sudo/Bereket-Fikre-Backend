/**
 * Express Application Setup
 * All middleware, routes, and error handling configured here
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const env = require('./config/env');
const logger = require('./utils/logger');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const serviceRoutes = require('./routes/service.routes');
const insightRoutes = require('./routes/insight.routes');
const partnerRoutes = require('./routes/partner.routes');
const faqRoutes = require('./routes/faq.routes');
const contactRoutes = require('./routes/contact.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// ============================================================
// SECURITY HEADERS
// ============================================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: env.isProd ? undefined : false,
}));

// ============================================================
// CORS
// ============================================================
const allowedOrigins = [
  env.FRONTEND_URL,
  env.ADMIN_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ============================================================
// GENERAL MIDDLEWARE
// ============================================================
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan(env.isDev ? 'dev' : 'combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// Trust proxy (for rate limiting behind Render/Nginx)
app.set('trust proxy', 1);

// General rate limiting
app.use('/api', generalLimiter);

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Bereket Fikre Portfolio API', version: '1.0.0' });
});

// ============================================================
// ROUTES
// ============================================================
app.use('/api/auth', authRoutes);

// Public + Admin project routes split by prefix
app.use('/api/projects', projectRoutes);        // GET (public)
app.use('/api/admin/projects', projectRoutes);  // POST/PUT/DELETE (protected — auth checked in route)

app.use('/api/services', serviceRoutes);
app.use('/api/admin/services', serviceRoutes);

app.use('/api/insights', insightRoutes);
app.use('/api/admin/insights', insightRoutes);

app.use('/api/faqs', faqRoutes);
app.use('/api/admin/faqs', faqRoutes);

// Partners & Testimonials share a single router
app.use('/api', partnerRoutes);
app.use('/api/admin', partnerRoutes);

// Contact forms + admin views
app.use('/api', contactRoutes);

// Dashboard
app.use('/api/admin/dashboard', dashboardRoutes);

// ============================================================
// 404 + ERROR HANDLING
// ============================================================
app.use(notFound);
app.use(errorHandler);

module.exports = app;
