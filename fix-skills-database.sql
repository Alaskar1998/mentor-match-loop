-- Skills Database Cleanup and Fix Script
-- This script addresses potential issues with skills data

-- 1. First, let's check what we have in the database
SELECT 'Current skills count:' as info, COUNT(*) as count FROM skills;

-- 2. Check for duplicate skills (case-insensitive)
SELECT 'Duplicate skills found:' as info, LOWER(name) as normalized_name, COUNT(*) as count 
FROM skills 
GROUP BY LOWER(name) 
HAVING COUNT(*) > 1;

-- 3. Check for skills with leading/trailing spaces
SELECT 'Skills with whitespace issues:' as info, id, name, LENGTH(name) as length
FROM skills 
WHERE name != TRIM(name);

-- 4. Check for skills with invalid categories
SELECT 'Skills with invalid categories:' as info, id, name, category
FROM skills 
WHERE category NOT IN (
  'Programming & Tech', 'Languages', 'Music & Arts', 'Business & Professional',
  'Health & Wellness', 'Culinary Arts', 'Science & Education', 'Crafts & DIY',
  'Sports & Recreation', 'Life Skills', 'Writing & Communication', 'Travel & Culture', 'Other'
);

-- 5. Check profiles for skills that don't exist in skills table
-- This is a complex query that needs to be run carefully
SELECT 'Profiles with invalid skills:' as info, p.id, p.skills_to_teach
FROM profiles p
WHERE p.skills_to_teach IS NOT NULL 
  AND p.skills_to_teach != '[]'::jsonb
  AND p.skills_to_teach != 'null'::jsonb;

-- 6. Fix duplicate skills (keep the first one, delete others)
DELETE FROM skills 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM skills 
  GROUP BY LOWER(name)
);

-- 7. Fix whitespace issues
UPDATE skills 
SET name = TRIM(name), 
    updated_at = NOW()
WHERE name != TRIM(name);

-- 8. Fix invalid categories (set to 'Other')
UPDATE skills 
SET category = 'Other', 
    updated_at = NOW()
WHERE category NOT IN (
  'Programming & Tech', 'Languages', 'Music & Arts', 'Business & Professional',
  'Health & Wellness', 'Culinary Arts', 'Science & Education', 'Crafts & DIY',
  'Sports & Recreation', 'Life Skills', 'Writing & Communication', 'Travel & Culture', 'Other'
);

-- 9. Ensure all skills have proper names
UPDATE skills 
SET name = 'Unknown Skill', 
    updated_at = NOW()
WHERE name IS NULL OR name = '';

