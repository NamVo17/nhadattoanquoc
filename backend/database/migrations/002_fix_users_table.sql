-- ======================================================================
-- MIGRATION: Fix Users Table - Ensure All Required Columns Exist
-- ======================================================================
-- Run this in Supabase SQL Editor if you're getting "update failed" errors
-- This will add any missing columns to the users table
-- Step 1: Add avatar_url column if it doesn't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;
-- Step 2: Verify refresh_token_hash exists (it should from original schema)
-- If you see an error "column refresh_token_hash does not exist", uncomment:
-- ALTER TABLE public.users
-- ADD COLUMN IF NOT EXISTS refresh_token_hash TEXT DEFAULT NULL;
-- Step 3: Check what columns currently exist
-- Run this query to verify column names match what backend expects:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'users' AND table_schema = 'public'
-- ORDER BY ordinal_position;
-- Step 4: If you're still getting errors, paste the output of Step 3
-- and we can fix the column names in the backend code
-- Step 5: Test that updates work
-- UPDATE public.users 
-- SET avatar_url = 'test', refresh_token_hash = 'test_hash'
-- WHERE id = (SELECT id FROM public.users LIMIT 1);
-- Step 6: If the update works, the table is fixed!
-- Go back and try logging in again
-- ======================================================================
-- Backup: If you need to see ALL table info:
-- ======================================================================
/*
 SELECT 
 c.column_name, 
 c.data_type, 
 c.is_nullable,
 c.column_default
 FROM information_schema.columns c
 WHERE c.table_name = 'users' AND c.table_schema = 'public'
 ORDER BY c.ordinal_position;
 */