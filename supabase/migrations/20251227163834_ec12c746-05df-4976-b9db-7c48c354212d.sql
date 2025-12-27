-- Phase 1: Database Schema Updates for Barber Module

-- 1.1 Add barber_verified and sponsor_id to account_roles
ALTER TABLE public.account_roles 
ADD COLUMN IF NOT EXISTS barber_verified boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS sponsor_id uuid REFERENCES auth.users(id);

-- Add index for sponsor lookups
CREATE INDEX IF NOT EXISTS idx_account_roles_sponsor_id ON public.account_roles(sponsor_id);

-- 1.2 Add new commission types to the enum
ALTER TYPE public.commission_type ADD VALUE IF NOT EXISTS 'enrollment_residual';
ALTER TYPE public.commission_type ADD VALUE IF NOT EXISTS 'pool_payout';
ALTER TYPE public.commission_type ADD VALUE IF NOT EXISTS 'fee_charge';
ALTER TYPE public.commission_type ADD VALUE IF NOT EXISTS 'fee_waiver';

-- 1.3 Create membership_cuts table for tracking barber cuts
CREATE TABLE IF NOT EXISTS public.membership_cuts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES auth.users(id),
  client_id uuid NOT NULL REFERENCES auth.users(id),
  membership_id uuid NOT NULL REFERENCES public.memberships(id),
  cut_date timestamptz NOT NULL DEFAULT now(),
  is_membership_cut boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on membership_cuts
ALTER TABLE public.membership_cuts ENABLE ROW LEVEL SECURITY;

-- Barbers can view their own cuts
CREATE POLICY "Barbers can view their own cuts"
ON public.membership_cuts
FOR SELECT
USING (auth.uid() = barber_id);

-- Barbers can create cuts
CREATE POLICY "Barbers can create cuts"
ON public.membership_cuts
FOR INSERT
WITH CHECK (auth.uid() = barber_id);

-- Admins can manage all cuts
CREATE POLICY "Admins can manage all membership cuts"
ON public.membership_cuts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for membership_cuts
CREATE INDEX IF NOT EXISTS idx_membership_cuts_barber_id ON public.membership_cuts(barber_id);
CREATE INDEX IF NOT EXISTS idx_membership_cuts_client_id ON public.membership_cuts(client_id);
CREATE INDEX IF NOT EXISTS idx_membership_cuts_cut_date ON public.membership_cuts(cut_date);

-- 1.4 Create barber_pool table for tracking pool/kitty
CREATE TABLE IF NOT EXISTS public.barber_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_contributions numeric NOT NULL DEFAULT 0,
  total_cuts integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'calculating', 'paid')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on barber_pool
ALTER TABLE public.barber_pool ENABLE ROW LEVEL SECURITY;

-- Anyone can view pool info
CREATE POLICY "Authenticated users can view pool"
ON public.barber_pool
FOR SELECT
TO authenticated
USING (true);

-- Admins can manage pool
CREATE POLICY "Admins can manage barber pool"
ON public.barber_pool
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 1.5 Create barber_pool_payouts table to track individual payouts
CREATE TABLE IF NOT EXISTS public.barber_pool_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES public.barber_pool(id),
  barber_id uuid NOT NULL REFERENCES auth.users(id),
  cuts_count integer NOT NULL DEFAULT 0,
  payout_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on barber_pool_payouts
ALTER TABLE public.barber_pool_payouts ENABLE ROW LEVEL SECURITY;

-- Barbers can view their own payouts
CREATE POLICY "Barbers can view their own pool payouts"
ON public.barber_pool_payouts
FOR SELECT
USING (auth.uid() = barber_id);

-- Admins can manage pool payouts
CREATE POLICY "Admins can manage pool payouts"
ON public.barber_pool_payouts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for barber pool payouts
CREATE INDEX IF NOT EXISTS idx_barber_pool_payouts_barber_id ON public.barber_pool_payouts(barber_id);

-- 1.6 Insert barber_settings into app_settings
INSERT INTO public.app_settings (key, value)
VALUES (
  'barber_settings',
  '{
    "barber_fee_amount": 100,
    "pool_contribution_per_member": 10,
    "enrollment_residual_percent": 50,
    "pool_distribution_mode": "proportional",
    "fee_waiver_enabled": true,
    "waiver_conditions": {
      "new_enrollments_per_week": 2,
      "membership_cuts_per_week": 10,
      "min_active_enrolled_members": 5
    }
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- Update trigger for barber_pool
CREATE TRIGGER update_barber_pool_updated_at
BEFORE UPDATE ON public.barber_pool
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();