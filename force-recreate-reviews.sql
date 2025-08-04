-- Force recreate reviews table with correct structure
-- This script will completely recreate the table regardless of current state

-- 1. Drop all policies first
DROP POLICY IF EXISTS "Users can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews they write" ON public.reviews;
DROP POLICY IF EXISTS "Users can update reviews they wrote" ON public.reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can update any review" ON public.reviews;

-- 2. Drop the table completely (this will remove all data)
DROP TABLE IF EXISTS public.reviews CASCADE;

-- 3. Create the table with the EXACT structure from the migration
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES public.chats(id) ON DELETE SET NULL,
  skill TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, reviewee_id, chat_id)
);

-- 4. Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 5. Create basic policies
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

-- 6. Create admin policies
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

-- 7. Create indexes
CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);

-- 8. Verify the structure
SELECT 
  'Verification - Table structure' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews'
ORDER BY ordinal_position;

-- 9. Test basic query
SELECT 'Test - Basic query' as check_type, COUNT(*) as review_count FROM public.reviews;

-- 10. Test with specific columns
SELECT 'Test - Column access' as check_type,
       id,
       reviewer_id,
       reviewee_id,
       skill,
       rating
FROM public.reviews 
LIMIT 1; 