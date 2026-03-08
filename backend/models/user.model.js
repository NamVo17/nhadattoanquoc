'use strict';

const { supabaseAdmin } = require('../config/db.config');
const { ApiError } = require('../middleware/error.middleware');

/**
 * SQL for the `users` table – run this once in Supabase SQL editor
 *
 * CREATE TABLE public.users (
 *   id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   full_name        TEXT NOT NULL,
 *   email            TEXT NOT NULL UNIQUE,
 *   phone            TEXT NOT NULL UNIQUE,
 *   password_hash    TEXT NOT NULL,
 *   role             TEXT NOT NULL DEFAULT 'user'
 *                    CHECK (role IN ('user', 'agent', 'moderator', 'admin')),
 *   avatar_url       TEXT,
 *   cover_url        TEXT,
 *   is_active        BOOLEAN NOT NULL DEFAULT true,
 *   is_email_verified BOOLEAN NOT NULL DEFAULT false,
 *   totp_secret      TEXT,
 *   is_2fa_enabled   BOOLEAN NOT NULL DEFAULT false,
 *   email_verify_token TEXT,
 *   email_verify_expires TIMESTAMPTZ,
 *   refresh_token_hash TEXT,
 *   password_reset_token TEXT,
 *   password_reset_expires TIMESTAMPTZ,
 *   -- Profile fields (added via migration):
 *   title            TEXT,
 *   license_code     TEXT,
 *   join_year        TEXT,
 *   experience       TEXT,
 *   success_deals    TEXT,
 *   bio              TEXT,
 *   areas            TEXT[],
 *   property_types   TEXT[],
 *   facebook         TEXT,
 *   zalo             TEXT,
 *   address          TEXT,
 *   created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
 *   updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
 * );
 *
 * -- Migration: add profile columns (run once in Supabase SQL editor)
 * ALTER TABLE public.users
 *   ADD COLUMN IF NOT EXISTS title           TEXT,
 *   ADD COLUMN IF NOT EXISTS license_code    TEXT,
 *   ADD COLUMN IF NOT EXISTS join_year       TEXT,
 *   ADD COLUMN IF NOT EXISTS experience      TEXT,
 *   ADD COLUMN IF NOT EXISTS success_deals   TEXT,
 *   ADD COLUMN IF NOT EXISTS bio             TEXT,
 *   ADD COLUMN IF NOT EXISTS areas           TEXT[],
 *   ADD COLUMN IF NOT EXISTS property_types  TEXT[],
 *   ADD COLUMN IF NOT EXISTS facebook        TEXT,
 *   ADD COLUMN IF NOT EXISTS zalo            TEXT,
 *   ADD COLUMN IF NOT EXISTS address         TEXT,
 *   ADD COLUMN IF NOT EXISTS cover_url       TEXT;
 */

// Only select fields that actually exist in the users table
const SAFE_FIELDS =
    'id, full_name, email, phone, role, avatar_url, cover_url, is_active, is_email_verified, is_2fa_enabled, ' +
    'title, license_code, join_year, experience, success_deals, bio, areas, property_types, facebook, zalo, address, ' +
    'created_at, updated_at';

// Fields exposed on public agent pages
const AGENT_PUBLIC_FIELDS =
    'id, full_name, email, phone, avatar_url, cover_url, role, title, license_code, join_year, experience, ' +
    'success_deals, bio, areas, property_types, facebook, zalo, address, is_active, created_at, updated_at';

const UserModel = {
    /**
     * Find user by ID – returns safe public fields
     */
    findById: async (id) => {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select(SAFE_FIELDS)
            .eq('id', id)
            .single();
        if (error) throw new ApiError('Không tìm thấy người dùng.', 404);
        return data;
    },

    /**
     * Find user by email – includes sensitive fields for auth
     */
    findByEmailForAuth: async (email) => {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .single();
        if (error) return null;
        return data;
    },

    /**
     * Create a new user – returns safe fields only
     */
    create: async ({ fullName, email, phone, passwordHash, role = 'user', emailVerifyToken, emailVerifyExpires }) => {
        const { data, error } = await supabaseAdmin
            .from('users')
            .insert({
                full_name: fullName,
                email: email.toLowerCase().trim(),
                phone: phone.trim(),
                password_hash: passwordHash,
                role,
                email_verify_token: emailVerifyToken,
                email_verify_expires: emailVerifyExpires,
            })
            .select(SAFE_FIELDS)
            .single();

        if (error) {
            if (error.code === '23505') {
                const field = error.detail?.includes('email') ? 'email' : 'phone';
                throw new ApiError(`${field === 'email' ? 'Email' : 'Số điện thoại'} đã được sử dụng.`, 409);
            }
            throw new ApiError('Không thể tạo tài khoản.', 500);
        }
        return data;
    },

    /**
     * Update arbitrary fields for a user
     */
    update: async (id, fields) => {
        const { data, error } = await supabaseAdmin
            .from('users')
            .update(fields)
            .eq('id', id)
            .select(SAFE_FIELDS)
            .single();
        if (error) {
            console.error('User update error:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                userId: id,
                fieldsAttempted: Object.keys(fields),
            });
            throw new ApiError(`Cập nhật thất bại: ${error.message || 'Unknown error'}`, 500);
        }
        return data;
    },

    findByVerifyToken: async (token) => {
        const { data } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email_verify_token', token)
            .single();
        return data || null;
    },

    findByResetToken: async (token) => {
        const { data } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('password_reset_token', token)
            .single();
        return data || null;
    },

    /**
     * Get all users with role = 'agent' (for the Cộng tác viên page)
     */
    findAgents: async ({ search = '', limit = 50, offset = 0 } = {}) => {
        let query = supabaseAdmin
            .from('users')
            .select(AGENT_PUBLIC_FIELDS)
            .eq('role', 'agent')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (search) {
            query = query.ilike('full_name', `%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw new ApiError('Không thể tải danh sách cộng tác viên.', 500);
        return data || [];
    },

    /**
     * Get a single agent by full name (for public profile URL)
     */
    findAgentByFullName: async (fullName) => {
        const { data: agent, error } = await supabaseAdmin
            .from('users')
            .select(AGENT_PUBLIC_FIELDS)
            .eq('full_name', fullName.trim())
            .eq('role', 'agent')
            .single();
        if (error || !agent) throw new ApiError('Không tìm thấy cộng tác viên.', 404);
        return agent;
    },
};

module.exports = UserModel;
