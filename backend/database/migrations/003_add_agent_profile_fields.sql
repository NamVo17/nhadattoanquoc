-- ======================================================================
-- MIGRATION: Add Agent Profile Fields to Users Table
-- ======================================================================
-- This migration adds all agent-specific profile fields that the backend expects
-- Run this in Supabase SQL Editor to fix the "column does not exist" errors
-- ======================================================================
-- Agent Profile Fields
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE DEFAULT NULL;
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS title TEXT DEFAULT NULL;
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS license_code TEXT DEFAULT NULL;
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS join_year TEXT DEFAULT NULL;
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT NULL;
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS success_deals TEXT DEFAULT NULL;
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS areas TEXT [] DEFAULT NULL;
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS property_types TEXT [] DEFAULT NULL;
-- Add indexes for username lookup (agents page uses this)
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);
-- Success! The users table now has all required columns for both regular users and agents.
-- You can now:
-- 1. Login to your application
-- 2. View the agents page (/agents)
-- 3. Update agent profiles with additional fields