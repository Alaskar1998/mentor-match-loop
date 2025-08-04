-- Check the actual reviews table structure
-- Run this first to see what's really in your database

-- 1. Check if table exists
SELECT 
  'Table exists' as check_type,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'reviews'
  ) as result;

-- 2. Check actual table structure
SELECT 
  'Actual table structure' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews'
ORDER BY ordinal_position;

-- 3. Check table constraints
SELECT 
  'Table constraints' as check_type,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name = 'reviews';

-- 4. Check foreign key constraints
SELECT 
  'Foreign keys' as check_type,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'reviews';

-- 5. Check if there's any data
SELECT 
  'Data count' as check_type,
  COUNT(*) as review_count 
FROM public.reviews; 