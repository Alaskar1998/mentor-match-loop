-- Fix notifications table foreign keys to reference profiles instead of auth.users
-- This ensures consistency with other tables

-- Update notifications table to reference profiles table
ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey,
DROP CONSTRAINT IF EXISTS notifications_sender_id_fkey;

-- Add new foreign key constraints to reference profiles
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.notifications
ADD CONSTRAINT notifications_sender_id_fkey
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE; 