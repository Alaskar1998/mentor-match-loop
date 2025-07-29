-- Temporarily disable RLS on notifications table to fix permission issues
-- Run this in Supabase SQL Editor

-- Disable Row Level Security for notifications table
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'notifications' AND schemaname = 'public'; 