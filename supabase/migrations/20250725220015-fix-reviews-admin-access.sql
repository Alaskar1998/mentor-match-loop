-- Fix reviews table admin access
-- This migration ensures admins can access reviews data

-- First, check if reviews table exists, if not create it
CREATE TABLE IF NOT EXISTS public.reviews (
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

-- Enable RLS on reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews they write" ON public.reviews;
DROP POLICY IF EXISTS "Users can update reviews they wrote" ON public.reviews;
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can update any review" ON public.reviews;

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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC); 