'use strict';

const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const {
    register, verifyEmail, login, refreshToken, logout,
    forgotPassword, resetPassword, verify2FA, resendVerification, getMe,
    uploadAvatar, uploadCover, updateProfile, getAgents, getAgentById,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { env } = require('../config/env.config');

const router = express.Router();

// Strict rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: env.rateLimit.authMax,
    message: { success: false, message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.' },
    standardHeaders: true,
    legacyHeaders: false,
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
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidators, resetPassword);
router.post('/verify-2fa', authenticate, verify2FA);
router.get('/me', authenticate, getMe);
router.post('/upload-avatar', authenticate, uploadAvatar);
router.post('/upload-cover', authenticate, uploadCover);
router.patch('/profile', authenticate, updateProfile);

// Public agent routes
router.get('/agents', getAgents);
router.get('/agents/:id', getAgentById);

module.exports = router;
