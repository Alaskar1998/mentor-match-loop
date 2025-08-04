-- Check if your profile exists and has data
SELECT id, email, display_name, bio, avatar_url, skills_to_teach, skills_to_learn, role
FROM profiles 
WHERE email = 'your-email@example.com';

-- Check all profiles to see the structure
SELECT id, email, display_name, role 
FROM profiles 
LIMIT 5;

-- Check if there are any RLS policy issues
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles'; 