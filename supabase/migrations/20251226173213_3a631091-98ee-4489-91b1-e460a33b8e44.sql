-- Rename household_members table to connections
ALTER TABLE public.household_members RENAME TO connections;

-- Update RLS policies for connections table (drop old, create new with correct references)
DROP POLICY IF EXISTS "Admins can manage all household members" ON public.connections;
DROP POLICY IF EXISTS "Users can manage their household members" ON public.connections;
DROP POLICY IF EXISTS "Users can view their household members" ON public.connections;

-- Recreate policies with correct table name
CREATE POLICY "Admins can manage all connections" 
ON public.connections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their connections" 
ON public.connections 
FOR ALL 
USING (EXISTS ( SELECT 1 FROM memberships WHERE memberships.id = connections.membership_id AND memberships.user_id = auth.uid()));

CREATE POLICY "Users can view their connections" 
ON public.connections 
FOR SELECT 
USING (EXISTS ( SELECT 1 FROM memberships WHERE memberships.id = connections.membership_id AND memberships.user_id = auth.uid()));

-- Add profile fields for new Profile section
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS x_url TEXT;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);