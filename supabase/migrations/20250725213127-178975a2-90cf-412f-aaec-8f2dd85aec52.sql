-- Fix foreign key relationships by updating tables to reference profiles instead of auth.users

-- Update learning_requests to reference profiles table
ALTER TABLE public.learning_requests
DROP CONSTRAINT learning_requests_user_id_fkey;

ALTER TABLE public.learning_requests
ADD CONSTRAINT learning_requests_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update chats to reference profiles table
ALTER TABLE public.chats
DROP CONSTRAINT chats_user1_id_fkey,
DROP CONSTRAINT chats_user2_id_fkey;

ALTER TABLE public.chats
ADD CONSTRAINT chats_user1_id_fkey
FOREIGN KEY (user1_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT chats_user2_id_fkey
FOREIGN KEY (user2_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update chat_messages to reference profiles table
ALTER TABLE public.chat_messages
DROP CONSTRAINT chat_messages_sender_id_fkey;

ALTER TABLE public.chat_messages
ADD CONSTRAINT chat_messages_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update invitations to reference profiles table
ALTER TABLE public.invitations
DROP CONSTRAINT invitations_sender_id_fkey,
DROP CONSTRAINT invitations_recipient_id_fkey;

ALTER TABLE public.invitations
ADD CONSTRAINT invitations_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT invitations_recipient_id_fkey
FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update reviews to reference profiles table
ALTER TABLE public.reviews
DROP CONSTRAINT reviews_reviewer_id_fkey,
DROP CONSTRAINT reviews_reviewee_id_fkey;

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_reviewer_id_fkey
FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT reviews_reviewee_id_fkey
FOREIGN KEY (reviewee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;