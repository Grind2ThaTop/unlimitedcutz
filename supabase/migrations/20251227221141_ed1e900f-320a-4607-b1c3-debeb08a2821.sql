-- Create groups table for organizing users
CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  group_type text NOT NULL CHECK (group_type IN ('barber', 'client', 'system')),
  tier text CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  location text,
  description text,
  rules jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Anyone can view groups
CREATE POLICY "Anyone can view groups"
ON public.groups FOR SELECT
USING (true);

-- Admins can manage groups
CREATE POLICY "Admins can manage groups"
ON public.groups FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add group_id to profiles
ALTER TABLE public.profiles ADD COLUMN group_id uuid REFERENCES public.groups(id);

-- Create activity_events table for tracking all user activity
CREATE TABLE public.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  target_type text,
  target_id uuid,
  target_owner_id uuid REFERENCES public.profiles(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on activity_events
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events
CREATE POLICY "Users can view their own activity events"
ON public.activity_events FOR SELECT
USING (auth.uid() = user_id);

-- Users can view events where they are the target owner
CREATE POLICY "Users can view events targeting their content"
ON public.activity_events FOR SELECT
USING (auth.uid() = target_owner_id);

-- Admins can manage all activity events
CREATE POLICY "Admins can manage all activity events"
ON public.activity_events FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert activity events (via service role)
CREATE POLICY "System can insert activity events"
ON public.activity_events FOR INSERT
WITH CHECK (true);

-- Create notification_settings table
CREATE TABLE public.notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  notify_on_reactions boolean NOT NULL DEFAULT true,
  notify_on_comments boolean NOT NULL DEFAULT true,
  notify_on_referrals boolean NOT NULL DEFAULT true,
  daily_digest boolean NOT NULL DEFAULT true,
  digest_time time NOT NULL DEFAULT '19:00',
  admin_alerts boolean NOT NULL DEFAULT true,
  email_enabled boolean NOT NULL DEFAULT true,
  sms_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on notification_settings
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification settings
CREATE POLICY "Users can view their own notification settings"
ON public.notification_settings FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notification settings
CREATE POLICY "Users can update their own notification settings"
ON public.notification_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Users can insert their own notification settings
CREATE POLICY "Users can insert their own notification settings"
ON public.notification_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all notification settings
CREATE POLICY "Admins can manage all notification settings"
ON public.notification_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create email_logs table to track sent emails
CREATE TABLE public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  email_to text NOT NULL,
  template text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  resend_id text,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on email_logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all email logs
CREATE POLICY "Admins can view all email logs"
ON public.email_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert email logs
CREATE POLICY "System can insert email logs"
ON public.email_logs FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_activity_events_user_id ON public.activity_events(user_id);
CREATE INDEX idx_activity_events_target_owner_id ON public.activity_events(target_owner_id);
CREATE INDEX idx_activity_events_event_type ON public.activity_events(event_type);
CREATE INDEX idx_activity_events_created_at ON public.activity_events(created_at DESC);
CREATE INDEX idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX idx_profiles_group_id ON public.profiles(group_id);

-- Seed default groups
INSERT INTO public.groups (name, slug, group_type, tier, description) VALUES
  ('Barbers - Bronze', 'barbers-bronze', 'barber', 'bronze', 'Bronze tier barber members'),
  ('Barbers - Silver', 'barbers-silver', 'barber', 'silver', 'Silver tier barber members'),
  ('Barbers - Gold', 'barbers-gold', 'barber', 'gold', 'Gold tier barber members'),
  ('Barbers - Platinum', 'barbers-platinum', 'barber', 'platinum', 'Platinum tier barber members'),
  ('Barbers - Diamond', 'barbers-diamond', 'barber', 'diamond', 'Diamond tier barber members'),
  ('Clients - General', 'clients-general', 'client', NULL, 'General client members'),
  ('Clients - Roslyn', 'clients-roslyn', 'client', NULL, 'Roslyn location clients'),
  ('Unsorted', 'unsorted', 'system', NULL, 'New signups pending group assignment');

-- Add trigger to update updated_at on groups
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger to update updated_at on notification_settings
CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();