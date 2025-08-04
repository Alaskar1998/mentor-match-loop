-- Test script to verify exchange system fixes
-- This script tests the various exchange states and transitions

-- 1. Test invitation acceptance flow
-- Create test users
INSERT INTO public.profiles (id, display_name, email) VALUES 
('test-user-1', 'Test User 1', 'test1@example.com'),
('test-user-2', 'Test User 2', 'test2@example.com')
ON CONFLICT (id) DO NOTHING;

-- Create test invitation
INSERT INTO public.invitations (id, sender_id, recipient_id, skill, message, status) VALUES 
('test-invite-1', 'test-user-1', 'test-user-2', 'JavaScript', 'Let''s learn together!', 'pending');

-- Test accepting invitation
UPDATE public.invitations SET status = 'accepted' WHERE id = 'test-invite-1';

-- Verify invitation is no longer in pending lists
SELECT 'Pending invitations for user 1:' as test, COUNT(*) as count 
FROM public.invitations 
WHERE sender_id = 'test-user-1' AND status != 'accepted';

SELECT 'Pending invitations for user 2:' as test, COUNT(*) as count 
FROM public.invitations 
WHERE recipient_id = 'test-user-2' AND status != 'accepted';

-- 2. Test active exchange flow
-- Create test chat
INSERT INTO public.chats (id, user1_id, user2_id, skill, status, exchange_state) VALUES 
('test-chat-1', 'test-user-1', 'test-user-2', 'JavaScript', 'active', 'active_exchange');

-- Create test contract
INSERT INTO public.exchange_contracts (chat_id, user1_id, user2_id, user1_skill, user2_skill, user1_agreed, user2_agreed) VALUES 
('test-chat-1', 'test-user-1', 'test-user-2', 'JavaScript', 'Python', true, true);

-- Verify active exchanges
SELECT 'Active exchanges for user 1:' as test, COUNT(*) as count 
FROM public.chats c
JOIN public.exchange_contracts ec ON c.id = ec.chat_id
WHERE (c.user1_id = 'test-user-1' OR c.user2_id = 'test-user-1')
AND c.exchange_state = 'active_exchange';

-- 3. Test completed exchange flow
-- Update chat to completed
UPDATE public.chats SET exchange_state = 'completed' WHERE id = 'test-chat-1';

-- Update contract to finished
UPDATE public.exchange_contracts 
SET user1_finished = true, user2_finished = true, finished_at = NOW()
WHERE chat_id = 'test-chat-1';

-- Verify completed exchanges
SELECT 'Completed exchanges for user 1:' as test, COUNT(*) as count 
FROM public.chats c
JOIN public.exchange_contracts ec ON c.id = ec.chat_id
WHERE (c.user1_id = 'test-user-1' OR c.user2_id = 'test-user-1')
AND c.exchange_state = 'completed';

-- Cleanup test data
DELETE FROM public.exchange_contracts WHERE chat_id = 'test-chat-1';
DELETE FROM public.chats WHERE id = 'test-chat-1';
DELETE FROM public.invitations WHERE id = 'test-invite-1';
DELETE FROM public.profiles WHERE id IN ('test-user-1', 'test-user-2'); 