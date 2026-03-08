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

        if (user.is_2fa_enabled) {
            if (!totpCode) throw new ApiError('Vui lòng nhập mã xác thực 2 lớp.', 400);
            const valid = speakeasy.totp.verify({
                secret: user.totp_secret,
                encoding: 'base32',
                token: totpCode,
                window: 1,
            });
            if (!valid) throw new ApiError('Mã xác thực 2 lớp không hợp lệ.', 401);
        }

        const accessToken = signAccessToken(user.id, user.role);
        const refreshToken = signRefreshToken(user.id);
        await UserModel.update(user.id, { refresh_token_hash: hashToken(refreshToken) });
        setRefreshCookie(res, refreshToken);

        logger.info(`User logged in: ${user.email}`);

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
                    coverUrl: user.cover_url,
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
        if (req.user) await UserModel.update(req.user.id, { refresh_token_hash: null });
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

// ─── Kích hoạt 2FA ───────────────────────────────────────────────────────────
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
             title, licenseCode, joinYear, experience, successDeals, bio,
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

                const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/webp' ? 'webp' : 'png';
                const filepath = `${req.user.id}/avatar.${ext}`;

                const { data, error } = await supabaseAdmin.storage
                    .from('user_avatars')
                    .upload(filepath, buffer, {
                        contentType: mimeType,
                        upsert: true,
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
            try {
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
            } catch (err) {
                if (err instanceof ApiError) throw err;
                throw new ApiError('Lỗi xử lý ảnh bìa: ' + err.message, 400);
            }
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

module.exports = {
    register, verifyEmail, login, refreshToken, logout,
    forgotPassword, resetPassword, verify2FA, resendVerification, getMe, uploadAvatar, uploadCover,
    updateProfile, getAgents, getAgentById,
};
