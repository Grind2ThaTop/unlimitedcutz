-- Add personal downline count columns for rank qualification
ALTER TABLE public.member_ranks 
  ADD COLUMN IF NOT EXISTS personal_downline_bronze_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS personal_downline_silver_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS personal_downline_gold_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS personal_downline_platinum_count integer NOT NULL DEFAULT 0;

-- Add index for performance on rank evaluation queries
CREATE INDEX IF NOT EXISTS idx_member_ranks_personal_downline ON public.member_ranks(
  personal_downline_bronze_count, 
  personal_downline_silver_count, 
  personal_downline_gold_count, 
  personal_downline_platinum_count
);