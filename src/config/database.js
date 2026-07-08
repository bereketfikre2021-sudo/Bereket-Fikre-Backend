/**
 * Prisma client singleton with auto-reconnect for Neon free tier.
 *
 * Neon free tier pauses after 5 minutes of inactivity and drops
 * the connection. This wrapper catches connection errors on any
 * query and automatically reconnects before retrying once.
 */

'use strict';

const { PrismaClient } = require('@prisma/client');
const env = require('./env');

// ── Create client ─────────────────────────────────────────────────────────────
const createClient = () =>
  new PrismaClient({
    log: env.isDev ? ['error', 'warn'] : ['error'],
  });

// Singleton — prevents multiple instances during hot reload
const globalForPrisma = globalThis;
let prisma = globalForPrisma.prisma ?? createClient();
if (env.isDev) globalForPrisma.prisma = prisma;

// ── Auto-reconnect proxy ──────────────────────────────────────────────────────
// Wraps every Prisma operation: if a "Can't reach database" error occurs,
// it disconnects, waits 2 s, reconnects, then retries the call once.
const NEON_ERRORS = [
  "Can't reach database server",
  'Connection refused',
  'Connection reset',
  'ECONNREFUSED',
  'ECONNRESET',
  'P1001', // Prisma error code for unreachable server
  'P1002', // Prisma error code for timeout
];

const isConnectionError = (err) =>
  NEON_ERRORS.some((msg) => err?.message?.includes(msg) || err?.code === msg);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const withReconnect = (target) =>
  new Proxy(target, {
    get(obj, prop) {
      const value = obj[prop];

      // Only wrap async delegate functions (model methods, $queryRaw, etc.)
      if (typeof value !== 'function') return value;

      return async (...args) => {
        try {
          return await value.apply(obj, args);
        } catch (err) {
          if (!isConnectionError(err)) throw err;

          // Connection lost — attempt one reconnect
          console.warn('[DB] Connection lost, reconnecting to Neon...');
          try {
            await prisma.$disconnect();
            await sleep(2000);
            await prisma.$connect();
            console.info('[DB] Reconnected to Neon ✅');
          } catch (reconnectErr) {
            console.error('[DB] Reconnect failed:', reconnectErr.message);
            throw err; // throw original error
          }

          // Retry the original call once
          return value.apply(obj, args);
        }
      };
    },
  });

module.exports = withReconnect(prisma);
