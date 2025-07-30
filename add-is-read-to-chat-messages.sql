-- Add is_read column to chat_messages table
ALTER TABLE public.chat_messages 
ADD COLUMN is_read BOOLEAN DEFAULT FALSE;

-- Create index for better performance on read status queries
CREATE INDEX idx_chat_messages_is_read ON public.chat_messages(is_read);

-- Update existing messages to be marked as read (since they're old)
UPDATE public.chat_messages 
SET is_read = TRUE 
WHERE created_at < NOW() - INTERVAL '1 hour'; 