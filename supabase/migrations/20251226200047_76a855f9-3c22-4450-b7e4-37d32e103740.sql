-- Create placement_source enum type
CREATE TYPE public.placement_source AS ENUM ('direct_signup', 'spillover', 'admin_placement');

-- Add new columns to matrix_nodes for bulletproof tracking
ALTER TABLE public.matrix_nodes 
ADD COLUMN IF NOT EXISTS position_index integer,
ADD COLUMN IF NOT EXISTS placement_source public.placement_source DEFAULT 'direct_signup'::public.placement_source,
ADD COLUMN IF NOT EXISTS placed_at timestamp with time zone DEFAULT now();

-- Add unique constraint on position_index to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS matrix_nodes_position_index_unique ON public.matrix_nodes (position_index) WHERE position_index IS NOT NULL;

-- Create placement_logs table for detailed audit trail
CREATE TABLE IF NOT EXISTS public.placement_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  matrix_node_id uuid NOT NULL REFERENCES public.matrix_nodes(id),
  user_id uuid NOT NULL,
  placed_under_user_id uuid,
  sponsor_id uuid,
  level integer NOT NULL,
  position integer,
  position_index integer NOT NULL,
  placement_source public.placement_source NOT NULL,
  checks_passed jsonb NOT NULL DEFAULT '{}',
  related_events jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on placement_logs
ALTER TABLE public.placement_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for placement_logs
CREATE POLICY "Admins can manage all placement logs"
  ON public.placement_logs
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own placement logs"
  ON public.placement_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS placement_logs_user_id_idx ON public.placement_logs(user_id);
CREATE INDEX IF NOT EXISTS placement_logs_matrix_node_id_idx ON public.placement_logs(matrix_node_id);
CREATE INDEX IF NOT EXISTS matrix_nodes_position_index_idx ON public.matrix_nodes(position_index);