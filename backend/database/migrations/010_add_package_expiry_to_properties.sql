-- Add package_expires_at column to properties table
-- This tracks when VIP and Diamond packages expire
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS package_expires_at timestamp with time zone;
-- Add renewal_requested flag to track if user is renewing an expired package
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS renewal_requested boolean NOT NULL DEFAULT false;
-- Create index on package_expires_at for faster queries
CREATE INDEX IF NOT EXISTS idx_properties_package_expires_at ON public.properties(package_expires_at);
-- Create index on renewal_requested flag
CREATE INDEX IF NOT EXISTS idx_properties_renewal_requested ON public.properties(renewal_requested);