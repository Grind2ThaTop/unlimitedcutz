-- Create role enum for user roles
CREATE TYPE public.app_role AS ENUM ('member', 'admin');

-- Create membership status enum
CREATE TYPE public.membership_status AS ENUM ('active', 'past_due', 'canceled', 'pending');

-- Create commission type enum
CREATE TYPE public.commission_type AS ENUM ('fast_start', 'level_bonus', 'matrix_membership', 'product_commission');

-- Create payout status enum
CREATE TYPE public.payout_status AS ENUM ('pending', 'paid', 'canceled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  UNIQUE (user_id, role)
);

-- Create memberships table
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status membership_status NOT NULL DEFAULT 'pending',
  membership_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  base_amount DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  addon_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create household_members table
CREATE TABLE public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES public.memberships(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  last_visit TIMESTAMP WITH TIME ZONE,
  removed_at TIMESTAMP WITH TIME ZONE,
  slot_locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matrix_nodes table for the 3-wide forced matrix
CREATE TABLE public.matrix_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.matrix_nodes(id),
  sponsor_id UUID REFERENCES auth.users(id), -- Direct referrer
  position INTEGER CHECK (position >= 1 AND position <= 3),
  level INTEGER NOT NULL DEFAULT 1,
  left_child UUID REFERENCES public.matrix_nodes(id),
  middle_child UUID REFERENCES public.matrix_nodes(id),
  right_child UUID REFERENCES public.matrix_nodes(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create commission_events table
CREATE TABLE public.commission_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_user_id UUID REFERENCES auth.users(id),
  commission_type commission_type NOT NULL,
  level INTEGER,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status payout_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  member_price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 5.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_orders table
CREATE TABLE public.product_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.product_orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create waitlist table
CREATE TABLE public.waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  invited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create app_settings table for admin config
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrix_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create has_role function for secure role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Profiles are insertable during signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for memberships
CREATE POLICY "Users can view their own membership" ON public.memberships
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership" ON public.memberships
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all memberships" ON public.memberships
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for household_members
CREATE POLICY "Users can view their household members" ON public.household_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships 
      WHERE id = household_members.membership_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their household members" ON public.household_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.memberships 
      WHERE id = household_members.membership_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all household members" ON public.household_members
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for matrix_nodes
CREATE POLICY "Users can view their own matrix node" ON public.matrix_nodes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their downline" ON public.matrix_nodes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matrix_nodes mn
      WHERE mn.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all matrix nodes" ON public.matrix_nodes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for commission_events
CREATE POLICY "Users can view their own commissions" ON public.commission_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all commissions" ON public.commission_events
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for products (public read)
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for product_orders
CREATE POLICY "Users can view their own orders" ON public.product_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON public.product_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" ON public.product_orders
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for order_items
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_orders 
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_orders 
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for waitlist (anyone can join)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist_entries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage waitlist" ON public.waitlist_entries
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for app_settings (admin only)
CREATE POLICY "Admins can manage settings" ON public.app_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read settings" ON public.app_settings
  FOR SELECT USING (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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
  
  RETURN new;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate membership ID
CREATE OR REPLACE FUNCTION public.generate_membership_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.membership_id := 'MAG-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

-- Trigger for membership ID generation
CREATE TRIGGER generate_membership_id_trigger
  BEFORE INSERT ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.generate_membership_id();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Timestamp triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_household_members_updated_at BEFORE UPDATE ON public.household_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default app settings
INSERT INTO public.app_settings (key, value) VALUES
  ('membership_cap', '{"value": 100, "enabled": true}'::jsonb),
  ('base_price', '{"value": 50}'::jsonb),
  ('addon_price', '{"value": 25}'::jsonb),
  ('slot_lock_days', '{"value": 30}'::jsonb),
  ('waitlist_enabled', '{"value": false}'::jsonb);

-- Insert sample products
INSERT INTO public.products (name, description, price, member_price, image_url, rating) VALUES
  ('Premium Beard Oil', 'Nourishing blend of argan and jojoba oils', 24.99, 19.99, '🧴', 4.8),
  ('Styling Pomade', 'Medium hold with natural shine', 18.99, 14.99, '💈', 4.9),
  ('Magnetic Hair Tonic', 'Revitalizing scalp treatment', 29.99, 24.99, '💧', 4.7),
  ('Shave Butter', 'Ultra-smooth shaving cream', 15.99, 12.99, '🪒', 4.6),
  ('Magnetic T-Shirt', 'Premium cotton, embroidered logo', 34.99, 29.99, '👕', 5.0),
  ('Grooming Kit', 'Complete set with travel case', 79.99, 64.99, '🎁', 4.9);