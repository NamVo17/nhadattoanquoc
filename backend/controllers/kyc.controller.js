'use strict';

const { validationResult } = require('express-validator');
const KYCModel = require('../models/kyc.model');
const UserModel = require('../models/user.model');
const { ApiError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg).join('; ');
    throw new ApiError(messages, 422);
  }
};

/**
 * Get current user's KYC status
 */
const getMyKYC = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const kyc = await KYCModel.getByUserId(userId);

    return res.status(200).json({
      success: true,
      data: kyc || {
        status: 'unverified',
        message: 'Bạn chưa xác thực danh tính.',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit KYC verification
 */
const submitKYC = async (req, res, next) => {
  try {
    checkValidation(req);

    const userId = req.user.id;
    const {
      idType,
      idNumber,
      fullName,
      dateOfBirth,
      gender,
      address,
      city,
      district,
      ward,
    } = req.body;

    // Get uploaded files from multer memory storage
    const idImageFrontFile = req.files?.['idImageFront']?.[0];
    const idImageBackFile = req.files?.['idImageBack']?.[0];

    if (!idImageFrontFile || !idImageBackFile) {
      throw new ApiError('Vui lòng tải lên cả hai ảnh CCCD/Hộ chiếu.', 400);
    }

    // Upload images to Supabase Storage
    const { supabaseAdmin } = require('../config/db.config');
    const timestamp = Date.now();
    const userIdShort = userId.substring(0, 8);
    
    // Create unique file names
    const frontFileName = `kyc/${userId}/front-${timestamp}-${idImageFrontFile.originalname}`;
    const backFileName = `kyc/${userId}/back-${timestamp}-${idImageBackFile.originalname}`;

    try {
      // Upload front image
      const { error: frontError } = await supabaseAdmin.storage
        .from('kyc-images')
        .upload(frontFileName, idImageFrontFile.buffer, {
          contentType: idImageFrontFile.mimetype,
          cacheControl: '3600',
        });

      if (frontError) {
        logger.error('Supabase upload front error:', frontError);
        throw new ApiError('Không thể tải lên ảnh mặt trước.', 400);
      }

      // Upload back image
      const { error: backError } = await supabaseAdmin.storage
        .from('kyc-images')
        .upload(backFileName, idImageBackFile.buffer, {
          contentType: idImageBackFile.mimetype,
          cacheControl: '3600',
        });

      if (backError) {
        logger.error('Supabase upload back error:', backError);
        throw new ApiError('Không thể tải lên ảnh mặt sau.', 400);
      }

      // Get public URLs for the uploaded images
      const { data: frontData } = supabaseAdmin.storage
        .from('kyc-images')
        .getPublicUrl(frontFileName);
      
      const { data: backData } = supabaseAdmin.storage
        .from('kyc-images')
        .getPublicUrl(backFileName);

      const idImageFront = frontData?.publicUrl;
      const idImageBack = backData?.publicUrl;

      const kyc = await KYCModel.upsert(userId, {
        idType,
        idNumber,
        fullName,
        dateOfBirth,
        gender,
        address,
        city,
        district,
        ward,
        idImageFront,
        idImageBack,
      });

      logger.info(`User ${userId} submitted KYC verification`);

      return res.status(201).json({
        success: true,
        message: 'Xác thực danh tính đang được xử lý. Vui lòng kiên nhẫn.',
        data: kyc,
      });
    } catch (storageError) {
      logger.error('Storage error during KYC submission:', storageError);
      throw new ApiError('Có lỗi xảy ra khi xử lý hình ảnh. Vui lòng thử lại.', 500);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Update password
 */
const updatePassword = async (req, res, next) => {
  try {
    checkValidation(req);

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Get user with password hash
    const user = await UserModel.findByEmailForAuth(req.user.email);

    if (!user) {
      throw new ApiError('Không tìm thấy người dùng.', 404);
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      throw new ApiError('Mật khẩu hiện tại không chính xác.', 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { supabaseAdmin } = require('../config/db.config');
    const { error } = await supabaseAdmin
      .from('users')
      .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      throw new ApiError('Không thể cập nhật mật khẩu.', 400);
    }

    logger.info(`User ${userId} changed password`);

    return res.status(200).json({
      success: true,
      message: 'Mật khẩu đã được cập nhật thành công.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN ENDPOINTS ───────────────────────────────────────────────────────────

/**
 * Get all pending KYC verifications (admin)
 */
const getPendingVerifications = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { data, count } = await KYCModel.getPendingVerifications(
      parseInt(limit),
      parseInt(offset)
    );

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get KYC verification details (admin)
 */
const getKYCDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const kyc = await KYCModel.getById(id);

    return res.status(200).json({
      success: true,
      data: kyc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get KYC verification by user ID (admin)
 */
const getKYCByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const kyc = await KYCModel.getByUserId(userId);

    return res.status(200).json({
      success: true,
      data: kyc || {
        status: 'unverified',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve KYC (admin)
 */
const approveKYC = async (req, res, next) => {
  try {
    checkValidation(req);

    const { id } = req.params;
    const { verificationScore = 100 } = req.body;
    const adminId = req.user.id;

    const kyc = await KYCModel.approve(id, adminId, verificationScore);

    logger.info(`Admin ${adminId} approved KYC ${id}`);

    return res.status(200).json({
      success: true,
      message: 'Xác thực danh tính đã được phê duyệt.',
      data: kyc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject KYC (admin)
 */
const rejectKYC = async (req, res, next) => {
  try {
    checkValidation(req);

    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason || reason.trim().length === 0) {
      throw new ApiError('Vui lòng nhập lý do từ chối.', 400);
    }

    const kyc = await KYCModel.reject(id, adminId, reason);

    logger.info(`Admin ${adminId} rejected KYC ${id}`);

    return res.status(200).json({
      success: true,
      message: 'Yêu cầu xác thực danh tính đã bị từ chối.',
      data: kyc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get KYC statistics (admin dashboard)
 */
const getKYCStatistics = async (req, res, next) => {
  try {
    const stats = await KYCModel.getStatistics();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyKYC,
  submitKYC,
  updatePassword,
  getPendingVerifications,
  getKYCDetails,
  getKYCByUserId,
  approveKYC,
  rejectKYC,
  getKYCStatistics,
};
