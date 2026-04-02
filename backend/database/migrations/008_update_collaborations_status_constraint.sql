-- Manual step to update collaborations table constraint
-- Run this if you encounter constraint violations when trying to insert pending-confirmation or sold statuses
-- This is needed after running migration 007
-- Step 1: View current constraints (optional, for verification)
-- SELECT constraint_name FROM information_schema.table_constraints WHERE table_name='collaborations';
-- Step 2: Drop the old CHECK constraint
ALTER TABLE public.collaborations DROP CONSTRAINT IF EXISTS collaborations_status_check;
-- Step 3: Add the new CHECK constraint with additional statuses
ALTER TABLE public.collaborations
ADD CONSTRAINT collaborations_status_check CHECK (
        status = ANY(
            ARRAY ['active'::text, 'inactive'::text, 'completed'::text, 'pending-confirmation'::text, 'sold'::text]
        )
    );