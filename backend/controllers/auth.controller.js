'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const { env } = require('../config/env.config');
const UserModel = require('../models/user.model');
const { ApiError } = require('../middleware/error.middleware');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email.utils');
const logger = require('../utils/logger');
const { supabaseAdmin } = require('../config/db.config');
const twoFAService = require('../services/twofa.service');
const deviceService = require('../services/device.service');

// ─── Token helpers ────────────────────────────────────────────────────────────
const signAccessToken = (userId, role) =>
    jwt.sign({ sub: userId, role }, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn });

const signRefreshToken = (userId) =>
    jwt.sign({ sub: userId }, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const setRefreshCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: env.IS_PRODUCTION,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/v1/auth/refresh',
    });
};

const checkValidation = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map((e) => e.msg).join('; ');
        throw new ApiError(messages, 422);
    }
};

// ─── BƯỚC 1: Register → lưu vào pending, gửi email xác thực ─────────────────
const register = async (req, res, next) => {
    try {
        checkValidation(req);
        const { fullName, email, phone, password, role = 'user', enable2FA } = req.body;

        // Kiểm tra email đã là user thật chưa
        const existingUser = await UserModel.findByEmailForAuth(email);
        if (existingUser) throw new ApiError('Email đã được sử dụng.', 409);

        // Kiểm tra số điện thoại đã tồn tại trong users chưa
        const { data: existingPhone } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('phone', phone.trim())
            .single();
        if (existingPhone) throw new ApiError('Số điện thoại đã được sử dụng.', 409);

        // Xoá pending cũ cùng email nếu có (cho phép đăng ký lại)
        await supabaseAdmin
            .from('pending_registrations')
            .delete()
            .eq('email', email.toLowerCase().trim());

        // Hash mật khẩu
        const passwordHash = await bcrypt.hash(password, env.bcrypt.saltRounds);

        // Tạo token xác thực (24h)
        const rawToken = uuidv4();
        const verifyToken = hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Lưu vào bảng pending
        const { error: insertErr } = await supabaseAdmin
            .from('pending_registrations')
            .insert({
                full_name: fullName,
                email: email.toLowerCase().trim(),
                phone: phone.trim(),
                password_hash: passwordHash,
                role: ['user', 'agent'].includes(role) ? role : 'user',
                enable_2fa: enable2FA === true,
                verify_token: verifyToken,
                expires_at: expiresAt,
            });

        if (insertErr) {
            logger.error('pending insert error:', insertErr);
            if (insertErr.code === '23505') {
                // Vẫn có thể là email trùng trong pending
                throw new ApiError('Email này đang chờ xác thực. Vui lòng kiểm tra hộp thư.', 409);
            }
            throw new ApiError('Không thể xử lý đăng ký. Vui lòng thử lại.', 500);
        }

        // Gửi email xác thực
        await sendVerificationEmail(email, fullName, rawToken);

        logger.info(`Pending registration created: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản. Link có hiệu lực trong 24 giờ.',
        });
    } catch (err) {
        next(err);
    }
};

// ─── BƯỚC 2: Xác thực email → tạo user thật trong DB ────────────────────────
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) throw new ApiError('Token không hợp lệ.', 400);

        const hashedToken = hashToken(token);

        // Tìm trong pending
        const { data: pending, error } = await supabaseAdmin
            .from('pending_registrations')
            .select('*')
            .eq('verify_token', hashedToken)
            .single();

        if (error || !pending) {
            throw new ApiError('Link xác thực không hợp lệ hoặc đã được sử dụng.', 400);
        }
        if (new Date(pending.expires_at) < new Date()) {
            // Xoá pending hết hạn
            await supabaseAdmin.from('pending_registrations').delete().eq('id', pending.id);
            throw new ApiError('Link xác thực đã hết hạn. Vui lòng đăng ký lại.', 400);
        }

        // Tạo user thật
        const user = await UserModel.create({
            fullName: pending.full_name,
            email: pending.email,
            phone: pending.phone,
            passwordHash: pending.password_hash,
            role: pending.role,
            emailVerifyToken: null,
            emailVerifyExpires: null,
        });

        // Nếu enable 2FA thì tạo secret TOTP
        let totpSecret = null;
        let totpQr = null;
        if (pending.enable_2fa) {
            const secret = speakeasy.generateSecret({ name: `NhaDat:${user.email}`, length: 20 });
            await UserModel.update(user.id, { totp_secret: secret.base32, is_2fa_enabled: false });
            totpSecret = secret.base32;
            totpQr = secret.otpauth_url;
        }

        // Đánh dấu email đã xác thực
        await UserModel.update(user.id, { is_email_verified: true });

        // Xoá pending registration
        await supabaseAdmin.from('pending_registrations').delete().eq('id', pending.id);

        logger.info(`Email verified & user created: ${user.email}`);

        res.json({
            success: true,
            message: 'Email đã được xác thực! Tài khoản của bạn đã được kích hoạt.',
            data: {
                user,
                ...(pending.enable_2fa && { totpSecret, totpQr }),
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── Login ───────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
    try {
        checkValidation(req);
        const { email, password, totpCode } = req.body;

        const user = await UserModel.findByEmailForAuth(email);
        if (!user) throw new ApiError('Email hoặc mật khẩu không đúng.', 401);
        if (!user.is_active) throw new ApiError('Tài khoản đã bị khóa.', 403);
        if (!user.is_email_verified)
            throw new ApiError('Vui lòng xác thực email trước khi đăng nhập.', 403);

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) throw new ApiError('Email hoặc mật khẩu không đúng.', 401);

        // Track device login
        const userAgent = req.headers['user-agent'] || '';
        const ipAddress = req.ip || req.connection.remoteAddress || '';
        const deviceFingerprint = deviceService.generateDeviceFingerprint(userAgent, ipAddress);
        await deviceService.trackDeviceLogin(user.id, userAgent, ipAddress);

        // Check 2FA if enabled
        if (user.is_2fa_enabled) {
            // Check if device is already trusted
            const isTrusted = await deviceService.isDeviceTrusted(user.id, deviceFingerprint);
            
            if (!isTrusted) {
                // Device not trusted, require 2FA
                if (!totpCode) throw new ApiError('Vui lòng nhập mã xác thực 2 lớp.', 400);

                const valid = speakeasy.totp.verify({
                    secret: user.totp_secret,
                    encoding: 'base32',
                    token: totpCode,
                    window: 1,
                });
                if (!valid) throw new ApiError('Mã xác thực 2 lớp không hợp lệ.', 401);
            }
            // If device is trusted, skip 2FA requirement
        }

        const accessToken = signAccessToken(user.id, user.role);
        const refreshToken = signRefreshToken(user.id);
        await UserModel.update(user.id, { 
            refresh_token_hash: hashToken(refreshToken),
            last_login: new Date().toISOString(),
            last_device_fingerprint: deviceFingerprint,
        });
        setRefreshCookie(res, refreshToken);

        logger.info(`User logged in: ${user.email}`);

        res.json({
            success: true,
            message: 'Đăng nhập thành công.',
            data: {
                accessToken,
                user: {
                    id: user.id, fullName: user.full_name, email: user.email,
                    phone: user.phone, role: user.role, avatarUrl: user.avatar_url,
                    isEmailVerified: user.is_email_verified,
                },
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── Refresh Token ───────────────────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) throw new ApiError('Không tìm thấy refresh token.', 401);

        let decoded;
        try { decoded = jwt.verify(token, env.jwt.refreshSecret); }
        catch { throw new ApiError('Refresh token không hợp lệ hoặc đã hết hạn.', 401); }

        const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('id, role, is_active, refresh_token_hash')
            .eq('id', decoded.sub)
            .single();

        if (!dbUser || !dbUser.is_active) throw new ApiError('Tài khoản không hợp lệ.', 401);
        if (dbUser.refresh_token_hash !== hashToken(token))
            throw new ApiError('Refresh token đã bị thu hồi.', 401);

        const newAccessToken = signAccessToken(dbUser.id, dbUser.role);
        res.json({ success: true, data: { accessToken: newAccessToken } });
    } catch (err) {
        next(err);
    }
};

// ─── Logout ──────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
    try {
        if (req.user) await UserModel.update(req.user.id, { 
            refresh_token_hash: null,
            last_login: null  // Clear last_login on logout
        });
        res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
        res.json({ success: true, message: 'Đăng xuất thành công.' });
    } catch (err) { next(err); }
};

// ─── Forgot Password ─────────────────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findByEmailForAuth(email);
        if (!user) return res.json({ success: true, message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.' });

        const rawToken = uuidv4();
        const resetToken = hashToken(rawToken);
        await UserModel.update(user.id, {
            password_reset_token: resetToken,
            password_reset_expires: new Date(Date.now() + 60 * 60 * 1000),
        });
        sendPasswordResetEmail(user.email, user.full_name, rawToken).catch((e) => logger.warn(e.message));
        res.json({ success: true, message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.' });
    } catch (err) { next(err); }
};

// ─── Reset Password ──────────────────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
    try {
        checkValidation(req);
        const { token, newPassword } = req.body;
        const user = await UserModel.findByResetToken(hashToken(token));
        if (!user || new Date(user.password_reset_expires) < new Date())
            throw new ApiError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.', 400);

        await UserModel.update(user.id, {
            password_hash: await bcrypt.hash(newPassword, env.bcrypt.saltRounds),
            password_reset_token: null,
            password_reset_expires: null,
            refresh_token_hash: null,
        });
        res.json({ success: true, message: 'Mật khẩu đã được đặt lại thành công.' });
    } catch (err) { next(err); }
};

// ─── Setup TOTP 2FA (Initiate) ────────────────────────────────────────────────
const setupTOTP2FA = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const user = await UserModel.findById(userId);
        if (!user) throw new ApiError('Người dùng không tồn tại.', 404);

        const setup = await twoFAService.setupTOTP2FA(userId, user.email);

        logger.info(`TOTP setup initiated for user: ${userId}`);

        res.json({
            success: true,
            message: 'TOTP 2FA setup initiated. Scan QR code or enter secret manually.',
            data: {
                secret: setup.secret,
                qrCode: setup.qrCode,
                backupCodes: setup.backupCodes,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── Confirm TOTP 2FA Setup ──────────────────────────────────────────────────
const confirmTOTP2FA = async (req, res, next) => {
    try {
        const { totpCode } = req.body;
        if (!totpCode) throw new ApiError('Vui lòng nhập mã xác thực.', 400);

        const userId = req.user.id;

        await twoFAService.confirmTOTP2FA(userId, totpCode);

        logger.info(`TOTP 2FA confirmed for user: ${userId}`);

        res.json({
            success: true,
            message: 'Xác thực 2 lớp đã được kích hoạt thành công!',
        });
    } catch (err) {
        next(err);
    }
};

// ─── Kích hoạt 2FA (old verify2FA - kept for compatibility) ───────────────────
const verify2FA = async (req, res, next) => {
    try {
        const { totpCode } = req.body;
        const user = await UserModel.findByEmailForAuth(req.user.email);
        const valid = speakeasy.totp.verify({ secret: user.totp_secret, encoding: 'base32', token: totpCode, window: 1 });
        if (!valid) throw new ApiError('Mã TOTP không hợp lệ.', 400);
        await UserModel.update(req.user.id, { is_2fa_enabled: true });
        res.json({ success: true, message: 'Xác thực 2 lớp đã được kích hoạt.' });
    } catch (err) { next(err); }
};

// ─── Login with 2FA (TOTP or Backup Code) ────────────────────────────────────
const login2FA = async (req, res, next) => {
    try {
        checkValidation(req);
        const { email, password, totpCode, backupCode, trustDevice: shouldTrustDevice } = req.body;

        const user = await UserModel.findByEmailForAuth(email);
        if (!user) throw new ApiError('Email hoặc mật khẩu không đúng.', 401);
        if (!user.is_active) throw new ApiError('Tài khoản đã bị khóa.', 403);
        if (!user.is_email_verified)
            throw new ApiError('Vui lòng xác thực email trước khi đăng nhập.', 403);

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) throw new ApiError('Email hoặc mật khẩu không đúng.', 401);

        // Track device login
        const userAgent = req.headers['user-agent'] || '';
        const ipAddress = req.ip || req.connection.remoteAddress || '';
        const deviceFingerprint = deviceService.generateDeviceFingerprint(userAgent, ipAddress);
        await deviceService.trackDeviceLogin(user.id, userAgent, ipAddress);

        // Check 2FA if enabled
        if (user.is_2fa_enabled) {
            // Check if device is already trusted
            const isTrusted = await deviceService.isDeviceTrusted(user.id, deviceFingerprint);
            
            if (!isTrusted) {
                // Device not trusted, require 2FA
                if (!totpCode && !backupCode) {
                    throw new ApiError('Vui lòng nhập mã xác thực 2 lớp.', 400);
                }

                let isValid = false;

                // Try TOTP code first
                if (totpCode) {
                    isValid = twoFAService.verifyTOTPCode(user.totp_secret, totpCode);
                }

                // Try backup code if TOTP didn't work
                if (!isValid && backupCode) {
                    isValid = await twoFAService.useBackupCode(user.id, backupCode);
                }

                if (!isValid) {
                    throw new ApiError('Mã xác thực 2 lớp không hợp lệ.', 401);
                }
            }
            // If device is trusted, skip 2FA requirement
        }

        const accessToken = signAccessToken(user.id, user.role);
        const refreshToken = signRefreshToken(user.id);
        await UserModel.update(user.id, { 
            refresh_token_hash: hashToken(refreshToken),
            last_2fa_verification: new Date().toISOString(),
            last_device_fingerprint: deviceFingerprint,
        });
        setRefreshCookie(res, refreshToken);

        // If user wants to trust this device after successful login
        if (shouldTrustDevice) {
            await deviceService.trustDevice(user.id, deviceFingerprint);
        }

        logger.info(`User with 2FA logged in: ${user.email}`);

        res.json({
            success: true,
            message: 'Đăng nhập thành công.',
            data: {
                accessToken,
                user: {
                    id: user.id,
                    fullName: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    avatarUrl: user.avatar_url,
                    isEmailVerified: user.is_email_verified,
                },
            },
        });
    } catch (err) {
        next(err);
    }
};


// ─── Disable 2FA ──────────────────────────────────────────────────────────────
const disable2FA = async (req, res, next) => {
    try {
        const { password } = req.body;
        if (!password) throw new ApiError('Vui lòng nhập mật khẩu để xác nhận.', 400);

        const userId = req.user.id;
        const user = await UserModel.findByEmailForAuth(req.user.email);

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) throw new ApiError('Mật khẩu không đúng.', 401);

        await twoFAService.disableTOTP2FA(userId);

        logger.info(`2FA disabled for user: ${userId}`);

        res.json({
            success: true,
            message: 'Xác thực 2 lớp đã được vô hiệu hóa.',
        });
    } catch (err) {
        next(err);
    }
};

// ─── Get 2FA Status ───────────────────────────────────────────────────────────
const get2FAStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const { data: user } = await supabaseAdmin
            .from('users')
            .select('is_2fa_enabled, is_2fa_totp_verified, totp_backup_codes')
            .eq('id', userId)
            .single();

        if (!user) throw new ApiError('Người dùng không tồn tại.', 404);

        const backupCodesRemaining = await twoFAService.getBackupCodesRemaining(userId);

        res.json({
            success: true,
            data: {
                is2FAEnabled: user.is_2fa_enabled,
                isTOTPVerified: user.is_2fa_totp_verified,
                backupCodesRemaining,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── Regenerate Backup Codes ─────────────────────────────────────────────────
const regenerateBackupCodes = async (req, res, next) => {
    try {
        const { password } = req.body;
        if (!password) throw new ApiError('Vui lòng nhập mật khẩu để xác nhận.', 400);

        const userId = req.user.id;
        const user = await UserModel.findByEmailForAuth(req.user.email);

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) throw new ApiError('Mật khẩu không đúng.', 401);

        const result = await twoFAService.regenerateBackupCodes(userId);

        logger.info(`Backup codes regenerated for user: ${userId}`);

        res.json({
            success: true,
            message: result.message,
            data: {
                backupCodes: result.backupCodes,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── Gửi lại email xác thực ──────────────────────────────────────────────────
const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) throw new ApiError('Vui lòng cung cấp email.', 400);

        const { data: pending } = await supabaseAdmin
            .from('pending_registrations')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (!pending) {
            return res.json({ success: true, message: 'Nếu email đang chờ xác thực, chúng tôi đã gửi lại link.' });
        }

        // Tạo token mới
        const rawToken = uuidv4();
        const verifyToken = hashToken(rawToken);
        await supabaseAdmin
            .from('pending_registrations')
            .update({ verify_token: verifyToken, expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) })
            .eq('id', pending.id);

        await sendVerificationEmail(email, pending.full_name, rawToken);
        res.json({ success: true, message: 'Nếu email đang chờ xác thực, chúng tôi đã gửi lại link.' });
    } catch (err) { next(err); }
};

// ─── Get Me ──────────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.id);
        res.json({ success: true, data: { user } });
    } catch (err) { next(err); }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { 
            fullName, phone,
            username, title, licenseCode, joinYear, experience, successDeals, bio,
            areas, propertyTypes, facebook, zalo, address
        } = req.body;

        const updateFields = {};

        // Only update fullName/phone if provided and changed
        if (fullName !== undefined && fullName.trim()) updateFields.full_name = fullName.trim();
        if (phone !== undefined && phone.trim()) {
            // Check phone uniqueness if changing
            const { data: existingPhone } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('phone', phone.trim())
                .neq('id', userId)
                .single();
            if (existingPhone) throw new ApiError('Số điện thoại đã được sử dụng bởi tài khoản khác.', 409);
            updateFields.phone = phone.trim();
        }

        // Update agent profile fields if provided
        if (username !== undefined) updateFields.username = username?.trim() || null;
        if (title !== undefined) updateFields.title = title?.trim() || null;
        if (licenseCode !== undefined) updateFields.license_code = licenseCode?.trim() || null;
        if (joinYear !== undefined) updateFields.join_year = joinYear?.trim() || null;
        if (experience !== undefined) updateFields.experience = experience?.trim() || null;
        if (successDeals !== undefined) updateFields.success_deals = successDeals?.trim() || null;
        if (bio !== undefined) updateFields.bio = bio?.trim() || null;
        if (areas !== undefined) updateFields.areas = Array.isArray(areas) ? areas : [];
        if (propertyTypes !== undefined) updateFields.property_types = Array.isArray(propertyTypes) ? propertyTypes : [];
        if (facebook !== undefined) updateFields.facebook = facebook?.trim() || null;
        if (zalo !== undefined) updateFields.zalo = zalo?.trim() || null;
        if (address !== undefined) updateFields.address = address?.trim() || null;

        if (Object.keys(updateFields).length === 0) {
            return res.json({ success: true, message: 'Không có thay đổi nào được thực hiện.', data: { user: await UserModel.findById(userId) } });
        }

        const updatedUser = await UserModel.update(userId, updateFields);

        logger.info(`Profile updated for user: ${req.user.email}`);

        res.json({
            success: true,
            message: 'Hồ sơ đã được cập nhật thành công.',
            data: { user: updatedUser },
        });
    } catch (err) { next(err); }
};

// ─── Get Agents (public list) ─────────────────────────────────────────────────
const getAgents = async (req, res, next) => {
    try {
        const { search = '', limit = 50, offset = 0 } = req.query;
        const agents = await UserModel.findAgents({
            search,
            limit: parseInt(limit, 10) || 50,
            offset: parseInt(offset, 10) || 0,
        });
        res.json({ success: true, data: { agents } });
    } catch (err) { next(err); }
};

// ─── Get Agent By Full Name (public) ─────────────────────────────────────────────────
const getAgentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) throw new ApiError('Tên cộng tác viên không hợp lệ.', 400);
        // Decode the full_name from URL parameter
        const fullName = decodeURIComponent(id);
        const agent = await UserModel.findAgentByFullName(fullName);
        res.json({ success: true, data: { agent } });
    } catch (err) { next(err); }
};

// ─── Upload Avatar ───────────────────────────────────────────────────────────
/**
 * Upload user avatar to Supabase Storage
 * Expects: { avatarUrl: string } (base64 data URI or direct URL)
 */
const uploadAvatar = async (req, res, next) => {
    try {
        const { avatarUrl } = req.body;
        if (!avatarUrl) throw new ApiError('Vui lòng cung cấp ảnh đại diện.', 400);

        // If it's a base64 data URI, handle it
        let finalAvatarUrl = avatarUrl;
        if (avatarUrl.startsWith('data:')) {
            try {
                // Extract base64 data and mime type
                const matches = avatarUrl.match(/^data:([^;]+);base64,(.+)$/);
                if (!matches) throw new ApiError('Định dạng ảnh không hợp lệ.', 400);

                const [, mimeType, base64Data] = matches;
                
                // Validate mime type
                const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
                if (!allowedMimes.includes(mimeType)) {
                    throw new ApiError('Chỉ hỗ trợ JPEG, PNG, WebP.', 400);
                }

                // Convert base64 to buffer
                const buffer = Buffer.from(base64Data, 'base64');
                
                // Check file size (max 5MB)
                if (buffer.length > 5 * 1024 * 1024) {
                    throw new ApiError('Ảnh không được vượt quá 5MB.', 400);
                }

                // Generate filename
                const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/webp' ? 'webp' : 'png';
                const filename = `${req.user.id}-${Date.now()}.${ext}`;
                const filepath = `avatars/${req.user.id}/${filename}`;

                // Upload to Supabase Storage
                const { data, error } = await supabaseAdmin.storage
                    .from('user_avatars')
                    .upload(filepath, buffer, {
                        contentType: mimeType,
                        upsert: false,
                    });

                if (error) {
                    logger.error('Avatar upload error:', error);
                    throw new ApiError('Không thể tải ảnh lên. Vui lòng thử lại.', 500);
                }

                // Get public URL
                const { data: publicData } = supabaseAdmin.storage
                    .from('user_avatars')
                    .getPublicUrl(filepath);

                finalAvatarUrl = publicData.publicUrl;
            } catch (err) {
                if (err instanceof ApiError) throw err;
                throw new ApiError('Lỗi xử lý ảnh: ' + err.message, 400);
            }
        }

        // Update user avatar URL in database
        const updatedUser = await UserModel.update(req.user.id, { avatar_url: finalAvatarUrl });

        logger.info(`Avatar uploaded for user: ${req.user.id}`);

        res.json({
            success: true,
            message: 'Ảnh đại diện đã được cập nhật.',
            data: { user: updatedUser },
        });
    } catch (err) {
        next(err);
    }
};

// ─── Upload Cover Photo ───────────────────────────────────────────────────────
/**
 * Upload user cover image to Supabase Storage
 * Expects: { coverUrl: string } (base64 data URI or direct URL)
 */
const uploadCover = async (req, res, next) => {
    try {
        const { coverUrl } = req.body;
        if (!coverUrl) throw new ApiError('Vui lòng cung cấp ảnh bìa.', 400);

        let finalCoverUrl = coverUrl;
        if (coverUrl.startsWith('data:')) {
            const matches = coverUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (!matches) throw new ApiError('Định dạng ảnh không hợp lệ.', 400);

            const [, mimeType, base64Data] = matches;
            const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedMimes.includes(mimeType)) {
                throw new ApiError('Chỉ hỗ trợ JPEG, PNG, WebP.', 400);
            }

            const buffer = Buffer.from(base64Data, 'base64');
            if (buffer.length > 5 * 1024 * 1024) {
                throw new ApiError('Ảnh không được vượt quá 5MB.', 400);
            }

            const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/webp' ? 'webp' : 'png';
            const filepath = `${req.user.id}/cover.${ext}`;

            const { error } = await supabaseAdmin.storage
                .from('user_avatars')
                .upload(filepath, buffer, {
                    contentType: mimeType,
                    upsert: true,
                });

            if (error) {
                logger.error('Cover upload error:', error);
                throw new ApiError('Không thể tải ảnh bìa lên. Vui lòng thử lại.', 500);
            }

            const { data: publicData } = supabaseAdmin.storage
                .from('user_avatars')
                .getPublicUrl(filepath);

            finalCoverUrl = publicData.publicUrl;
        }

        const updatedUser = await UserModel.update(req.user.id, { cover_url: finalCoverUrl });
        logger.info(`Cover uploaded for user: ${req.user.id}`);

        res.json({
            success: true,
            message: 'Ảnh bìa đã được cập nhật.',
            data: { user: updatedUser },
        });
    } catch (err) {
        next(err);
    }
};

// ─── Admin: Get All Users ─────────────────────────────────────────────────────
/**
 * Get all users (for admin dashboard)
 */
const getUsers = async (req, res, next) => {
    try {
        const { limit = 50, offset = 0, role = 'all', status = 'all' } = req.query;
        
        // Build query
        let query = supabaseAdmin
            .from('users')
            .select('id, full_name, email, phone, role, is_active, avatar_url, created_at, last_login', { count: 'exact' });

        // Exclude admin and moderator accounts
        query = query.not('role', 'in', '(admin,moderator)');

        // Filter by role
        if (role && role !== 'all') {
            query = query.eq('role', role);
        }

        // Filter by status
        if (status && status !== 'all') {
            if (status === 'active') {
                query = query.neq('last_login', null);
            } else if (status === 'inactive') {
                query = query.is('last_login', null);
            }
        }

        // Apply pagination
        const { data: users, error, count } = await query
            .order('created_at', { ascending: false })
            .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

        if (error) {
            logger.error('Error fetching users:', error);
            throw new ApiError('Không thể tải danh sách người dùng.', 500);
        }

        res.json({
            success: true,
            data: users || [],
            pagination: {
                total: count || 0,
                limit: parseInt(limit),
                offset: parseInt(offset),
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── Admin: Toggle User Status ─────────────────────────────────────────────────
/**
 * Toggle user account status (activate/deactivate)
 */
const toggleUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get current user status
        const { data: user, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('id, full_name, email, is_active')
            .eq('id', id)
            .single();

        if (fetchError || !user) {
            throw new ApiError('Không tìm thấy người dùng.', 404);
        }

        // Toggle status
        const newStatus = !user.is_active;
        const { data: updatedUser, error: updateError } = await supabaseAdmin
            .from('users')
            .update({ is_active: newStatus, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            logger.error('Error updating user status:', updateError);
            throw new ApiError('Không thể cập nhật trạng thái người dùng.', 500);
        }

        logger.info(`Admin ${req.user.id} toggled status of user ${id} to ${newStatus}`);

        res.json({
            success: true,
            message: newStatus ? 'Tài khoản đã được kích hoạt.' : 'Tài khoản đã bị khóa.',
            data: updatedUser,
        });
    } catch (err) {
        next(err);
    }
};

// ─── Admin: Delete User ─────────────────────────────────────────────────────
/**
 * Delete user account (admin only)
 */
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        // Don't allow deleting yourself
        if (id === adminId) {
            throw new ApiError('Không thể xóa tài khoản chính mình.', 400);
        }

        // Get user
        const { data: user, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('id, full_name, email, role')
            .eq('id', id)
            .single();

        if (fetchError || !user) {
            throw new ApiError('Không tìm thấy người dùng.', 404);
        }

        // Don't allow deleting other admins
        if (user.role === 'admin') {
            throw new ApiError('Không thể xóa tài khoản quản trị viên.', 403);
        }

        // Delete from KYC table first (if exists)
        await supabaseAdmin
            .from('kyc_verifications')
            .delete()
            .eq('user_id', id);

        // Delete user
        const { error: deleteError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', id);

        if (deleteError) {
            logger.error('Error deleting user:', deleteError);
            throw new ApiError('Không thể xóa người dùng.', 500);
        }

        logger.info(`Admin ${adminId} deleted user ${id} (${user.full_name})`);

        res.json({
            success: true,
            message: `Đã xóa tài khoản của ${user.full_name}.`,
        });
    } catch (err) {
        next(err);
    }
};

// ─── Get Dashboard Stats ──────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get user's properties — properties table uses 'agentid' + 'createdat' (no underscore)
        const { data: properties } = await supabaseAdmin
            .from('properties')
            .select('id, title, status, price, createdat, isapproved, package_expires_at, city, package')
            .eq('agentid', userId)
            .eq('isactive', true)
            .order('createdat', { ascending: false });

        // Get user's collaborations
        const { data: collaborations } = await supabaseAdmin
            .from('collaborations')
            .select('*')
            .or(`agent_id.eq.${userId},user_id.eq.${userId}`);

        // Get recent notifications
        const { data: recentNotifications } = await supabaseAdmin
            .from('notifications')
            .select('id, type, title, body, is_read, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);

        // Get unread notification count
        const { count: unreadCount } = await supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        // Calculate stats using correct fields
        const now = new Date();
        const totalProperties = properties?.length || 0;
        const activeProperties = properties?.filter(p => {
            if (p.package && p.package !== 'free' && p.package_expires_at) {
                return new Date(p.package_expires_at) > now;
            }
            return p.isapproved === true;
        }).length || 0;
        const propertyStats = {
            approved: activeProperties,
            pending: properties?.filter(p => p.isapproved === false || p.isapproved === null).length || 0,
            expired: properties?.filter(p => p.package_expires_at && new Date(p.package_expires_at) < now).length || 0,
        };
        const totalSpent = 0;

        // Get last 7 days chart data (using createdat field)
        const last7DaysChart = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = properties?.filter(p => {
                if (!p.createdat) return false;
                return new Date(p.createdat).toISOString().split('T')[0] === dateStr;
            }).length || 0;
            last7DaysChart.push({ date: dateStr, count });
        }

        // Get last 30 days payment data — payments use user_id
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        const { data: paymentsData } = await supabaseAdmin
            .from('payments')
            .select('amount, created_at, package_type, status')
            .eq('user_id', userId)
            .eq('status', 'success')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: true });

        // Build last 30 days payment chart (amount per day)
        const last30DaysPayments = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayPayments = paymentsData?.filter(p =>
                new Date(p.created_at).toISOString().split('T')[0] === dateStr
            ) || [];
            const totalAmount = dayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            last30DaysPayments.push({ date: dateStr, amount: totalAmount, count: dayPayments.length });
        }

        // Get last 30 days commission data — only 'sold', calculate VND from price x commission_rate
        const { data: commissionsData } = await supabaseAdmin
            .from('collaborations')
            .select('commission_rate, created_at, status, property:property_id(price)')
            .eq('agent_id', userId)
            .eq('status', 'sold')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: true });

        // Build last 30 days commission chart (VND per day)
        const last30DaysCommissions = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayCollabs = commissionsData?.filter(c =>
                new Date(c.created_at).toISOString().split('T')[0] === dateStr
            ) || [];
            const totalAmount = dayCollabs.reduce((sum, c) => {
                const price = c.property?.price || 0;
                const rate = c.commission_rate || 0;
                return sum + (price * rate / 100);
            }, 0);
            last30DaysCommissions.push({ date: dateStr, amount: totalAmount, count: dayCollabs.length });
        }

        // All-time totals for profit card = hoa hong - phi dang tin
        const { data: allPayments } = await supabaseAdmin
            .from('payments')
            .select('amount')
            .eq('user_id', userId)
            .eq('status', 'success');
        const totalFeesPaid = allPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

        const { data: allSoldCollabs } = await supabaseAdmin
            .from('collaborations')
            .select('commission_rate, property:property_id(price)')
            .eq('agent_id', userId)
            .eq('status', 'sold');
        const totalCommissionEarned = allSoldCollabs?.reduce((sum, c) => {
            const price = c.property?.price || 0;
            const rate = c.commission_rate || 0;
            return sum + (price * rate / 100);
        }, 0) || 0;

        res.json({
            success: true,
            data: {
                totalProperties,
                activeProperties,
                totalSpent,
                totalFeesPaid,
                totalCommissionEarned,
                propertyStats,
                last7DaysChart,
                last30DaysPayments,
                last30DaysCommissions,
                recentProperties: properties?.slice(0, 5) || [],
                recentNotifications: recentNotifications || [],
                unreadCount: unreadCount || 0,
                collaborationCount: collaborations?.length || 0,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── Update Settings ──────────────────────────────────────────────────────────
const updateSettings = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { notifications, privacy } = req.body;

        // In this example, we just return success
        // Settings are stored in localStorage on frontend
        // To persist them, you'd need to add a settings table

        res.json({
            success: true,
            message: 'Cài đặt đã được lưu thành công.',
            data: {
                notifications,
                privacy,
            },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    register, verifyEmail, login, login2FA, refreshToken, logout,
    forgotPassword, resetPassword, verify2FA, resendVerification, getMe, uploadAvatar,
    uploadCover, updateProfile, getAgents, getAgentById, getUsers, toggleUserStatus, deleteUser,
    setupTOTP2FA, confirmTOTP2FA, disable2FA, get2FAStatus, regenerateBackupCodes,
    getDashboardStats, updateSettings,
};
