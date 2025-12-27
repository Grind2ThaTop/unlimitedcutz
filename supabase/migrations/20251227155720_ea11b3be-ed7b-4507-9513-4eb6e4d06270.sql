-- First, update member_rank enum values
-- Rename existing values to new rank names
ALTER TYPE public.member_rank RENAME VALUE 'rookie' TO 'bronze';
ALTER TYPE public.member_rank RENAME VALUE 'hustla' TO 'silver';
ALTER TYPE public.member_rank RENAME VALUE 'grinder' TO 'gold';
ALTER TYPE public.member_rank RENAME VALUE 'influencer' TO 'platinum';
ALTER TYPE public.member_rank RENAME VALUE 'executive' TO 'diamond';

-- Remove 'partner' value (we only need 5 ranks now)
-- Since we can't easily remove enum values, we'll leave it but not use it

-- Add qualification tracking columns to member_ranks table
ALTER TABLE public.member_ranks 
ADD COLUMN IF NOT EXISTS active_bronze_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_silver_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_gold_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_platinum_count integer NOT NULL DEFAULT 0;

-- Add comment explaining the new rank system
COMMENT ON TABLE public.member_ranks IS 'Tracks member ranks with commission depth unlocking. BRONZE=L1-3, SILVER=L1-4, GOLD=L1-5, PLATINUM=L1-6, DIAMOND=L1-8';