-- SIMPLE FIX: Add Reviews Table (No Foreign Key Constraints)
-- Run this in Supabase Dashboard → SQL Editor

-- Create reviews table without foreign key constraints
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID NOT NULL,
    reviewer_id UUID NOT NULL,
    reviewed_user_id UUID NOT NULL,
    skill_rating INTEGER NOT NULL CHECK (skill_rating >= 1 AND skill_rating <= 5),
    communication_rating INTEGER NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chat_id, reviewer_id)
);

-- Add review tracking columns to exchange_contracts
ALTER TABLE public.exchange_contracts 
ADD COLUMN IF NOT EXISTS user1_reviewed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS user2_reviewed BOOLEAN DEFAULT FALSE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_chat_id ON public.reviews(chat_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user_id ON public.reviews(reviewed_user_id);

-- Disable RLS for now
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- Verify setup
SELECT 'Reviews table created successfully!' as status; 