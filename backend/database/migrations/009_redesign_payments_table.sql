-- Redesign payments table for MoMo and VNPay integration
-- This migration updates the payments table to support online payment gateways
-- Drop existing table if it exists (to recreate with new structure)
DROP TABLE IF EXISTS public.payments CASCADE;
-- Create the new payments table with proper structure
CREATE TABLE public.payments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    property_id uuid NOT NULL,
    -- Payment amount (in VND)
    amount bigint NOT NULL,
    -- Payment method: momo | vnpay
    method text NOT NULL CHECK (method IN ('momo', 'vnpay')),
    -- Payment status: pending | processing | success | failed | cancelled
    status text NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'processing',
            'success',
            'failed',
            'cancelled'
        )
    ),
    -- Transaction identifiers
    order_id text NOT NULL UNIQUE,
    transaction_id text,
    request_id text,
    -- Package info
    package_type text NOT NULL CHECK (package_type IN ('vip', 'diamond')),
    -- Metadata for signature verification
    payment_data jsonb,
    signature text,
    -- Package expiry details
    package_expires_at timestamp with time zone,
    -- Timestamps
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    completed_at timestamp with time zone,
    CONSTRAINT payments_pkey PRIMARY KEY (id),
    CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
    CONSTRAINT payments_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id)
);
-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_property_id ON public.payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);
-- Add package expiry tracking columns to properties table if not exists
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS package_expires_at timestamp with time zone,
    ADD COLUMN IF NOT EXISTS payment_status text DEFAULT NULL;