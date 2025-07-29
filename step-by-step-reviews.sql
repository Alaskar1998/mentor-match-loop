-- STEP BY STEP: Create Reviews Table
-- Run this ONE COMMAND AT A TIME in Supabase Dashboard → SQL Editor

-- Step 1: Create basic table structure
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add chat_id column
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS chat_id UUID NOT NULL;

-- Step 3: Add reviewer_id column  
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS reviewer_id UUID NOT NULL;

-- Step 4: Add reviewed_user_id column
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS reviewed_user_id UUID NOT NULL;

-- Step 5: Add rating columns
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS skill_rating INTEGER CHECK (skill_rating >= 1 AND skill_rating <= 5);

ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5);

-- Step 6: Add review text column
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS review_text TEXT;

-- Step 7: Add updated_at column
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 8: Add unique constraint
ALTER TABLE public.reviews 
ADD CONSTRAINT IF NOT EXISTS unique_chat_reviewer UNIQUE (chat_id, reviewer_id);

-- Step 9: Add review tracking to exchange_contracts
ALTER TABLE public.exchange_contracts 
ADD COLUMN IF NOT EXISTS user1_reviewed BOOLEAN DEFAULT FALSE;

ALTER TABLE public.exchange_contracts 
ADD COLUMN IF NOT EXISTS user2_reviewed BOOLEAN DEFAULT FALSE;

-- Step 10: Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_chat_id ON public.reviews(chat_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user_id ON public.reviews(reviewed_user_id);

-- Step 11: Disable RLS
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- Step 12: Verify
SELECT 'Reviews table setup completed successfully!' as status; 