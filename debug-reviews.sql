-- Comprehensive diagnostic for reviews table
-- Run this in your Supabase SQL Editor

-- 1. Check if reviews table exists
SELECT 
  'Table exists' as check_type,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'reviews'
  ) as result;

-- 2. Check table structure
SELECT 
  'Table structure' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews'
ORDER BY ordinal_position;

-- 3. Check if table has any data
SELECT 
  'Data count' as check_type,
  COUNT(*) as review_count 
FROM public.reviews;

-- 4. Check RLS policies on reviews table
SELECT 
  'RLS Policies' as check_type,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'reviews';

-- 5. Check if RLS is enabled
SELECT 
  'RLS Status' as check_type,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'reviews';

-- 6. Check current user and role
SELECT 
  'Current User' as check_type,
  auth.uid() as current_user_id,
  (SELECT role FROM public.profiles WHERE id = auth.uid()) as user_role;

-- 7. Test direct query (should work for admins)
SELECT 
  'Direct query test' as check_type,
  COUNT(*) as accessible_reviews
FROM public.reviews;

-- 8. Check if there are any reviews with sample data
SELECT 
  'Sample reviews' as check_type,
  id,
  reviewer_id,
  reviewee_id,
  skill,
  rating,
  created_at
FROM public.reviews 
LIMIT 5; 