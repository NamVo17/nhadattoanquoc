-- Create collaborations table for property sales representation
CREATE TABLE IF NOT EXISTS public.collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active'::text CHECK (
    status = ANY(ARRAY['active'::text, 'inactive'::text, 'completed'::text])
  ),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  commission_rate NUMERIC NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT collaborations_property_agent_unique UNIQUE(property_id, agent_id)
);

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_collaborations_agent_id ON public.collaborations(agent_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_property_id ON public.collaborations(property_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_status ON public.collaborations(status);
CREATE INDEX IF NOT EXISTS idx_collaborations_agent_status ON public.collaborations(agent_id, status);
