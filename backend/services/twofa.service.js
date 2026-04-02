'use strict';

const speakeasy = require('speakeasy');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { supabaseAdmin } = require('../config/db.config');
const { ApiError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

/**
 * Generate backup codes (8-character recovery codes)
 * Format: XXX-XXX-XXX (12 characters with dashes)
 */
const generateBackupCodes = (count = 10) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = crypto
            .randomBytes(4)
            .toString('hex')
            .toUpperCase()
            .match(/.{1,3}/g)
            .join('-');
        codes.push(code);
    }
    return codes;
};

/**
 * Generate TOTP secret and QR code
 */
const generateTOTPSecret = async (email, appName = 'NhaDatToàn Quốc') => {
    const secret = speakeasy.generateSecret({
        name: `${appName} (${email})`,
        issuer: appName,
        length: 32,
    });

    // Generate QR code as data URL
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
        secret: secret.base32,
        qrCode,
        otpauth_url: secret.otpauth_url,
    };
};

/**
 * Verify TOTP code
 */
const verifyTOTPCode = (secret, code, window = 1) => {
    if (!secret || !code) return false;

    try {
        return speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token: code,
            window,
        });
    } catch (err) {
        logger.error('TOTP verification error:', err);
        return false;
    }
};

/**
 * Use a backup code (consumes it)
 * Returns true if valid, false if invalid or already used
 */
const useBackupCode = async (userId, code) => {
    try {
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('totp_backup_codes')
            .eq('id', userId)
            .single();

        if (!user) throw new ApiError('Người dùng không tồn tại.', 404);

        const codes = user.totp_backup_codes || [];
        const codeIndex = codes.indexOf(code);

        if (codeIndex === -1) {
            return false; // Code not found or already used
        }

        // Remove the used code
        codes.splice(codeIndex, 1);

        await supabaseAdmin
            .from('users')
            .update({ totp_backup_codes: codes })
            .eq('id', userId);

        logger.info(`Backup code used by user: ${userId}`);
        return true;
    } catch (err) {
        logger.error('Backup code usage error:', err);
        throw err;
    }
};

/**
 * Setup TOTP 2FA
 * Returns: { secret, qrCode, backupCodes }
 */
const setupTOTP2FA = async (userId, email) => {
    try {
        const totp = await generateTOTPSecret(email);
        const backupCodes = generateBackupCodes(10);

        // Store temporary data (not marked as verified yet)
        await supabaseAdmin
            .from('users')
            .update({
                totp_secret: totp.secret,
                totp_backup_codes: backupCodes,
                is_2fa_totp_verified: false,
            })
            .eq('id', userId);

        return {
            secret: totp.secret,
            qrCode: totp.qrCode,
            backupCodes,
            otpauth_url: totp.otpauth_url,
        };
    } catch (err) {
        logger.error('Setup TOTP error:', err);
        throw new ApiError('Không thể thiết lập xác thực 2 lớp.', 500);
    }
};

/**
 * Confirm TOTP setup by verifying the code
 */
const confirmTOTP2FA = async (userId, totpCode) => {
    try {
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('totp_secret')
            .eq('id', userId)
            .single();

        if (!user || !user.totp_secret) {
            throw new ApiError('TOTP chưa được thiết lập. Vui lòng thiết lập lại.', 400);
        }

        // Verify the code
        const isValid = verifyTOTPCode(user.totp_secret, totpCode);
        if (!isValid) {
            throw new ApiError('Mã xác thực không hợp lệ. Vui lòng thử lại.', 400);
        }

        // Mark as verified and enable 2FA
        await supabaseAdmin
            .from('users')
            .update({
                is_2fa_totp_verified: true,
                is_2fa_enabled: true,
                last_2fa_verification: new Date().toISOString(),
            })
            .eq('id', userId);

        logger.info(`TOTP 2FA confirmed for user: ${userId}`);

        return {
            success: true,
            message: 'Xác thực 2 lớp đã được kích hoạt thành công!',
        };
    } catch (err) {
        if (err instanceof ApiError) throw err;
        logger.error('Confirm TOTP error:', err);
        throw new ApiError('Lỗi xác nhận TOTP.', 500);
    }
};

/**
 * Disable TOTP 2FA
 */
const disableTOTP2FA = async (userId) => {
    try {
        await supabaseAdmin
            .from('users')
            .update({
                totp_secret: null,
                totp_backup_codes: [],
                is_2fa_totp_verified: false,
                is_2fa_enabled: false,
            })
            .eq('id', userId);

        logger.info(`TOTP 2FA disabled for user: ${userId}`);

        return {
            success: true,
            message: 'Xác thực 2 lớp đã được vô hiệu hóa.',
        };
    } catch (err) {
        logger.error('Disable TOTP error:', err);
        throw new ApiError('Lỗi vô hiệu hóa TOTP.', 500);
    }
};

/**
 * Get remaining backup codes count
 */
const getBackupCodesRemaining = async (userId) => {
    try {
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('totp_backup_codes')
            .eq('id', userId)
            .single();

        return user?.totp_backup_codes?.length || 0;
    } catch (err) {
        logger.error('Get backup codes count error:', err);
        return 0;
    }
};

/**
 * Regenerate backup codes
 */
const regenerateBackupCodes = async (userId) => {
    try {
        const newCodes = generateBackupCodes(10);

        await supabaseAdmin
            .from('users')
            .update({ totp_backup_codes: newCodes })
            .eq('id', userId);

        logger.info(`Backup codes regenerated for user: ${userId}`);

        return {
            success: true,
            message: 'Mã phục hồi mới đã được tạo.',
            backupCodes: newCodes,
        };
    } catch (err) {
        logger.error('Regenerate backup codes error:', err);
        throw new ApiError('Lỗi tạo lại mã phục hồi.', 500);
    }
};

module.exports = {
    generateBackupCodes,
    generateTOTPSecret,
    verifyTOTPCode,
    useBackupCode,
    setupTOTP2FA,
    confirmTOTP2FA,
    disableTOTP2FA,
    getBackupCodesRemaining,
    regenerateBackupCodes,
};
