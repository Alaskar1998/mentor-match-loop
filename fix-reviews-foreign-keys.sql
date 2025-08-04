-- Fix reviews table foreign key references
-- The issue is that foreign keys point to auth.users instead of public.profiles

-- 1. Drop the existing table
DROP TABLE IF EXISTS public.reviews CASCADE;

-- 2. Create the table with correct foreign key references
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES public.chats(id) ON DELETE SET NULL,
  skill TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, reviewee_id, chat_id)
);

-- 3. Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. Create basic policies
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

-- 5. Create admin policies
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

-- 6. Create indexes
CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);

-- 7. Add test data back
INSERT INTO public.reviews (
  reviewer_id,
  reviewee_id,
  skill,
  rating,
  comment
)
SELECT 
  p1.id as reviewer_id,
  p2.id as reviewee_id,
  'JavaScript' as skill,
  5 as rating,
  'Excellent teaching skills and very patient!' as comment
FROM public.profiles p1
CROSS JOIN public.profiles p2
WHERE p1.id != p2.id
LIMIT 3;

INSERT INTO public.reviews (
  reviewer_id,
  reviewee_id,
  skill,
  rating,
  comment
)
SELECT 
  p1.id as reviewer_id,
  p2.id as reviewee_id,
  'React' as skill,
  4 as rating,
  'Great communication and clear explanations' as comment
FROM public.profiles p1
CROSS JOIN public.profiles p2
WHERE p1.id != p2.id
LIMIT 2;

-- 8. Verify the structure and data
SELECT 
  'Verification - Table structure' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reviews'
ORDER BY ordinal_position;

SELECT 'Test - Data count' as check_type, COUNT(*) as review_count FROM public.reviews;

-- 9. Test the join that the frontend uses
SELECT 
  'Test - Frontend query' as check_type,
  r.id,
  r.skill,
  r.rating,
  reviewer.display_name as reviewer_name,
  reviewee.display_name as reviewee_name
FROM public.reviews r
LEFT JOIN public.profiles reviewer ON r.reviewer_id = reviewer.id
LEFT JOIN public.profiles reviewee ON r.reviewee_id = reviewee.id
LIMIT 3; 