-- Fix Chat Loading Issue - Apply Database Schema Changes
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Add exchange_state column to chats table if it doesn't exist
ALTER TABLE public.chats 
ADD COLUMN IF NOT EXISTS exchange_state TEXT DEFAULT 'pending_start' 
CHECK (exchange_state IN ('pending_start', 'draft_contract', 'contract_proposed', 'active_exchange', 'completed', 'cancelled'));

-- 2. Create exchange_contracts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.exchange_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exchange_contracts_chat_id ON public.exchange_contracts(chat_id);
CREATE INDEX IF NOT EXISTS idx_exchange_contracts_user1_id ON public.exchange_contracts(user1_id);
CREATE INDEX IF NOT EXISTS idx_exchange_contracts_user2_id ON public.exchange_contracts(user2_id);

-- 4. Disable RLS for now (since we disabled it for notifications)
ALTER TABLE public.exchange_contracts DISABLE ROW LEVEL SECURITY;

-- 5. Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'chats' AND column_name = 'exchange_state';

SELECT table_name FROM information_schema.tables 
WHERE table_name = 'exchange_contracts' AND table_schema = 'public'; 