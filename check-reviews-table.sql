-- Check if reviews table exists and has data
SELECT 
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'reviews'
  ) as table_exists;

-- Check if there are any reviews
SELECT COUNT(*) as review_count FROM public.reviews;

-- Check the structure of reviews table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews'
ORDER BY ordinal_position;

-- Add admin-specific policies for reviews table
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews they write" ON public.reviews;
DROP POLICY IF EXISTS "Users can update reviews they wrote" ON public.reviews;

-- Recreate policies with admin support
CREATE POLICY "Users can view all reviews"
ON public.reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews they write"
ON public.reviews 
FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update reviews they wrote"
ON public.reviews 
FOR UPDATE 
USING (auth.uid() = reviewer_id);

-- Add admin-specific policies
CREATE POLICY "Admins can view all reviews"
ON public.reviews 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update any review"
ON public.reviews 
FOR UPDATE 
USING (
  auth.uid() = reviewer_id OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
); 