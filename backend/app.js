'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const xssClean = require('xss-clean');

const { env } = require('./config/env.config');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/error.middleware');

// ── Route imports ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const newsRoutes = require('./routes/news.routes');
const kycRoutes = require('./routes/kyc.routes');
const collaborationRoutes = require('./routes/collaboration.routes');
const paymentRoutes = require('./routes/payment.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: (origin, callback) => {
            const allowed = [env.client.url];
            if (!origin || allowed.includes(origin)) return callback(null, true);
            callback(new Error(`CORS blocked: ${origin}`));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ── Body / Cookie parsing ─────────────────────────────────────────────────────
// Increase JSON limit to allow base64 avatar uploads (checked again in controller)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── XSS / Input sanitisation ──────────────────────────────────────────────────
app.use(xssClean());

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── HTTP request logger ───────────────────────────────────────────────────────
app.use(morgan('combined', { stream: logger.stream }));

// ── Global rate limiter ───────────────────────────────────────────────────────
app.use(
    rateLimit({
        windowMs: env.rateLimit.windowMs,
        max: env.rateLimit.max,
        message: { success: false, message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
        standardHeaders: true,
        legacyHeaders: false,
    })
);

// ── Trust proxy (needed behind Nginx / cloud load balancers) ──────────────────
app.set('trust proxy', 1);

// ── Root ──────────────────────────────────────────────────────────────────────
app.get(env.API_PREFIX, (_req, res) =>
    res.json({
        success: true,
        message: 'NhaDatToanQuoc API v1',
        environment: env.NODE_ENV,
        endpoints: {
            health: `GET  ${env.API_PREFIX}/health`,
            register: `POST ${env.API_PREFIX}/auth/register`,
            login: `POST ${env.API_PREFIX}/auth/login`,
            verifyEmail: `POST ${env.API_PREFIX}/auth/verify-email`,
            refresh: `POST ${env.API_PREFIX}/auth/refresh`,
            logout: `POST ${env.API_PREFIX}/auth/logout`,
            forgotPassword: `POST ${env.API_PREFIX}/auth/forgot-password`,
            resetPassword: `POST ${env.API_PREFIX}/auth/reset-password`,
            verify2FA: `POST ${env.API_PREFIX}/auth/verify-2fa`,
            me: `GET  ${env.API_PREFIX}/auth/me`,
        },
    })
);

// ── Health check ──────────────────────────────────────────────────────────────
app.get(`${env.API_PREFIX}/health`, (_req, res) =>
    res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() })
);

// ── API routes ────────────────────────────────────────────────────────────────
app.use(`${env.API_PREFIX}/auth`, authRoutes);
app.use(`${env.API_PREFIX}/properties`, propertyRoutes);
app.use(`${env.API_PREFIX}/news`, newsRoutes);
app.use(`${env.API_PREFIX}/kyc`, kycRoutes);
app.use(`${env.API_PREFIX}/collaborations`, collaborationRoutes);
app.use(`${env.API_PREFIX}/payments`, paymentRoutes);
app.use(`${env.API_PREFIX}/notifications`, notificationRoutes);

// ── 404 & error handling ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;

