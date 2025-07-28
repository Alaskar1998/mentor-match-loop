-- Simple storage setup for avatar uploads
-- Run this in Supabase SQL Editor

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create profile-images bucket as fallback
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update profile images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete profile images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;

-- Create simple policies for avatars
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

-- Create simple policies for profile-images
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