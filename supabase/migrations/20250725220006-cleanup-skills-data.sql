-- Clean up skills data and ensure consistency
-- This migration ensures all skills are properly categorized and removes duplicates

-- First, let's create a temporary table to store unique skills
CREATE TEMP TABLE temp_unique_skills AS
SELECT DISTINCT 
  LOWER(TRIM(name)) as normalized_name,
  name,
  category,
  emoji,
  description,
  is_active,
  created_at,
  updated_at
FROM skills
WHERE name IS NOT NULL AND name != '';

-- Delete all skills from the main table
DELETE FROM skills;

-- Re-insert unique skills with proper categorization
INSERT INTO skills (name, category, emoji, description, is_active, created_at, updated_at)
SELECT 
  name,
  CASE 
    WHEN category IS NULL OR category = '' THEN 'Other'
    ELSE category
  END as category,
  emoji,
  description,
  is_active,
  created_at,
  updated_at
FROM temp_unique_skills
ORDER BY name;

-- Update any skills that don't have a proper category
UPDATE skills 
SET category = 'Other' 
WHERE category IS NULL OR category = '';

-- Ensure all skills have proper names (no leading/trailing spaces)
UPDATE skills 
SET name = TRIM(name) 
WHERE name != TRIM(name);

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_skills_name_lower ON skills(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);

-- Add a constraint to prevent future duplicates (case-insensitive)
ALTER TABLE skills ADD CONSTRAINT unique_skill_name_case_insensitive 
UNIQUE (LOWER(name));

-- Update any user profiles that reference non-existent skills
-- This will set skills_to_teach to an empty array if there are any issues
UPDATE profiles 
SET skills_to_teach = '[]'::jsonb 
WHERE skills_to_teach IS NULL OR skills_to_teach = 'null'::jsonb;

-- Create a function to validate skill names
CREATE OR REPLACE FUNCTION validate_skill_name(skill_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the skill exists in our skills table
  RETURN EXISTS (
    SELECT 1 FROM skills 
    WHERE LOWER(name) = LOWER(skill_name)
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to get or create a skill
CREATE OR REPLACE FUNCTION get_or_create_skill(
  skill_name TEXT,
  skill_category TEXT DEFAULT 'Other'
)
RETURNS TEXT AS $$
DECLARE
  existing_skill_name TEXT;
BEGIN
  -- Try to find existing skill (case-insensitive)
  SELECT name INTO existing_skill_name
  FROM skills 
  WHERE LOWER(name) = LOWER(skill_name);
  
  -- If found, return the existing name (preserves original casing)
  IF existing_skill_name IS NOT NULL THEN
    RETURN existing_skill_name;
  END IF;
  
  -- If not found, create new skill
  INSERT INTO skills (name, category, is_active)
  VALUES (skill_name, skill_category, true);
  
  RETURN skill_name;
END;
$$ LANGUAGE plpgsql;

-- Create a function to normalize skill names
CREATE OR REPLACE FUNCTION normalize_skill_name(skill_name TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove leading/trailing spaces and convert to title case
  RETURN INITCAP(TRIM(skill_name));
END;
$$ LANGUAGE plpgsql; 