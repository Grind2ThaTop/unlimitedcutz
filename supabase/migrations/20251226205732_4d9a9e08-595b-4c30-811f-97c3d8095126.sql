-- Create account_type enum
CREATE TYPE account_type AS ENUM ('client', 'barber');

-- Create account_roles table
CREATE TABLE public.account_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  account_type account_type NOT NULL DEFAULT 'client',
  matrix_percent numeric NOT NULL DEFAULT 2.5,
  matching_l1_percent numeric NOT NULL DEFAULT 10,
  matching_l2_percent numeric NOT NULL DEFAULT 5,
  upgraded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.account_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own account role"
ON public.account_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all account roles"
ON public.account_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_account_roles_updated_at
BEFORE UPDATE ON public.account_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user function to create account_role for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_referral_code TEXT;
BEGIN
  -- Generate unique referral code
  new_referral_code := UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8));
  
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, referral_code, referred_by)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new_referral_code,
    (SELECT id FROM public.profiles WHERE referral_code = new.raw_user_meta_data ->> 'referral_code' LIMIT 1)
  );
  
  -- Assign default member role
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'member');
  
  -- Create account role (default to client with 2.5% matrix, 10%/5% matching)
  INSERT INTO public.account_roles (user_id, account_type, matrix_percent, matching_l1_percent, matching_l2_percent)
  VALUES (new.id, 'client', 2.5, 10, 5);
  
  RETURN new;
END;
$$;

-- Create account_roles for existing users who don't have one
INSERT INTO public.account_roles (user_id, account_type, matrix_percent, matching_l1_percent, matching_l2_percent)
SELECT p.id, 'client', 2.5, 10, 5
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.account_roles ar WHERE ar.user_id = p.id
);