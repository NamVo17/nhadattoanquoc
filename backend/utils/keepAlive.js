'use strict';

/**
 * Keep-Alive Utility
 * Pings the server's own /health endpoint every 14 minutes to prevent
 * Render free-tier cold starts (Render sleeps after ~15 min of inactivity).
 *
 * Only runs in production to avoid noise in local development.
 */

const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

function startKeepAlive(serverUrl, apiPrefix = '/api/v1') {
  if (process.env.NODE_ENV !== 'production') {
    return; // Skip in development
  }

  const healthUrl = `${serverUrl}${apiPrefix}/health`;

  const ping = async () => {
    try {
      const res = await fetch(healthUrl, { method: 'GET' });
      if (res.ok) {
        console.log(`[KeepAlive] ✅ Pinged ${healthUrl} — server is awake`);
      } else {
        console.warn(`[KeepAlive] ⚠️ Ping returned status ${res.status}`);
      }
    } catch (err) {
      console.warn(`[KeepAlive] ❌ Ping failed: ${err.message}`);
    }
  };

  // First ping after 1 minute (let server fully start up)
  setTimeout(() => {
    ping();
    // Then ping every 14 minutes
    setInterval(ping, PING_INTERVAL_MS);
  }, 60_000);

  console.log(
    `[KeepAlive] 🔄 Keep-alive enabled — pinging ${healthUrl} every 14 min`
  );
}

module.exports = { startKeepAlive };
