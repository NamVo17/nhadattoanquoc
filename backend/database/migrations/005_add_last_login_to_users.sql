-- Migration: Add last_login column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_last_login ON public.users(last_login DESC);