-- Migration: 011_enhance_2fa_features.sql
-- Adds backup codes, SMS 2FA support, and 2FA setup flags
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS totp_backup_codes TEXT [] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_2fa_totp_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sms_2fa_method TEXT CHECK (sms_2fa_method IN ('none', 'momo', 'sms')),
  ADD COLUMN IF NOT EXISTS sms_2fa_phone TEXT,
  ADD COLUMN IF NOT EXISTS is_2fa_sms_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS two_fa_recovery_codes TEXT [] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_2fa_verification TIMESTAMPTZ;
-- Create index for faster SMS 2FA lookups
CREATE INDEX IF NOT EXISTS idx_users_sms_2fa_phone ON public.users(sms_2fa_phone)
WHERE sms_2fa_phone IS NOT NULL;