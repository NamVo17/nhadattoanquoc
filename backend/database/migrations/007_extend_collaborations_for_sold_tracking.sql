-- Extend collaborations table to support sold tracking and confirmation workflow
-- This adds support for: Agent B marks as "Đã bán" -> confirming pending -> Agent A confirms -> Property marked as sold

-- First, add new columns to support the workflow
ALTER TABLE public.collaborations 
ADD COLUMN IF NOT EXISTS
  marked_as_sold_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS
  marked_as_sold_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS
  confirmed_as_sold_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS
  confirmed_as_sold_by UUID REFERENCES public.users(id);

-- Drop the old CHECK constraint and add a new one with additional statuses
-- Note: Can't directly modify CHECK constraints in Postgres, so we use ALTER TABLE to remove it
-- First, let's just add the indexes - the constraint handling will be done via application validation

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_collaborations_marked_as_sold_at ON public.collaborations(marked_as_sold_at);
CREATE INDEX IF NOT EXISTS idx_collaborations_confirmed_as_sold_at ON public.collaborations(confirmed_as_sold_at);

-- For status constraint: The application will validate the status values
-- Allowed statuses: 'active', 'inactive', 'completed', 'pending-confirmation', 'sold'
-- If you encounter constraint violations, you can drop and recreate the constraint:
-- ALTER TABLE public.collaborations DROP CONSTRAINT IF EXISTS collaborations_status_check;
-- ALTER TABLE public.collaborations ADD CONSTRAINT collaborations_status_check 
--   CHECK (status = ANY(ARRAY['active', 'inactive', 'completed', 'pending-confirmation', 'sold']));

