-- Create member_rank enum
CREATE TYPE public.member_rank AS ENUM (
  'rookie',
  'hustla',
  'grinder',
  'influencer',
  'executive',
  'partner'
);

-- Create member_ranks table
CREATE TABLE public.member_ranks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  current_rank member_rank NOT NULL DEFAULT 'rookie',
  rank_qualified_at timestamp with time zone DEFAULT now(),
  last_evaluated_at timestamp with time zone DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  personally_enrolled_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create rank_history table for auditing
CREATE TABLE public.rank_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  old_rank member_rank,
  new_rank member_rank NOT NULL,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  reason text
);

-- Enable RLS
ALTER TABLE public.member_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rank_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for member_ranks
CREATE POLICY "Users can view their own rank"
ON public.member_ranks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ranks"
ON public.member_ranks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for rank_history
CREATE POLICY "Users can view their own rank history"
ON public.rank_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage rank history"
ON public.rank_history
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_member_ranks_updated_at
BEFORE UPDATE ON public.member_ranks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();