-- Skills Database Cleanup Script (Simplified Version)
-- Run this script step by step to fix skills database issues

-- Step 1: Check current state
SELECT 'Step 1: Current skills count' as step, COUNT(*) as count FROM skills;

-- Step 2: Check for duplicates (case-insensitive)
SELECT 'Step 2: Duplicate skills found' as step, LOWER(name) as normalized_name, COUNT(*) as count 
FROM skills 
GROUP BY LOWER(name) 
HAVING COUNT(*) > 1;

-- Step 3: Check for whitespace issues
SELECT 'Step 3: Skills with whitespace issues' as step, id, name, LENGTH(name) as length
FROM skills 
WHERE name != TRIM(name);

-- Step 4: Check for invalid categories
SELECT 'Step 4: Skills with invalid categories' as step, id, name, category
FROM skills 
WHERE category NOT IN (
  'Programming & Tech', 'Languages', 'Music & Arts', 'Business & Professional',
  'Health & Wellness', 'Culinary Arts', 'Science & Education', 'Crafts & DIY',
  'Sports & Recreation', 'Life Skills', 'Writing & Communication', 'Travel & Culture', 'Other'
);

-- Step 5: Fix whitespace issues (SAFE - only trims spaces)
UPDATE skills 
SET name = TRIM(name), 
    updated_at = NOW()
WHERE name != TRIM(name);

-- Step 6: Fix invalid categories (SAFE - sets to 'Other')
UPDATE skills 
SET category = 'Other', 
    updated_at = NOW()
WHERE category NOT IN (
  'Programming & Tech', 'Languages', 'Music & Arts', 'Business & Professional',
  'Health & Wellness', 'Culinary Arts', 'Science & Education', 'Crafts & DIY',
  'Sports & Recreation', 'Life Skills', 'Writing & Communication', 'Travel & Culture', 'Other'
);

-- Step 7: Fix empty skill names (SAFE - sets to 'Unknown Skill')
UPDATE skills 
SET name = 'Unknown Skill', 
    updated_at = NOW()
WHERE name IS NULL OR name = '';

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_skills_name_lower ON skills(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_profiles_skills_gin ON profiles USING GIN(skills_to_teach);

-- Step 9: Final verification
SELECT 'Step 9: Final skills count' as step, COUNT(*) as count FROM skills;
SELECT 'Step 9: Skills with proper names' as step, COUNT(*) as count FROM skills WHERE name = TRIM(name);
SELECT 'Step 9: Skills with valid categories' as step, COUNT(*) as count FROM skills WHERE category IN (
  'Programming & Tech', 'Languages', 'Music & Arts', 'Business & Professional',
  'Health & Wellness', 'Culinary Arts', 'Science & Education', 'Crafts & DIY',
  'Sports & Recreation', 'Life Skills', 'Writing & Communication', 'Travel & Culture', 'Other'
);

-- Step 10: Summary
SELECT 'Database cleanup completed successfully!' as message; 