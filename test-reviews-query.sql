-- Simple test to check reviews table access
-- Run this in your Supabase SQL Editor

-- Test 1: Basic table access
SELECT 'Test 1: Basic access' as test_name, COUNT(*) as result FROM public.reviews;

-- Test 2: Check if we can see any reviews
SELECT 'Test 2: Sample data' as test_name, 
       id, 
       reviewer_id, 
       reviewee_id, 
       skill, 
       rating, 
       created_at
FROM public.reviews 
LIMIT 3;

-- Test 3: Check foreign key relationships
SELECT 'Test 3: With profiles join' as test_name,
       r.id,
       r.rating,
       r.skill,
       reviewer.display_name as reviewer_name,
       reviewee.display_name as reviewee_name
FROM public.reviews r
LEFT JOIN public.profiles reviewer ON r.reviewer_id = reviewer.id
LEFT JOIN public.profiles reviewee ON r.reviewee_id = reviewee.id
LIMIT 3;

-- Test 4: Check if the table structure matches what the code expects
SELECT 'Test 4: Table structure' as test_name,
       column_name,
       data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews'
ORDER BY ordinal_position; 