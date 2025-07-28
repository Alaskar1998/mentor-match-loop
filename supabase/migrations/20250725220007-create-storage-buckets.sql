-- Create storage buckets for avatar uploads
-- This migration sets up the necessary storage buckets and policies

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create profile-images bucket as fallback if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;

-- Set up permissive RLS policies for avatars bucket
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to update avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Set up permissive RLS policies for profile-images bucket
CREATE POLICY "Allow authenticated users to upload profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to update profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images'); 