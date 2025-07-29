-- MINIMAL: Just create the reviews table
-- Copy and paste this ENTIRE block into Supabase SQL Editor and run it

CREATE TABLE public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID,
    reviewer_id UUID,
    reviewed_user_id UUID,
    skill_rating INTEGER,
    communication_rating INTEGER,
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY; 