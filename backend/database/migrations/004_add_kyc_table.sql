-- Migration: Create KYC verification table
-- This migration adds support for Know Your Customer (KYC) verification
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    -- Identity Information
    id_type TEXT NOT NULL CHECK (id_type IN ('cccd', 'passport', 'license')),
    id_number TEXT NOT NULL,
    id_image_front TEXT,
    id_image_back TEXT,
    -- Personal Information
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    -- Address
    address TEXT,
    city TEXT,
    district TEXT,
    ward TEXT,
    -- Verification Status
    status TEXT NOT NULL DEFAULT 'unverified' CHECK (
        status IN ('unverified', 'pending', 'verified', 'rejected')
    ),
    verification_score NUMERIC DEFAULT 0,
    rejection_reason TEXT,
    -- Metadata
    submitted_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT kyc_verifications_pkey PRIMARY KEY (id),
    CONSTRAINT kyc_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT kyc_verifications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE
    SET NULL
);
-- Add KYC status column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'unverified' CHECK (
        kyc_status IN ('unverified', 'pending', 'verified', 'rejected')
    );
-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON public.kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON public.kyc_verifications(status);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON public.users(kyc_status);