'use strict';

const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const {
    register, verifyEmail, login, login2FA, refreshToken, logout,
    forgotPassword, resetPassword, verify2FA, resendVerification, getMe,
    uploadAvatar, uploadCover, updateProfile, getAgents, getAgentById,
    getUsers, toggleUserStatus, deleteUser,
    setupTOTP2FA, confirmTOTP2FA, disable2FA, get2FAStatus, regenerateBackupCodes,
    getDashboardStats, updateSettings,
} = require('../controllers/auth.controller');
const {
    getTrustedDevices,
    revokeDeviceTrust,
    revokeAllDevices,
} = require('../controllers/device.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { env } = require('../config/env.config');

const router = express.Router();

// Rate limit for auth routes - per email address (not per IP)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: env.rateLimit.authMax,
    message: { success: false, message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.' },
    standardHeaders: true,
    legacyHeaders: false,
    // Key by email from request body to prevent one user from blocking others
    keyGenerator: (req, res) => {
        // For login/register/forgot-password, use email from body
        if (req.body && req.body.email) {
            return req.body.email.toLowerCase();
        }
        // For other auth routes, use IP
        return req.ip;
    },
});

// ─── Validators ───────────────────────────────────────────────────────────────

const registerValidators = [
    body('fullName').trim().notEmpty().withMessage('Họ tên không được để trống.')
        .isLength({ min: 2, max: 100 }).withMessage('Họ tên từ 2–100 ký tự.'),
    body('email').trim().isEmail().withMessage('Email không hợp lệ.').normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('Số điện thoại không được để trống.')
        .matches(/^(0|\+84)[0-9]{9}$/).withMessage('Số điện thoại VN không hợp lệ.'),
    body('password')
        .isLength({ min: 8 }).withMessage('Mật khẩu tối thiểu 8 ký tự.')
        .matches(/[A-Z]/).withMessage('Mật khẩu phải có ít nhất 1 chữ hoa.')
        .matches(/[0-9]/).withMessage('Mật khẩu phải có ít nhất 1 chữ số.'),
    body('confirmPassword').custom((val, { req }) => {
        if (val !== req.body.password) throw new Error('Mật khẩu xác nhận không khớp.');
        return true;
    }),
    body('role').optional().isIn(['user', 'agent']).withMessage('Vai trò không hợp lệ.'),
    body('enable2FA').optional().isBoolean(),
    body('agreedToTerms').equals('true').withMessage('Bạn phải đồng ý với điều khoản dịch vụ.'),
];

const loginValidators = [
    body('email').trim().isEmail().withMessage('Email không hợp lệ.').normalizeEmail(),
    body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu.'),
];

const resetPasswordValidators = [
    body('token').notEmpty().withMessage('Token không hợp lệ.'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('Mật khẩu tối thiểu 8 ký tự.')
        .matches(/[A-Z]/).withMessage('Mật khẩu phải có ít nhất 1 chữ hoa.')
        .matches(/[0-9]/).withMessage('Mật khẩu phải có ít nhất 1 chữ số.'),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post('/register', authLimiter, registerValidators, register);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/login', authLimiter, loginValidators, login);
router.post('/login-2fa', authLimiter, loginValidators, login2FA);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidators, resetPassword);
router.post('/verify-2fa', authenticate, verify2FA);

// ─── 2FA Management Routes ────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/2fa/setup
 * Initiate TOTP 2FA setup (returns QR code)
 */
router.post('/2fa/setup', authenticate, setupTOTP2FA);

/**
 * POST /api/v1/auth/2fa/confirm
 * Confirm TOTP 2FA setup with code
 * Body: { totpCode: string }
 */
router.post('/2fa/confirm', authenticate, confirmTOTP2FA);

/**
 * GET /api/v1/auth/2fa/status
 * Get current 2FA status
 */
router.get('/2fa/status', authenticate, get2FAStatus);

/**
 * POST /api/v1/auth/2fa/disable
 * Disable 2FA
 * Body: { password: string }
 */
router.post('/2fa/disable', authenticate, disable2FA);

/**
 * POST /api/v1/auth/2fa/backup-codes/regenerate
 * Regenerate backup codes
 * Body: { password: string }
 */
router.post('/2fa/backup-codes/regenerate', authenticate, regenerateBackupCodes);

// ─── Device Management Routes ─────────────────────────────────────────────────
/**
 * GET /api/v1/auth/devices/trusted
 * Get all trusted devices for current user
 */
router.get('/devices/trusted', authenticate, getTrustedDevices);

/**
 * POST /api/v1/auth/devices/:id/revoke
 * Revoke trust for specific device
 * Body: { deviceId: number }
 */
router.post('/devices/:id/revoke', authenticate, revokeDeviceTrust);

/**
 * POST /api/v1/auth/devices/revoke-all
 * Revoke trust for all devices except current
 */
router.post('/devices/revoke-all', authenticate, revokeAllDevices);

router.get('/me', authenticate, getMe);
router.post('/upload-avatar', authenticate, uploadAvatar);
router.post('/upload-cover', authenticate, uploadCover);
router.patch('/profile', authenticate, updateProfile);
router.get('/dashboard-stats', authenticate, getDashboardStats);
router.patch('/settings', authenticate, updateSettings);

// Public agent routes
router.get('/agents', getAgents);
router.get('/agents/:id', getAgentById);

// ─── Admin Routes ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/auth/users
 * Get all users (admin only)
 */
router.get('/users', authenticate, authorize('admin', 'moderator'), getUsers);

/**
 * POST /api/v1/auth/users/:id/toggle-status
 * Toggle user account status (admin only)
 */
router.post('/users/:id/toggle-status', authenticate, authorize('admin', 'moderator'), toggleUserStatus);

/**
 * DELETE /api/v1/auth/users/:id
 * Delete user account (admin only)
 */
router.delete('/users/:id', authenticate, authorize('admin', 'moderator'), deleteUser);

module.exports = router;
