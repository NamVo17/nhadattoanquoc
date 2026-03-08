-- ============================================================
-- NhaDatToanQuoc – Supabase Database Schema
-- Chạy toàn bộ file này trong Supabase SQL Editor (một lần)
-- ============================================================
-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- ── ENUM: role ────────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('user', 'agent', 'moderator', 'admin');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
-- ── Bảng users ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (
    char_length(full_name) BETWEEN 2 AND 100
  ),
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  -- User profile picture URL
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_email_verified BOOLEAN NOT NULL DEFAULT false,
  -- 2FA (TOTP)
  totp_secret TEXT,
  is_2fa_enabled BOOLEAN NOT NULL DEFAULT false,
  -- Email verification
  email_verify_token TEXT,
  email_verify_expires TIMESTAMPTZ,
  -- Refresh token (lưu hash SHA-256, không lưu raw)
  refresh_token_hash TEXT,
  -- Password reset
  password_reset_token TEXT,
  password_reset_expires TIMESTAMPTZ,
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Index để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users (phone);
CREATE INDEX IF NOT EXISTS idx_users_email_verify_token ON public.users (email_verify_token);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON public.users (password_reset_token);
-- ── Trigger: tự cập nhật updated_at ─────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at BEFORE
UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- ── Row Level Security (RLS) ─────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- Xóa policy cũ nếu tồn tại
DROP POLICY IF EXISTS "users_select_self" ON public.users;
DROP POLICY IF EXISTS "users_update_self" ON public.users;
DROP POLICY IF EXISTS "admin_full_access" ON public.users;
-- Người dùng chỉ đọc/sửa row của chính mình
CREATE POLICY "users_select_self" ON public.users FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_self" ON public.users FOR
UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- Admin có toàn quyền
CREATE POLICY "admin_full_access" ON public.users FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role = 'admin'
  )
);
-- ============================================================
-- Bảng refresh_tokens (optional – nếu muốn multi-device)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  device_info TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON public.refresh_tokens (user_id);
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "refresh_tokens_self" ON public.refresh_tokens;
CREATE POLICY "refresh_tokens_self" ON public.refresh_tokens FOR ALL USING (auth.uid() = user_id);
-- ============================================================
-- Bảng pending_registrations
-- Lưu đăng ký TẠM THỜI, chỉ tạo user thật sau khi xác thực email
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  enable_2fa BOOLEAN NOT NULL DEFAULT false,
  verify_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pending_verify_token ON public.pending_registrations (verify_token);
CREATE INDEX IF NOT EXISTS idx_pending_email ON public.pending_registrations (email);
-- Tự xoá các pending hết hạn (chạy mỗi ngày qua pg_cron nếu muốn)
-- DELETE FROM public.pending_registrations WHERE expires_at < now();
-- ============================================================
-- Bảng properties (bất động sản)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (
    char_length(title) BETWEEN 10 AND 99
  ),
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL CHECK (char_length(description) >= 50),
  price BIGINT NOT NULL CHECK (price >= 0),
  area DECIMAL(10, 2) NOT NULL CHECK (area > 0),
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN (
      'apartment',
      'house',
      'villa',
      'land',
      'commercial'
    )
  ),
  status TEXT NOT NULL DEFAULT 'for-sale' CHECK (status IN ('for-sale', 'for-rent', 'sold')),
  images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  commission DECIMAL(5, 2) DEFAULT 1.00 CHECK (
    commission >= 0
    AND commission <= 100
  ),
  package TEXT NOT NULL DEFAULT 'free' CHECK (package IN ('free', 'vip', 'diamond')),
  agent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_name TEXT,
  bedrooms INTEGER CHECK (bedrooms >= 0),
  bathrooms INTEGER CHECK (bathrooms >= 0),
  floors INTEGER CHECK (floors >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Indexes for properties
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties (slug);
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON public.properties (agentId);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties (type);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties (city);
CREATE INDEX IF NOT EXISTS idx_properties_district ON public.properties (district);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties (price);
CREATE INDEX IF NOT EXISTS idx_properties_area ON public.properties (area);
CREATE INDEX IF NOT EXISTS idx_properties_is_active ON public.properties (isActive);
CREATE INDEX IF NOT EXISTS idx_properties_is_approved ON public.properties (isApproved);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties (createdAt);
-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at_properties ON public.properties;
CREATE TRIGGER set_updated_at_properties BEFORE
UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- Row Level Security for properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
-- Policies for properties
DROP POLICY IF EXISTS "properties_public_read_approved" ON public.properties;
DROP POLICY IF EXISTS "agents_manage_own_properties" ON public.properties;
DROP POLICY IF EXISTS "admin_full_access_properties" ON public.properties;
-- Public can read approved properties
CREATE POLICY "properties_public_read_approved" ON public.properties FOR
SELECT USING (
    isActive = true
    AND isApproved = true
  );
-- Agents can manage their own properties
CREATE POLICY "agents_manage_own_properties" ON public.properties FOR ALL USING (
  auth.uid() = agentId
  AND EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role IN ('agent', 'admin')
  )
);
-- Admin full access
CREATE POLICY "admin_full_access_properties" ON public.properties FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);
-- ============================================================
-- Function to increment view count
-- ============================================================
CREATE OR REPLACE FUNCTION increment_view_count(property_id UUID) RETURNS void LANGUAGE plpgsql AS $$ BEGIN
UPDATE public.properties
SET view_count = view_count + 1
WHERE id = property_id;
END;
$$;
INSERT INTO public.users (
    full_name,
    email,
    phone,
    password_hash,
    role,
    is_active,
    is_email_verified
  )
VALUES (
    'Super Admin',
    'admin@nhadattoanquoc.vn',
    '0900000000',
    '$2b$12$GPtCbtTv5KuQ0sZ3kmwhTedSdCFRneLHU./fg4kAZWr06ukSyWcgu',
    -- RyanVo@admin1701
    'admin',
    true,
    true
  ) ON CONFLICT (email) DO NOTHING;
-- ============================================================
-- Xác nhận kết quả
-- ============================================================
SELECT 'Schema created successfully ✅' AS status;
SELECT COUNT(*) AS total_users
FROM public.users;