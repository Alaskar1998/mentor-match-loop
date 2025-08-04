-- Test admin access to reviews table
-- This will help us understand if RLS policies are working correctly

-- 1. Check current user and role
SELECT 
  'Current user info' as test_type,
  auth.uid() as current_user_id,
  (SELECT role FROM public.profiles WHERE id = auth.uid()) as user_role;

-- 2. Test direct access to reviews (should work for admins)
SELECT 
  'Direct reviews access' as test_type,
  COUNT(*) as accessible_reviews
FROM public.reviews;

-- 3. Test with specific columns
SELECT 
  'Column access test' as test_type,
  id,
  reviewer_id,
  reviewee_id,
  skill,
  rating
FROM public.reviews 
LIMIT 3;

-- 4. Test with joins (like the frontend query)
SELECT 
  'Join test' as test_type,
  r.id,
  r.skill,
  r.rating,
  reviewer.display_name as reviewer_name,
  reviewee.display_name as reviewee_name
FROM public.reviews r
LEFT JOIN public.profiles reviewer ON r.reviewer_id = reviewer.id
LEFT JOIN public.profiles reviewee ON r.reviewee_id = reviewee.id
LIMIT 3;

-- 5. Check RLS policies on reviews table
SELECT 
  'RLS Policies' as test_type,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'reviews';

-- 6. Check if RLS is enabled
SELECT 
  'RLS Status' as test_type,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'reviews'; 