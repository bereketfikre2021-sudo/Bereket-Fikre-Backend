'use strict';

/**
 * Public tracking endpoint
 * POST /api/track  — receives analytics beacons from the frontend
 *
 * Body shape (sent by the frontend tracker):
 * {
 *   visitorId: string,      // persistent anon ID (localStorage)
 *   sessionId: string,      // per-tab session ID
 *   event: string,          // 'session_start' | 'session_ping' | 'section_view' | 'conversion' | 'content_view'
 *   target?: string,        // section name / action / content type
 *   targetId?: string,      // slug of project/insight
 *   value?: string,         // extra context
 *   duration?: number,      // ms
 *   meta?: {                // from session_start only
 *     device, browser, os, language, referrer,
 *     screenWidth, screenHeight, utmSource, utmMedium, utmCampaign
 *   }
 * }
 */

const { Router } = require('express');
const prisma = require('../config/database');
const { isBot } = require('../utils/botDetect');

const router = Router();

// Basic rate-limit: track at most once per 500ms per IP (handled by express-rate-limit in app.js for /api)
router.post('/track', async (req, res) => {
  // Always respond 204 — never block the user for analytics failures
  res.status(204).end();

  const ua = req.headers['user-agent'] || '';
  if (isBot(ua)) return;

  const { visitorId, sessionId, event, target, targetId, value, duration, meta } = req.body;
  if (!visitorId || !sessionId || !event) return;

  try {
    if (event === 'session_start') {
      // Upsert session row
      await prisma.visitorSession.upsert({
        where: { sessionId },
        create: {
          sessionId,
          visitorId,
          ip:           req.ip || null,
          country:      meta?.country   || null,
          city:         meta?.city      || null,
          device:       meta?.device    || null,
          browser:      meta?.browser   || null,
          os:           meta?.os        || null,
          language:     meta?.language  || null,
          referrer:     meta?.referrer  || null,
          utmSource:    meta?.utmSource   || null,
          utmMedium:    meta?.utmMedium   || null,
          utmCampaign:  meta?.utmCampaign || null,
          screenWidth:  meta?.screenWidth  ? parseInt(meta.screenWidth)  : null,
          screenHeight: meta?.screenHeight ? parseInt(meta.screenHeight) : null,
          startedAt:    new Date(),
          lastSeenAt:   new Date(),
        },
        update: { lastSeenAt: new Date() },
      });
      return;
    }

    if (event === 'session_ping') {
      // Update session duration + lastSeenAt + bounced flag
      await prisma.visitorSession.updateMany({
        where: { sessionId },
        data: {
          lastSeenAt: new Date(),
          duration:   duration ? Math.round(duration / 1000) : undefined,
          bounced:    false, // more than one ping = not bounced
        },
      });
      return;
    }

    // For all other events — ensure session exists first, then insert event
    const session = await prisma.visitorSession.findUnique({ where: { sessionId } });
    if (!session) {
      // Session never started (e.g. tab was open before deploy) — create minimal row
      await prisma.visitorSession.create({
        data: { sessionId, visitorId, startedAt: new Date(), lastSeenAt: new Date() },
      });
    }

    await prisma.analyticsEvent.create({
      data: {
        sessionId,
        event,
        target:   target   || null,
        targetId: targetId || null,
        value:    value    || null,
        duration: duration ? Math.round(duration / 1000) : null,
      },
    });

    // Mark session as not bounced if they fired an event
    await prisma.visitorSession.updateMany({
      where: { sessionId },
      data: { lastSeenAt: new Date(), bounced: false },
    });
  } catch {
    // Fire-and-forget — never surface errors to user
  }
});

module.exports = router;
