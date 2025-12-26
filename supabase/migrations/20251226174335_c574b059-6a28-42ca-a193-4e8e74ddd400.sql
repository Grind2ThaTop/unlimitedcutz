-- Add matching_bonus to commission_type enum
ALTER TYPE commission_type ADD VALUE IF NOT EXISTS 'matching_bonus';

-- Add payout fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cashapp_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS paypal_email TEXT;

-- Create payout_requests table
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('cashapp', 'paypal')),
  method_details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on payout_requests
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for payout_requests
CREATE POLICY "Users can view their own payout requests"
ON public.payout_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create payout requests"
ON public.payout_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payout requests"
ON public.payout_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create compensation_settings in app_settings
INSERT INTO public.app_settings (key, value)
VALUES ('compensation_settings', '{
  "fast_start": {
    "level_1": 25,
    "level_2": 10,
    "level_3": 5
  },
  "matrix": {
    "per_placement": 5,
    "max_depth": 7
  },
  "matching": {
    "level_1_percent": 10,
    "level_2_percent": 5
  },
  "minimum_payout": 50
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();