-- Update handle_new_user to detect barber signups from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  new_referral_code TEXT;
  signup_account_type TEXT;
  is_barber BOOLEAN;
BEGIN
  -- Generate unique referral code
  new_referral_code := UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8));
  
  -- Detect account type from signup metadata (defaults to 'client')
  signup_account_type := COALESCE(new.raw_user_meta_data ->> 'account_type', 'client');
  is_barber := signup_account_type = 'barber';
  
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
  
  -- Create account role based on signup type
  -- Barbers: account_type='barber', matrix_percent=5, barber_verified=false
  -- Clients: account_type='client', matrix_percent=2.5
  INSERT INTO public.account_roles (
    user_id, 
    account_type, 
    matrix_percent, 
    matching_l1_percent, 
    matching_l2_percent,
    barber_verified,
    sponsor_id
  )
  VALUES (
    new.id, 
    CASE WHEN is_barber THEN 'barber'::account_type ELSE 'client'::account_type END,
    CASE WHEN is_barber THEN 5 ELSE 2.5 END,
    10, 
    5,
    false,
    (SELECT id FROM public.profiles WHERE referral_code = new.raw_user_meta_data ->> 'referral_code' LIMIT 1)
  );
  
  RETURN new;
END;
$$;