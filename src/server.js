/**
 * Server Entry Point
 */

const app    = require('./app');
const env    = require('./config/env');
const prisma = require('./config/database');
const logger = require('./utils/logger');

const PORT = env.PORT;

/**
 * Keep-alive ping for Neon free tier.
 * Neon pauses the compute after 5 min of inactivity.
 * Sending SELECT 1 every 4 minutes keeps it awake for the
 * entire local dev session without upgrading the plan.
 * Only runs in development — production on Render has
 * constant traffic so it never pauses.
 */
const startKeepAlive = () => {
  if (env.isProd) return; // not needed in production
  const INTERVAL_MS = 4 * 60 * 1000; // 4 minutes
  setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      logger.debug('Neon keep-alive ping sent');
    } catch (err) {
      logger.warn(`Neon keep-alive failed: ${err.message} — reconnecting...`);
      // Force a reconnect on the next real query
      try { await prisma.$connect(); } catch (_) {}
    }
  }, INTERVAL_MS);
  logger.info('🏓 Neon keep-alive started (every 4 min)');
};

const startServer = async () => {
  try {
    // Connect — retries once if Neon is waking up
    try {
      await prisma.$connect();
    } catch (firstErr) {
      logger.warn('First DB connect failed, retrying in 5s...');
      await new Promise((r) => setTimeout(r, 5000));
      await prisma.$connect();
    }
    logger.info('✅ Database connected');

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} [${env.NODE_ENV}]`);
      logger.info(`📡 API base URL: http://localhost:${PORT}/api`);
      logger.info(`🔍 Health check: http://localhost:${PORT}/health`);
    });

    // Start keep-alive after server is up
    startKeepAlive();

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
