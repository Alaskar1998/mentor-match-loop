-- Add contract system to support proper exchange states
-- This migration adds exchange states and contract tracking

-- Add new columns to chats table for contract system
ALTER TABLE public.chats 
ADD COLUMN IF NOT EXISTS exchange_state TEXT DEFAULT 'pending_start' CHECK (exchange_state IN ('pending_start', 'draft_contract', 'contract_proposed', 'active_exchange', 'completed', 'cancelled'));

-- Create exchange_contracts table to track what each user will teach
CREATE TABLE IF NOT EXISTS public.exchange_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user1_skill TEXT, -- What user1 will teach (can be null for mentorship)
    user2_skill TEXT, -- What user2 will teach (can be null for mentorship)
    user1_is_mentorship BOOLEAN DEFAULT FALSE, -- User1 selected "mentorship session"
    user2_is_mentorship BOOLEAN DEFAULT FALSE, -- User2 selected "mentorship session"
    user1_agreed BOOLEAN DEFAULT FALSE, -- User1 agreed to final contract
    user2_agreed BOOLEAN DEFAULT FALSE, -- User2 agreed to final contract
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chat_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exchange_contracts_chat_id ON public.exchange_contracts(chat_id);
CREATE INDEX IF NOT EXISTS idx_exchange_contracts_user1_id ON public.exchange_contracts(user1_id);
CREATE INDEX IF NOT EXISTS idx_exchange_contracts_user2_id ON public.exchange_contracts(user2_id);

-- Enable Row Level Security
ALTER TABLE public.exchange_contracts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for exchange_contracts
CREATE POLICY "Users can view contracts they're part of" ON public.exchange_contracts
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update contracts they're part of" ON public.exchange_contracts
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create contracts for their chats" ON public.exchange_contracts
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create updated_at trigger for exchange_contracts
CREATE TRIGGER update_exchange_contracts_updated_at
    BEFORE UPDATE ON public.exchange_contracts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 