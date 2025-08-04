-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role text DEFAULT 'user';

-- Create index on role for faster queries
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Update RLS policies to allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
); 