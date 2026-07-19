'use strict';

/**
 * Lightweight bot/crawler detection.
 * Returns true if the User-Agent looks like a bot — skip tracking these.
 */
const BOT_PATTERN = /bot|crawler|spider|scraper|headless|lighthouse|pagespeed|prerender|ping|wget|curl|python|go-http|axios|java|ruby|php|perl|facebookexternalhit|twitterbot|linkedinbot|whatsapp|slack|telegram|discord/i;

const isBot = (ua) => {
  if (!ua) return true; // no UA — likely programmatic
  return BOT_PATTERN.test(ua);
};

module.exports = { isBot };
