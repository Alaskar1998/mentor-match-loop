-- Add test reviews to verify admin dashboard functionality
-- This script will add sample review data

-- First, let's see what users we have
SELECT 'Available users' as info, id, display_name FROM public.profiles LIMIT 5;

-- Add test reviews (this will work if you have at least 2 users)
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

-- Add more varied reviews
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

-- Verify the data was added
SELECT 'Test data added' as info, COUNT(*) as total_reviews FROM public.reviews;

-- Show sample of the reviews
SELECT 
  'Sample reviews' as info,
  r.id,
  r.skill,
  r.rating,
  r.comment,
  reviewer.display_name as reviewer_name,
  reviewee.display_name as reviewee_name
FROM public.reviews r
LEFT JOIN public.profiles reviewer ON r.reviewer_id = reviewer.id
LEFT JOIN public.profiles reviewee ON r.reviewee_id = reviewee.id
LIMIT 5; 