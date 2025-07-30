-- Add finish exchange fields to exchange_contracts table
-- This migration adds fields to track when users want to finish exchanges

-- Add finish exchange fields to exchange_contracts table
ALTER TABLE public.exchange_contracts 
ADD COLUMN IF NOT EXISTS user1_finished BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS user2_finished BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS finished_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance on finish status queries
CREATE INDEX IF NOT EXISTS idx_exchange_contracts_finished ON public.exchange_contracts(user1_finished, user2_finished);

-- Add comment to explain the new fields
COMMENT ON COLUMN public.exchange_contracts.user1_finished IS 'Whether user1 has marked the exchange as finished';
COMMENT ON COLUMN public.exchange_contracts.user2_finished IS 'Whether user2 has marked the exchange as finished';
COMMENT ON COLUMN public.exchange_contracts.finished_at IS 'Timestamp when both users finished the exchange'; 