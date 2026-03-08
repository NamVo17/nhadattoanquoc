'use strict';

const jwt = require('jsonwebtoken');
const { env } = require('../config/env.config');
const { ApiError } = require('./error.middleware');
const { supabaseAdmin } = require('../config/db.config');

/**
 * Verify JWT access token and attach user to req.user
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.', 401);
        }

        const token = authHeader.split(' ')[1];
        let decoded;

        try {
            decoded = jwt.verify(token, env.jwt.accessSecret);
        } catch (jwtErr) {
            if (jwtErr.name === 'TokenExpiredError') {
                throw new ApiError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 401);
            }
            throw new ApiError('Token không hợp lệ.', 401);
        }

        // Fetch fresh user from DB (handles account suspension/deletion)
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, full_name, email, phone, role, is_active, is_email_verified')
            .eq('id', decoded.sub)
            .single();

        if (error || !user) throw new ApiError('Tài khoản không tồn tại.', 401);
        if (!user.is_active) throw new ApiError('Tài khoản đã bị khóa.', 403);

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
};

/**
 * Require specific roles: authorize('admin', 'moderator')
 */
const authorize = (...roles) => (req, res, next) => {
    if (!req.user) return next(new ApiError('Chưa xác thực.', 401));
    if (!roles.includes(req.user.role)) {
        return next(new ApiError('Bạn không có quyền thực hiện hành động này.', 403));
    }
    next();
};

/**
 * Require verified email
 */
const requireEmailVerified = (req, res, next) => {
    if (!req.user?.is_email_verified) {
        return next(new ApiError('Vui lòng xác thực email trước khi tiếp tục.', 403));
    }
    next();
};

module.exports = { authenticate, authorize, requireEmailVerified };
