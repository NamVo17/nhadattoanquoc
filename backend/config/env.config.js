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

// Payment gateway variables are optional for development
const optionalVars = [
    'MOMO_PARTNER_CODE',
    'MOMO_ACCESS_KEY',
    'MOMO_SECRET_KEY',
    'VNPAY_TMN_CODE',
    'VNPAY_HASH_SECRET',
];

const validate = () => {
    const missing = requiredVars.filter((v) => !process.env[v]);
    if (missing.length) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // Log missing optional vars as warnings
    const missingOptional = optionalVars.filter((v) => !process.env[v]);
    if (missingOptional.length) {
        console.warn(`⚠️ Missing optional payment variables: ${missingOptional.join(', ')}. Payment features will be unavailable.`);
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

        // Payment Gateway Configuration
        payment: {
            momo: {
                partnerCode: process.env.MOMO_PARTNER_CODE,
                accessKey: process.env.MOMO_ACCESS_KEY,
                secretKey: process.env.MOMO_SECRET_KEY,
                redirectUrl: process.env.MOMO_REDIRECT_URL || `${process.env.API_URL || 'http://localhost:5000'}/api/v1/payments/momo/return`,
                ipnUrl: process.env.MOMO_IPN_URL || `${process.env.API_URL || 'http://localhost:5000'}/api/v1/payments/momo/ipn`,
                isSandbox: process.env.MOMO_SANDBOX === 'true' || process.env.NODE_ENV !== 'production',
            },
            vnpay: {
                tmnCode: process.env.VNPAY_TMN_CODE,
                hashSecret: process.env.VNPAY_HASH_SECRET,
                returnUrl: process.env.VNPAY_RETURN_URL || `${process.env.API_URL || 'http://localhost:5000'}/api/v1/payments/vnpay/return`,
                ipnUrl: process.env.VNPAY_IPN_URL || `${process.env.API_URL || 'http://localhost:5000'}/api/v1/payments/vnpay/ipn`,
                isSandbox: process.env.VNPAY_SANDBOX === 'true' || process.env.NODE_ENV !== 'production',
            },
        },
    },
};
