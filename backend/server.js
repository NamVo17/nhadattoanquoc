'use strict';

// Load env first before anything else
require('dotenv').config();
const { validate, env } = require('./config/env.config');

// Fail fast on missing env vars
validate();

const app = require('./app');
const logger = require('./utils/logger');

const server = app.listen(env.PORT, () => {
    logger.info(`✅ Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`📡 API: http://localhost:${env.PORT}${env.API_PREFIX}`);
});

// ── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
    logger.info(`${signal} received – shutting down gracefully...`);
    server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
    });
    // Force-kill after 10s if server hangs
    setTimeout(() => process.exit(1), 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ── Unhandled rejections ──────────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
    shutdown('UnhandledRejection');
});

process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
    process.exit(1);
});
