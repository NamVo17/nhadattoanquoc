-- Migration: Add avatar_url column to users table
-- This migration adds support for user profile pictures stored in Supabase Storage
-- Run this once in your Supabase SQL editor if you're upgrading from an older schema
-- Check if column exists before adding (PostgreSQL 9.6+)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
        AND column_name = 'avatar_url'
) THEN
ALTER TABLE public.users
ADD COLUMN avatar_url TEXT DEFAULT NULL;
COMMENT ON COLUMN public.users.avatar_url IS 'User profile picture URL from Supabase Storage or external source';
END IF;
END $$;
-- Create storage bucket for user avatars if it doesn't exist
-- This should be run via Supabase Studio or supabase-js client instead of SQL
-- But documenting the structure here for reference
-- Storage bucket name: user_avatars
-- Policies needed:
-- 1. SELECT: Users can view their own avatar
--    CREATE POLICY "Users can view their own avatar" ON storage.objects
--    FOR SELECT USING (bucket_id = 'user_avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
--    
-- 2. INSERT: Users can upload their own avatar
--    CREATE POLICY "Users can upload their own avatar" ON storage.objects
--    FOR INSERT WITH CHECK (bucket_id = 'user_avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
--    
-- 3. UPDATE: Users can update their own avatar
--    CREATE POLICY "Users can update their own avatar" ON storage.objects
--    FOR UPDATE USING (bucket_id = 'user_avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
--    
-- 4. DELETE: Users can delete their own avatar
--    CREATE POLICY "Users can delete their own avatar" ON storage.objects
--    FOR DELETE USING (bucket_id = 'user_avatars' AND (storage.foldername(name))[1] = auth.uid()::text);