-- Drop the incorrectly configured admin policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Drop the problematic insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Recreate the policies correctly
-- Allow all users to view all profiles (for public profiles)
CREATE POLICY "Users can view all profiles" 
ON public.profiles FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (with proper check)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles (correctly configured)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update any profile (correctly configured)
CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
); 