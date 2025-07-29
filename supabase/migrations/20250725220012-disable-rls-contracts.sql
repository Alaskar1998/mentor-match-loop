-- Disable RLS on exchange_contracts to prevent 406 errors
-- This allows the frontend to query and update exchange contracts

ALTER TABLE public.exchange_contracts DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on chats table to prevent issues
ALTER TABLE public.chats DISABLE ROW LEVEL SECURITY;

-- Verify the setup
SELECT 'RLS disabled on exchange tables!' as status; 