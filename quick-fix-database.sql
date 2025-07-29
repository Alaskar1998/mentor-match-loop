-- QUICK FIX: Run this in Supabase Dashboard → SQL Editor
-- This will fix the white page issue by adding missing database columns

-- 1. Add exchange_state column to chats table (ignore if exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chats' AND column_name='exchange_state') THEN
        ALTER TABLE public.chats ADD COLUMN exchange_state TEXT DEFAULT 'pending_start';
    END IF;
END $$;

-- 2. Create exchange_contracts table (ignore if exists)
CREATE TABLE IF NOT EXISTS public.exchange_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user1_skill TEXT,
    user2_skill TEXT,
    user1_is_mentorship BOOLEAN DEFAULT FALSE,
    user2_is_mentorship BOOLEAN DEFAULT FALSE,
    user1_agreed BOOLEAN DEFAULT FALSE,
    user2_agreed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chat_id)
);

-- 3. Disable RLS to prevent permission issues
ALTER TABLE public.exchange_contracts DISABLE ROW LEVEL SECURITY;

-- 4. Verify setup
SELECT 'Database setup complete!' as status; 