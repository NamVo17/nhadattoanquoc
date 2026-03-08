'use strict';

const logger = require('../utils/logger');
const { env } = require('../config/env.config');

/**
 * Centralized error handler middleware
 * Differentiates operational errors from unexpected bugs.
 */
const errorHandler = (err, req, res, next) => {
    // Log everything; in production only log 5xx errors
    if (!env.IS_PRODUCTION || err.statusCode >= 500) {
        logger.error(`${req.method} ${req.originalUrl} → ${err.statusCode || 500}: ${err.message}`, {
            stack: err.stack,
            body: req.body,
        });
    }

    const statusCode = err.statusCode || 500;
    const message =
        env.IS_PRODUCTION && statusCode === 500 ? 'Đã xảy ra lỗi hệ thống, vui lòng thử lại.' : err.message;

    res.status(statusCode).json({
        success: false,
        message,
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

/**
 * 404 handler – must be registered AFTER all routes
 */
const notFound = (req, res) => {
    res.status(404).json({ success: false, message: `Route không tồn tại: ${req.originalUrl}` });
};

/**
 * Create a structured ApiError to throw from controllers
 */
class ApiError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { errorHandler, notFound, ApiError };
