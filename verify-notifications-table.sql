-- Verify notifications table was created successfully
-- Run this after creating the notifications table

-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'notifications'
);

-- Check table structure
\d public.notifications;

-- Check if there are any existing notifications
SELECT COUNT(*) as notification_count FROM public.notifications;

-- Show table info
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
ORDER BY ordinal_position; 