-- 10. Create a function to normalize skill names
CREATE OR REPLACE FUNCTION normalize_skill_name(skill_name TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove leading/trailing spaces
  skill_name := TRIM(skill_name);
  
  -- Convert to lowercase for comparison
  skill_name := LOWER(skill_name);
  
  -- Handle common variations
  CASE skill_name
    WHEN 'advertising' THEN RETURN 'Advertising';
    WHEN 'marketing' THEN RETURN 'Marketing';
    WHEN 'digital marketing' THEN RETURN 'Digital Marketing';
    WHEN 'accounting' THEN RETURN 'Accounting';
    WHEN 'finance' THEN RETURN 'Finance';
    WHEN 'public speaking' THEN RETURN 'Public Speaking';
    WHEN 'javascript' THEN RETURN 'JavaScript';
    WHEN 'python' THEN RETURN 'Python';
    WHEN 'react' THEN RETURN 'React';
    WHEN 'node.js' THEN RETURN 'Node.js';
    WHEN 'html' THEN RETURN 'HTML';
    WHEN 'css' THEN RETURN 'CSS';
    WHEN 'sql' THEN RETURN 'SQL';
    WHEN 'git' THEN RETURN 'Git';
    WHEN 'github' THEN RETURN 'GitHub';
    WHEN 'api' THEN RETURN 'API';
    WHEN 'rest' THEN RETURN 'REST';
    WHEN 'ui/ux design' THEN RETURN 'UI/UX Design';
    WHEN 'web development' THEN RETURN 'Web Development';
    WHEN 'mobile development' THEN RETURN 'Mobile Development';
    WHEN 'machine learning' THEN RETURN 'Machine Learning';
    WHEN 'artificial intelligence' THEN RETURN 'Artificial Intelligence';
    WHEN 'data science' THEN RETURN 'Data Science';
    WHEN 'cloud computing' THEN RETURN 'Cloud Computing';
    WHEN 'cybersecurity' THEN RETURN 'Cybersecurity';
    WHEN 'blockchain' THEN RETURN 'Blockchain';
    WHEN 'game development' THEN RETURN 'Game Development';
    WHEN 'iot' THEN RETURN 'IoT';
    WHEN 'ar/vr' THEN RETURN 'AR/VR';
    WHEN 'devops' THEN RETURN 'DevOps';
    WHEN 'guitar' THEN RETURN 'Guitar';
    WHEN 'piano' THEN RETURN 'Piano';
    WHEN 'singing' THEN RETURN 'Singing';
    WHEN 'drums' THEN RETURN 'Drums';
    WHEN 'violin' THEN RETURN 'Violin';
    WHEN 'bass' THEN RETURN 'Bass';
    WHEN 'saxophone' THEN RETURN 'Saxophone';
    WHEN 'trumpet' THEN RETURN 'Trumpet';
    WHEN 'flute' THEN RETURN 'Flute';
    WHEN 'clarinet' THEN RETURN 'Clarinet';
    WHEN 'cello' THEN RETURN 'Cello';
    WHEN 'ukulele' THEN RETURN 'Ukulele';
    WHEN 'harmonica' THEN RETURN 'Harmonica';
    WHEN 'djing' THEN RETURN 'DJing';
    WHEN 'music production' THEN RETURN 'Music Production';
    WHEN 'composition' THEN RETURN 'Composition';
    WHEN 'music theory' THEN RETURN 'Music Theory';
    WHEN 'drawing' THEN RETURN 'Drawing';
    WHEN 'painting' THEN RETURN 'Painting';
    WHEN 'graphic design' THEN RETURN 'Graphic Design';
    WHEN 'photography' THEN RETURN 'Photography';
    WHEN 'illustration' THEN RETURN 'Illustration';
    WHEN 'animation' THEN RETURN 'Animation';
    WHEN '3d modeling' THEN RETURN '3D Modeling';
    WHEN 'digital art' THEN RETURN 'Digital Art';
    WHEN 'sculpture' THEN RETURN 'Sculpture';
    WHEN 'fashion design' THEN RETURN 'Fashion Design';
    WHEN 'interior design' THEN RETURN 'Interior Design';
    WHEN 'yoga' THEN RETURN 'Yoga';
    WHEN 'fitness' THEN RETURN 'Fitness';
    WHEN 'swimming' THEN RETURN 'Swimming';
    WHEN 'meditation' THEN RETURN 'Meditation';
    WHEN 'pilates' THEN RETURN 'Pilates';
    WHEN 'running' THEN RETURN 'Running';
    WHEN 'cycling' THEN RETURN 'Cycling';
    WHEN 'personal training' THEN RETURN 'Personal Training';
    WHEN 'nutrition' THEN RETURN 'Nutrition';
    WHEN 'weight training' THEN RETURN 'Weight Training';
    WHEN 'cardio' THEN RETURN 'Cardio';
    WHEN 'stretching' THEN RETURN 'Stretching';
    WHEN 'mindfulness' THEN RETURN 'Mindfulness';
    WHEN 'stress management' THEN RETURN 'Stress Management';
    WHEN 'mental health' THEN RETURN 'Mental Health';
    WHEN 'first aid' THEN RETURN 'First Aid';
    WHEN 'cpr' THEN RETURN 'CPR';
    WHEN 'physical therapy' THEN RETURN 'Physical Therapy';
    WHEN 'massage therapy' THEN RETURN 'Massage Therapy';
    WHEN 'acupuncture' THEN RETURN 'Acupuncture';
    WHEN 'herbal medicine' THEN RETURN 'Herbal Medicine';
    WHEN 'baking' THEN RETURN 'Baking';
    WHEN 'cooking' THEN RETURN 'Cooking';
    WHEN 'vegan cooking' THEN RETURN 'Vegan Cooking';
    WHEN 'grilling' THEN RETURN 'Grilling';
    WHEN 'pastry' THEN RETURN 'Pastry';
    WHEN 'meal prep' THEN RETURN 'Meal Prep';
    WHEN 'food photography' THEN RETURN 'Food Photography';
    WHEN 'wine tasting' THEN RETURN 'Wine Tasting';
    WHEN 'bartending' THEN RETURN 'Bartending';
    WHEN 'coffee making' THEN RETURN 'Coffee Making';
    WHEN 'sushi making' THEN RETURN 'Sushi Making';
    WHEN 'bread making' THEN RETURN 'Bread Making';
    WHEN 'cake decorating' THEN RETURN 'Cake Decorating';
    WHEN 'chocolate making' THEN RETURN 'Chocolate Making';
    WHEN 'fermentation' THEN RETURN 'Fermentation';
    WHEN 'canning' THEN RETURN 'Canning';
    WHEN 'food safety' THEN RETURN 'Food Safety';
    WHEN 'menu planning' THEN RETURN 'Menu Planning';
    WHEN 'catering' THEN RETURN 'Catering';
    WHEN 'english' THEN RETURN 'English';
    WHEN 'spanish' THEN RETURN 'Spanish';
    WHEN 'french' THEN RETURN 'French';
    WHEN 'german' THEN RETURN 'German';
    WHEN 'mandarin' THEN RETURN 'Mandarin';
    WHEN 'arabic' THEN RETURN 'Arabic';
    WHEN 'russian' THEN RETURN 'Russian';
    WHEN 'japanese' THEN RETURN 'Japanese';
    WHEN 'korean' THEN RETURN 'Korean';
    WHEN 'italian' THEN RETURN 'Italian';
    WHEN 'portuguese' THEN RETURN 'Portuguese';
    WHEN 'hindi' THEN RETURN 'Hindi';
    WHEN 'turkish' THEN RETURN 'Turkish';
    WHEN 'dutch' THEN RETURN 'Dutch';
    WHEN 'swedish' THEN RETURN 'Swedish';
    WHEN 'norwegian' THEN RETURN 'Norwegian';
    WHEN 'danish' THEN RETURN 'Danish';
    WHEN 'finnish' THEN RETURN 'Finnish';
    WHEN 'polish' THEN RETURN 'Polish';
    WHEN 'czech' THEN RETURN 'Czech';
    WHEN 'hungarian' THEN RETURN 'Hungarian';
    WHEN 'greek' THEN RETURN 'Greek';
    WHEN 'hebrew' THEN RETURN 'Hebrew';
    WHEN 'thai' THEN RETURN 'Thai';
    WHEN 'vietnamese' THEN RETURN 'Vietnamese';
    WHEN 'indonesian' THEN RETURN 'Indonesian';
    WHEN 'malay' THEN RETURN 'Malay';
    WHEN 'filipino' THEN RETURN 'Filipino';
    WHEN 'time management' THEN RETURN 'Time Management';
    WHEN 'productivity' THEN RETURN 'Productivity';
    WHEN 'parenting' THEN RETURN 'Parenting';
    WHEN 'self defense' THEN RETURN 'Self Defense';
    WHEN 'budgeting' THEN RETURN 'Budgeting';
    WHEN 'tax preparation' THEN RETURN 'Tax Preparation';
    WHEN 'home maintenance' THEN RETURN 'Home Maintenance';
    WHEN 'car maintenance' THEN RETURN 'Car Maintenance';
    WHEN 'cooking basics' THEN RETURN 'Cooking Basics';
    WHEN 'cleaning' THEN RETURN 'Cleaning';
    WHEN 'organization' THEN RETURN 'Organization';
    WHEN 'planning' THEN RETURN 'Planning';
    WHEN 'communication' THEN RETURN 'Communication';
    WHEN 'conflict resolution' THEN RETURN 'Conflict Resolution';
    WHEN 'networking' THEN RETURN 'Networking';
    WHEN 'writing' THEN RETURN 'Writing';
    WHEN 'reading' THEN RETURN 'Reading';
    WHEN 'critical thinking' THEN RETURN 'Critical Thinking';
    WHEN 'problem solving' THEN RETURN 'Problem Solving';
    WHEN 'creative writing' THEN RETURN 'Creative Writing';
    WHEN 'copywriting' THEN RETURN 'Copywriting';
    WHEN 'blogging' THEN RETURN 'Blogging';
    WHEN 'editing' THEN RETURN 'Editing';
    WHEN 'storytelling' THEN RETURN 'Storytelling';
    WHEN 'resume writing' THEN RETURN 'Resume Writing';
    WHEN 'speech writing' THEN RETURN 'Speech Writing';
    WHEN 'technical writing' THEN RETURN 'Technical Writing';
    WHEN 'journalism' THEN RETURN 'Journalism';
    WHEN 'content creation' THEN RETURN 'Content Creation';
    WHEN 'social media' THEN RETURN 'Social Media';
    WHEN 'email writing' THEN RETURN 'Email Writing';
    WHEN 'grant writing' THEN RETURN 'Grant Writing';
    WHEN 'translation' THEN RETURN 'Translation';
    WHEN 'interpretation' THEN RETURN 'Interpretation';
    WHEN 'public relations' THEN RETURN 'Public Relations';
    WHEN 'entrepreneurship' THEN RETURN 'Entrepreneurship';
    WHEN 'project management' THEN RETURN 'Project Management';
    WHEN 'sales' THEN RETURN 'Sales';
    WHEN 'negotiation' THEN RETURN 'Negotiation';
    WHEN 'leadership' THEN RETURN 'Leadership';
    WHEN 'business strategy' THEN RETURN 'Business Strategy';
    WHEN 'seo' THEN RETURN 'SEO';
    WHEN 'content marketing' THEN RETURN 'Content Marketing';
    WHEN 'social media marketing' THEN RETURN 'Social Media Marketing';
    WHEN 'financial planning' THEN RETURN 'Financial Planning';
    WHEN 'investment' THEN RETURN 'Investment';
    WHEN 'stock trading' THEN RETURN 'Stock Trading';
    WHEN 'real estate' THEN RETURN 'Real Estate';
    WHEN 'consulting' THEN RETURN 'Consulting';
    WHEN 'human resources' THEN RETURN 'Human Resources';
    WHEN 'operations management' THEN RETURN 'Operations Management';
    WHEN 'supply chain management' THEN RETURN 'Supply Chain Management';
    WHEN 'mathematics' THEN RETURN 'Mathematics';
    WHEN 'physics' THEN RETURN 'Physics';
    WHEN 'chemistry' THEN RETURN 'Chemistry';
    WHEN 'biology' THEN RETURN 'Biology';
    WHEN 'statistics' THEN RETURN 'Statistics';
    WHEN 'data analysis' THEN RETURN 'Data Analysis';
    WHEN 'robotics' THEN RETURN 'Robotics';
    WHEN 'astronomy' THEN RETURN 'Astronomy';
    WHEN 'geology' THEN RETURN 'Geology';
    WHEN 'psychology' THEN RETURN 'Psychology';
    WHEN 'sociology' THEN RETURN 'Sociology';
    WHEN 'history' THEN RETURN 'History';
    WHEN 'geography' THEN RETURN 'Geography';
    WHEN 'economics' THEN RETURN 'Economics';
    WHEN 'philosophy' THEN RETURN 'Philosophy';
    WHEN 'literature' THEN RETURN 'Literature';
    WHEN 'linguistics' THEN RETURN 'Linguistics';
    WHEN 'computer science' THEN RETURN 'Computer Science';
    WHEN 'engineering' THEN RETURN 'Engineering';
    WHEN 'architecture' THEN RETURN 'Architecture';
    WHEN 'medicine' THEN RETURN 'Medicine';
    WHEN 'nursing' THEN RETURN 'Nursing';
    WHEN 'soccer' THEN RETURN 'Soccer';
    WHEN 'basketball' THEN RETURN 'Basketball';
    WHEN 'tennis' THEN RETURN 'Tennis';
    WHEN 'martial arts' THEN RETURN 'Martial Arts';
    WHEN 'golf' THEN RETURN 'Golf';
    WHEN 'baseball' THEN RETURN 'Baseball';
    WHEN 'table tennis' THEN RETURN 'Table Tennis';
    WHEN 'volleyball' THEN RETURN 'Volleyball';
    WHEN 'chess' THEN RETURN 'Chess';
    WHEN 'rock climbing' THEN RETURN 'Rock Climbing';
    WHEN 'hiking' THEN RETURN 'Hiking';
    WHEN 'skiing' THEN RETURN 'Skiing';
    WHEN 'snowboarding' THEN RETURN 'Snowboarding';
    WHEN 'surfing' THEN RETURN 'Surfing';
    WHEN 'skateboarding' THEN RETURN 'Skateboarding';
    WHEN 'dancing' THEN RETURN 'Dancing';
    WHEN 'gymnastics' THEN RETURN 'Gymnastics';
    WHEN 'boxing' THEN RETURN 'Boxing';
    WHEN 'wrestling' THEN RETURN 'Wrestling';
    WHEN 'archery' THEN RETURN 'Archery';
    WHEN 'fishing' THEN RETURN 'Fishing';
    WHEN 'hunting' THEN RETURN 'Hunting';
    WHEN 'camping' THEN RETURN 'Camping';
    WHEN 'travel planning' THEN RETURN 'Travel Planning';
    WHEN 'cultural awareness' THEN RETURN 'Cultural Awareness';
    WHEN 'world cuisine' THEN RETURN 'World Cuisine';
    WHEN 'videography' THEN RETURN 'Videography';
    WHEN 'language learning' THEN RETURN 'Language Learning';
    WHEN 'cultural exchange' THEN RETURN 'Cultural Exchange';
    WHEN 'tourism' THEN RETURN 'Tourism';
    WHEN 'hospitality' THEN RETURN 'Hospitality';
    WHEN 'event planning' THEN RETURN 'Event Planning';
    WHEN 'international relations' THEN RETURN 'International Relations';
    WHEN 'cultural studies' THEN RETURN 'Cultural Studies';
    WHEN 'anthropology' THEN RETURN 'Anthropology';
    WHEN 'archaeology' THEN RETURN 'Archaeology';
    WHEN 'museum studies' THEN RETURN 'Museum Studies';
    WHEN 'knitting' THEN RETURN 'Knitting';
    WHEN 'sewing' THEN RETURN 'Sewing';
    WHEN 'woodworking' THEN RETURN 'Woodworking';
    WHEN 'pottery' THEN RETURN 'Pottery';
    WHEN 'origami' THEN RETURN 'Origami';
    WHEN 'jewelry making' THEN RETURN 'Jewelry Making';
    WHEN 'scrapbooking' THEN RETURN 'Scrapbooking';
    WHEN 'candle making' THEN RETURN 'Candle Making';
    WHEN 'soap making' THEN RETURN 'Soap Making';
    WHEN 'gardening' THEN RETURN 'Gardening';
    WHEN 'beekeeping' THEN RETURN 'Beekeeping';
    WHEN 'carpentry' THEN RETURN 'Carpentry';
    WHEN 'metalworking' THEN RETURN 'Metalworking';
    WHEN 'leather crafting' THEN RETURN 'Leather Crafting';
    WHEN 'glass blowing' THEN RETURN 'Glass Blowing';
    WHEN 'weaving' THEN RETURN 'Weaving';
    WHEN 'embroidery' THEN RETURN 'Embroidery';
    WHEN 'cross-stitch' THEN RETURN 'Cross-stitch';
    WHEN 'quilting' THEN RETURN 'Quilting';
    WHEN 'macrame' THEN RETURN 'Macrame';
    WHEN 'paper crafting' THEN RETURN 'Paper Crafting';
    ELSE RETURN INITCAP(skill_name); -- Default: capitalize first letter
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- 11. Create a function to validate and fix user skills
CREATE OR REPLACE FUNCTION validate_user_skills(user_skills JSONB)
RETURNS JSONB AS $$
DECLARE
  skill TEXT;
  normalized_skill TEXT;
  valid_skills JSONB := '[]'::JSONB;
BEGIN
  -- If skills is null or empty, return empty array
  IF user_skills IS NULL OR user_skills = '[]'::JSONB OR user_skills = 'null'::JSONB THEN
    RETURN '[]'::JSONB;
  END IF;
  
  -- Process each skill
  FOR skill IN SELECT jsonb_array_elements_text(user_skills)
  LOOP
    -- Normalize the skill name
    normalized_skill := normalize_skill_name(skill);
    
    -- Check if the normalized skill exists in our skills table
    IF EXISTS (SELECT 1 FROM skills WHERE LOWER(name) = LOWER(normalized_skill)) THEN
      valid_skills := valid_skills || to_jsonb(normalized_skill);
    END IF;
  END LOOP;
  
  RETURN valid_skills;
END;
$$ LANGUAGE plpgsql;

-- 12. Update all user profiles to use validated skills
UPDATE profiles 
SET skills_to_teach = validate_user_skills(skills_to_teach),
    updated_at = NOW()
WHERE skills_to_teach IS NOT NULL 
  AND skills_to_teach != '[]'::jsonb 
  AND skills_to_teach != 'null'::jsonb;

-- 13. Final verification
SELECT 'Final skills count:' as info, COUNT(*) as count FROM skills;
SELECT 'Skills with proper names:' as info, COUNT(*) as count FROM skills WHERE name = TRIM(name);
SELECT 'Skills with valid categories:' as info, COUNT(*) as count FROM skills WHERE category IN (
  'Programming & Tech', 'Languages', 'Music & Arts', 'Business & Professional',
  'Health & Wellness', 'Culinary Arts', 'Science & Education', 'Crafts & DIY',
  'Sports & Recreation', 'Life Skills', 'Writing & Communication', 'Travel & Culture', 'Other'
);

-- 14. Create an index for better search performance
CREATE INDEX IF NOT EXISTS idx_skills_name_lower ON skills(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_profiles_skills_gin ON profiles USING GIN(skills_to_teach);

-- 15. Summary
SELECT 'Database cleanup completed successfully!' as message; 