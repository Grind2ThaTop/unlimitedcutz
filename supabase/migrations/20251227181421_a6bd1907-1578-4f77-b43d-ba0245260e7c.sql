-- Add PAM tracking columns to member_ranks
ALTER TABLE public.member_ranks 
ADD COLUMN IF NOT EXISTS personal_active_directs integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS pam_has_silver boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS pam_has_gold boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS pam_has_platinum boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS pam_has_diamond boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS max_paid_level integer NOT NULL DEFAULT 4,
ADD COLUMN IF NOT EXISTS commission_rate numeric NOT NULL DEFAULT 5.0;

-- Add barber level unlocks setting
INSERT INTO public.app_settings (key, value)
VALUES ('barber_level_unlocks', '{"bronze": 4, "silver": 5, "gold": 6, "platinum": 6, "diamond": 6}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Update existing barber member_ranks with correct defaults
UPDATE public.member_ranks mr
SET 
  max_paid_level = CASE 
    WHEN mr.current_rank = 'bronze' THEN 4
    WHEN mr.current_rank = 'silver' THEN 5
    ELSE 6
  END,
  commission_rate = CASE 
    WHEN mr.current_rank = 'platinum' OR mr.current_rank = 'diamond' THEN 7.0
    ELSE 5.0
  END
WHERE EXISTS (
  SELECT 1 FROM public.account_roles ar 
  WHERE ar.user_id = mr.user_id AND ar.account_type = 'barber'
);