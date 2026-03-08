'use strict';

const requiredVars = [
    'NODE_ENV',
    'PORT',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS',
];

const validate = () => {
    const missing = requiredVars.filter((v) => !process.env[v]);
    if (missing.length) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

module.exports = {
    validate,
    env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: parseInt(process.env.PORT, 10) || 5000,
        API_PREFIX: process.env.API_PREFIX || '/api/v1',
        IS_PRODUCTION: process.env.NODE_ENV === 'production',

        supabase: {
            url: process.env.SUPABASE_URL,
            anonKey: process.env.SUPABASE_ANON_KEY,
            serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        },

        jwt: {
            accessSecret: process.env.JWT_ACCESS_SECRET,
            refreshSecret: process.env.JWT_REFRESH_SECRET,
            accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
            refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        },

        bcrypt: {
            saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
        },

        email: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
            from: process.env.EMAIL_FROM || 'no-reply@nhadattoanquoc.vn',
        },

        client: {
            url: process.env.CLIENT_URL || 'http://localhost:3000',
        },

        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900_000,
            max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
            authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,
        },
    },
};
