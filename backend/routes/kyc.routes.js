'use strict';

const express = require('express');
const { body } = require('express-validator');

const {
  getMyKYC,
  submitKYC,
  updatePassword,
  getPendingVerifications,
  getKYCDetails,
  getKYCByUserId,
  approveKYC,
  rejectKYC,
  getKYCStatistics,
} = require('../controllers/kyc.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { uploadMultiple } = require('../middleware/upload.middleware');

const router = express.Router();

// ─── USER ROUTES (Protected) ───────────────────────────────────────────────────

/**
 * GET /api/v1/kyc/me
 * Get current user's KYC status
 */
router.get('/me', authenticate, getMyKYC);

/**
 * POST /api/v1/kyc/submit
 * Submit KYC verification
 */
router.post(
  '/submit',
  authenticate,
  uploadMultiple([
    { name: 'idImageFront', maxCount: 1 },
    { name: 'idImageBack', maxCount: 1 },
  ]),
  [
    body('idType').isIn(['cccd', 'passport', 'license']).withMessage('Loại giấy tờ không hợp lệ.'),
    body('idNumber').trim().notEmpty().withMessage('Số giấy tờ không được để trống.'),
    body('fullName').trim().notEmpty().withMessage('Họ tên không được để trống.'),
    body('dateOfBirth').isISO8601().withMessage('Ngày sinh không hợp lệ.'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Giới tính không hợp lệ.'),
    body('address').trim().notEmpty().withMessage('Địa chỉ không được để trống.'),
    body('city').trim().notEmpty().withMessage('Thành phố không được để trống.'),
    body('district').trim().notEmpty().withMessage('Quận/Huyện không được để trống.'),
  ],
  submitKYC
);

/**
 * POST /api/v1/kyc/change-password
 * Update password
 */
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Vui lòng nhập mật khẩu hiện tại.'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Mật khẩu tối thiểu 8 ký tự.')
      .matches(/[A-Z]/)
      .withMessage('Mật khẩu phải có ít nhất 1 chữ hoa.')
      .matches(/[0-9]/)
      .withMessage('Mật khẩu phải có ít nhất 1 chữ số.'),
    body('confirmPassword').custom((val, { req }) => {
      if (val !== req.body.newPassword) throw new Error('Mật khẩu xác nhận không khớp.');
      return true;
    }),
  ],
  updatePassword
);

// ─── ADMIN ROUTES (Protected + Admin only) ─────────────────────────────────────

/**
 * GET /api/v1/kyc/admin/statistics
 * Get KYC statistics
 */
router.get('/admin/statistics', authenticate, authorize('admin', 'moderator'), getKYCStatistics);

/**
 * GET /api/v1/kyc/admin/pending
 * Get all pending KYC verifications
 */
router.get('/admin/pending', authenticate, authorize('admin', 'moderator'), getPendingVerifications);

/**
 * GET /api/v1/kyc/admin/user/:userId
 * Get KYC details by user ID
 */
router.get('/admin/user/:userId', authenticate, authorize('admin', 'moderator'), getKYCByUserId);

/**
 * GET /api/v1/kyc/admin/:id
 * Get KYC details by ID
 */
router.get('/admin/:id', authenticate, authorize('admin', 'moderator'), getKYCDetails);

/**
 * POST /api/v1/kyc/admin/:id/approve
 * Approve KYC
 */
router.post(
  '/admin/:id/approve',
  authenticate,
  authorize('admin', 'moderator'),
  [body('verificationScore').optional().isNumeric().withMessage('Điểm xác thực phải là số.')],
  approveKYC
);

/**
 * POST /api/v1/kyc/admin/:id/reject
 * Reject KYC
 */
router.post(
  '/admin/:id/reject',
  authenticate,
  authorize('admin', 'moderator'),
  [body('reason').trim().notEmpty().withMessage('Vui lòng nhập lý do từ chối.')],
  rejectKYC
);

module.exports = router;
