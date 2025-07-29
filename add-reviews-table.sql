-- Add Reviews Table for Exchange Review System
-- Run this in Supabase Dashboard → SQL Editor

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exchange_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewed_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_rating INTEGER NOT NULL CHECK (skill_rating >= 1 AND skill_rating <= 5),
    communication_rating INTEGER NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exchange_id, reviewer_id)
);

-- Add review tracking columns to exchange_contracts
ALTER TABLE public.exchange_contracts 
ADD COLUMN IF NOT EXISTS user1_reviewed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS user2_reviewed BOOLEAN DEFAULT FALSE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_exchange_id ON public.reviews(exchange_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user_id ON public.reviews(reviewed_user_id);

-- Disable RLS for now (since we disabled it for other tables)
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify setup
SELECT 'Reviews table setup complete!' as status; 