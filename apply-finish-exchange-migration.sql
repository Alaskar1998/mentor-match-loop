-- Apply finish exchange migration manually
-- Run this in your Supabase Dashboard SQL Editor

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

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'exchange_contracts' 
AND column_name IN ('user1_finished', 'user2_finished', 'finished_at'); 