-- Fix the "column profiles.user_type does not exist" error
-- Run this in your Supabase SQL Editor

-- Step 1: Add the missing columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'free';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Step 2: Drop existing constraints if they exist (to avoid conflicts)
DO $$ 
BEGIN
    -- Drop constraints if they exist
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_user_type') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT check_user_type;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_status') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT check_status;
    END IF;
END $$;

-- Step 3: Add constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT check_user_type 
CHECK (user_type IN ('free', 'premium'));

ALTER TABLE public.profiles 
ADD CONSTRAINT check_status 
CHECK (status IN ('active', 'inactive'));

-- Step 4: Update existing users
UPDATE public.profiles 
SET user_type = 'free' 
WHERE user_type IS NULL;

UPDATE public.profiles 
SET status = 'active' 
WHERE status IS NULL;

-- Step 5: Verify the columns exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('user_type', 'status'); 