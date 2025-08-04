-- Add user_type column to profiles table
-- This allows tracking premium vs free users

-- Add user_type column with default value
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'free' CHECK (user_type IN ('free', 'premium'));

-- Add status column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Update existing users to have default values
UPDATE public.profiles 
SET user_type = 'free' 
WHERE user_type IS NULL;

UPDATE public.profiles 
SET status = 'active' 
WHERE status IS NULL;

-- Verify the changes
SELECT 
  'Verification' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('user_type', 'status')
ORDER BY ordinal_position; 