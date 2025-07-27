-- Create skills table for centralized skill management
CREATE TABLE IF NOT EXISTS public.skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skill categories table
CREATE TABLE IF NOT EXISTS public.skill_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  emoji TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for skills table
CREATE POLICY "Skills are publicly readable" 
ON public.skills FOR SELECT USING (true);

CREATE POLICY "Only admins can modify skills" 
ON public.skills FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for skill_categories table
CREATE POLICY "Skill categories are publicly readable" 
ON public.skill_categories FOR SELECT USING (true);

CREATE POLICY "Only admins can modify skill categories" 
ON public.skill_categories FOR ALL USING (auth.role() = 'authenticated');

-- Insert default skill categories
INSERT INTO public.skill_categories (name, emoji, description, sort_order) VALUES
('Programming & Tech', '💻', 'Programming languages, frameworks, and technology skills', 1),
('Languages', '🗣️', 'Spoken and written languages', 2),
('Music & Arts', '🎵', 'Musical instruments, performance, and visual arts', 3),
('Business & Professional', '💼', 'Business, management, and professional development skills', 4),
('Health & Wellness', '🧘', 'Physical fitness, mental health, and wellness practices', 5),
('Culinary Arts', '🍳', 'Cooking, baking, and food preparation skills', 6),
('Science & Education', '🔬', 'Academic subjects and scientific disciplines', 7),
('Crafts & DIY', '🛠️', 'Handcrafts, DIY projects, and creative hobbies', 8),
('Sports & Recreation', '⚽', 'Sports, outdoor activities, and recreational pursuits', 9),
('Life Skills', '🎯', 'Essential life skills and personal development', 10),
('Writing & Communication', '✍️', 'Writing, communication, and content creation', 11),
('Travel & Culture', '✈️', 'Travel, cultural understanding, and global perspectives', 12),
('Other', '📝', 'Custom skills that don''t fit other categories', 13)
ON CONFLICT (name) DO NOTHING;

-- Insert default skills
INSERT INTO public.skills (name, category, emoji, description) VALUES
-- Programming & Tech
('Python', 'Programming & Tech', '🐍', 'Python programming language'),
('JavaScript', 'Programming & Tech', '📜', 'JavaScript programming language'),
('Java', 'Programming & Tech', '☕', 'Java programming language'),
('C++', 'Programming & Tech', '⚡', 'C++ programming language'),
('C#', 'Programming & Tech', '🎯', 'C# programming language'),
('TypeScript', 'Programming & Tech', '📘', 'TypeScript programming language'),
('Go', 'Programming & Tech', '🐹', 'Go programming language'),
('Rust', 'Programming & Tech', '🦀', 'Rust programming language'),
('PHP', 'Programming & Tech', '🐘', 'PHP programming language'),
('Ruby', 'Programming & Tech', '💎', 'Ruby programming language'),
('Swift', 'Programming & Tech', '🦅', 'Swift programming language'),
('Kotlin', 'Programming & Tech', '🟠', 'Kotlin programming language'),
('SQL', 'Programming & Tech', '🗄️', 'SQL database language'),
('HTML', 'Programming & Tech', '🌐', 'HTML markup language'),
('CSS', 'Programming & Tech', '🎨', 'CSS styling language'),
('React', 'Programming & Tech', '⚛️', 'React JavaScript framework'),
('Vue.js', 'Programming & Tech', '💚', 'Vue.js JavaScript framework'),
('Angular', 'Programming & Tech', '🅰️', 'Angular JavaScript framework'),
('Node.js', 'Programming & Tech', '🟢', 'Node.js JavaScript runtime'),
('Django', 'Programming & Tech', '🐍', 'Django Python framework'),
('Flask', 'Programming & Tech', '🍶', 'Flask Python framework'),
('Spring', 'Programming & Tech', '🌱', 'Spring Java framework'),
('Laravel', 'Programming & Tech', '🐘', 'Laravel PHP framework'),
('Express.js', 'Programming & Tech', '🚂', 'Express.js Node.js framework'),
('Web Development', 'Programming & Tech', '🌐', 'Web development skills'),
('Mobile Development', 'Programming & Tech', '📱', 'Mobile app development'),
('DevOps', 'Programming & Tech', '🔧', 'DevOps practices'),
('Machine Learning', 'Programming & Tech', '🤖', 'Machine learning'),
('Artificial Intelligence', 'Programming & Tech', '🧠', 'Artificial intelligence'),
('Data Science', 'Programming & Tech', '📊', 'Data science'),
('Cloud Computing', 'Programming & Tech', '☁️', 'Cloud computing'),
('Cybersecurity', 'Programming & Tech', '🔒', 'Cybersecurity'),
('Blockchain', 'Programming & Tech', '⛓️', 'Blockchain technology'),
('UI/UX Design', 'Programming & Tech', '🎨', 'User interface and experience design'),
('Game Development', 'Programming & Tech', '🎮', 'Game development'),
('IoT', 'Programming & Tech', '🌐', 'Internet of Things'),
('AR/VR', 'Programming & Tech', '🥽', 'Augmented and virtual reality'),

-- Languages
('English', 'Languages', '🇺🇸', 'English language'),
('Spanish', 'Languages', '🇪🇸', 'Spanish language'),
('French', 'Languages', '🇫🇷', 'French language'),
('German', 'Languages', '🇩🇪', 'German language'),
('Mandarin', 'Languages', '🇨🇳', 'Mandarin Chinese'),
('Arabic', 'Languages', '🇸🇦', 'Arabic language'),
('Russian', 'Languages', '🇷🇺', 'Russian language'),
('Japanese', 'Languages', '🇯🇵', 'Japanese language'),
('Korean', 'Languages', '🇰🇷', 'Korean language'),
('Italian', 'Languages', '🇮🇹', 'Italian language'),
('Portuguese', 'Languages', '🇵🇹', 'Portuguese language'),
('Hindi', 'Languages', '🇮🇳', 'Hindi language'),
('Turkish', 'Languages', '🇹🇷', 'Turkish language'),
('Dutch', 'Languages', '🇳🇱', 'Dutch language'),
('Swedish', 'Languages', '🇸🇪', 'Swedish language'),
('Norwegian', 'Languages', '🇳🇴', 'Norwegian language'),
('Danish', 'Languages', '🇩🇰', 'Danish language'),
('Finnish', 'Languages', '🇫🇮', 'Finnish language'),
('Polish', 'Languages', '🇵🇱', 'Polish language'),
('Czech', 'Languages', '🇨🇿', 'Czech language'),
('Hungarian', 'Languages', '🇭🇺', 'Hungarian language'),
('Greek', 'Languages', '🇬🇷', 'Greek language'),
('Hebrew', 'Languages', '🇮🇱', 'Hebrew language'),
('Thai', 'Languages', '🇹🇭', 'Thai language'),
('Vietnamese', 'Languages', '🇻🇳', 'Vietnamese language'),
('Indonesian', 'Languages', '🇮🇩', 'Indonesian language'),
('Malay', 'Languages', '🇲🇾', 'Malay language'),
('Filipino', 'Languages', '🇵🇭', 'Filipino language'),

-- Music & Arts
('Guitar', 'Music & Arts', '🎸', 'Guitar playing'),
('Piano', 'Music & Arts', '🎹', 'Piano playing'),
('Singing', 'Music & Arts', '🎤', 'Vocal singing'),
('Drums', 'Music & Arts', '🥁', 'Drum playing'),
('Violin', 'Music & Arts', '🎻', 'Violin playing'),
('Bass', 'Music & Arts', '🎸', 'Bass guitar'),
('Saxophone', 'Music & Arts', '🎷', 'Saxophone playing'),
('Trumpet', 'Music & Arts', '🎺', 'Trumpet playing'),
('Flute', 'Music & Arts', '🎵', 'Flute playing'),
('Clarinet', 'Music & Arts', '🎵', 'Clarinet playing'),
('Cello', 'Music & Arts', '🎻', 'Cello playing'),
('Ukulele', 'Music & Arts', '🎸', 'Ukulele playing'),
('Harmonica', 'Music & Arts', '🎵', 'Harmonica playing'),
('DJing', 'Music & Arts', '🎧', 'DJ mixing'),
('Music Production', 'Music & Arts', '🎵', 'Music production'),
('Composition', 'Music & Arts', '🎼', 'Music composition'),
('Music Theory', 'Music & Arts', '🎵', 'Music theory'),
('Drawing', 'Music & Arts', '✏️', 'Drawing and sketching'),
('Painting', 'Music & Arts', '🎨', 'Painting'),
('Graphic Design', 'Music & Arts', '🎨', 'Graphic design'),
('Photography', 'Music & Arts', '📷', 'Photography'),
('Illustration', 'Music & Arts', '✏️', 'Illustration'),
('Animation', 'Music & Arts', '🎬', 'Animation'),
('3D Modeling', 'Music & Arts', '🎨', '3D modeling'),
('Digital Art', 'Music & Arts', '🎨', 'Digital art'),
('Sculpture', 'Music & Arts', '🗿', 'Sculpture'),
('Fashion Design', 'Music & Arts', '👗', 'Fashion design'),
('Interior Design', 'Music & Arts', '🏠', 'Interior design'),

-- Business & Professional
('Marketing', 'Business & Professional', '📢', 'Marketing strategies'),
('Public Speaking', 'Business & Professional', '🎤', 'Public speaking'),
('Entrepreneurship', 'Business & Professional', '💼', 'Entrepreneurship'),
('Finance', 'Business & Professional', '💰', 'Financial management'),
('Accounting', 'Business & Professional', '📊', 'Accounting'),
('Project Management', 'Business & Professional', '📋', 'Project management'),
('Sales', 'Business & Professional', '💼', 'Sales techniques'),
('Negotiation', 'Business & Professional', '🤝', 'Negotiation skills'),
('Leadership', 'Business & Professional', '👑', 'Leadership skills'),
('Business Strategy', 'Business & Professional', '📈', 'Business strategy'),
('Digital Marketing', 'Business & Professional', '📱', 'Digital marketing'),
('SEO', 'Business & Professional', '🔍', 'Search engine optimization'),
('Content Marketing', 'Business & Professional', '📝', 'Content marketing'),
('Social Media Marketing', 'Business & Professional', '📱', 'Social media marketing'),
('Financial Planning', 'Business & Professional', '📊', 'Financial planning'),
('Investment', 'Business & Professional', '📈', 'Investment strategies'),
('Stock Trading', 'Business & Professional', '📊', 'Stock trading'),
('Real Estate', 'Business & Professional', '🏠', 'Real estate'),
('Consulting', 'Business & Professional', '💼', 'Business consulting'),
('Human Resources', 'Business & Professional', '👥', 'Human resources'),
('Operations Management', 'Business & Professional', '⚙️', 'Operations management'),
('Supply Chain Management', 'Business & Professional', '📦', 'Supply chain management'),

-- Health & Wellness
('Yoga', 'Health & Wellness', '🧘', 'Yoga practice'),
('Fitness', 'Health & Wellness', '💪', 'Physical fitness'),
('Swimming', 'Health & Wellness', '🏊', 'Swimming'),
('Meditation', 'Health & Wellness', '🧘', 'Meditation'),
('Pilates', 'Health & Wellness', '🧘', 'Pilates'),
('Running', 'Health & Wellness', '🏃', 'Running'),
('Cycling', 'Health & Wellness', '🚴', 'Cycling'),
('Personal Training', 'Health & Wellness', '💪', 'Personal training'),
('Nutrition', 'Health & Wellness', '🥗', 'Nutrition'),
('Weight Training', 'Health & Wellness', '🏋️', 'Weight training'),
('Cardio', 'Health & Wellness', '❤️', 'Cardiovascular exercise'),
('Stretching', 'Health & Wellness', '🧘', 'Stretching exercises'),
('Mindfulness', 'Health & Wellness', '🧘', 'Mindfulness practice'),
('Stress Management', 'Health & Wellness', '😌', 'Stress management'),
('Mental Health', 'Health & Wellness', '🧠', 'Mental health'),
('First Aid', 'Health & Wellness', '🩹', 'First aid'),
('CPR', 'Health & Wellness', '💓', 'CPR certification'),
('Physical Therapy', 'Health & Wellness', '🏥', 'Physical therapy'),
('Massage Therapy', 'Health & Wellness', '💆', 'Massage therapy'),
('Acupuncture', 'Health & Wellness', '🪡', 'Acupuncture'),
('Herbal Medicine', 'Health & Wellness', '🌿', 'Herbal medicine'),

-- Culinary Arts
('Baking', 'Culinary Arts', '🍰', 'Baking'),
('Cooking', 'Culinary Arts', '👨‍🍳', 'Cooking'),
('Nutrition', 'Culinary Arts', '🥗', 'Nutrition'),
('Vegan Cooking', 'Culinary Arts', '🌱', 'Vegan cooking'),
('Grilling', 'Culinary Arts', '🔥', 'Grilling'),
('Pastry', 'Culinary Arts', '🥐', 'Pastry making'),
('Meal Prep', 'Culinary Arts', '🥘', 'Meal preparation'),
('Food Photography', 'Culinary Arts', '📷', 'Food photography'),
('Wine Tasting', 'Culinary Arts', '🍷', 'Wine tasting'),
('Bartending', 'Culinary Arts', '🍸', 'Bartending'),
('Coffee Making', 'Culinary Arts', '☕', 'Coffee making'),
('Sushi Making', 'Culinary Arts', '🍣', 'Sushi making'),
('Bread Making', 'Culinary Arts', '🍞', 'Bread making'),
('Cake Decorating', 'Culinary Arts', '🎂', 'Cake decorating'),
('Chocolate Making', 'Culinary Arts', '🍫', 'Chocolate making'),
('Fermentation', 'Culinary Arts', '🥬', 'Food fermentation'),
('Canning', 'Culinary Arts', '🥫', 'Food canning'),
('Food Safety', 'Culinary Arts', '🛡️', 'Food safety'),
('Menu Planning', 'Culinary Arts', '📋', 'Menu planning'),
('Catering', 'Culinary Arts', '🍽️', 'Catering'),

-- Science & Education
('Mathematics', 'Science & Education', '📐', 'Mathematics'),
('Physics', 'Science & Education', '⚛️', 'Physics'),
('Chemistry', 'Science & Education', '🧪', 'Chemistry'),
('Biology', 'Science & Education', '🧬', 'Biology'),
('Statistics', 'Science & Education', '📊', 'Statistics'),
('Data Analysis', 'Science & Education', '📈', 'Data analysis'),
('Robotics', 'Science & Education', '🤖', 'Robotics'),
('Astronomy', 'Science & Education', '🌌', 'Astronomy'),
('Geology', 'Science & Education', '🌍', 'Geology'),
('Psychology', 'Science & Education', '🧠', 'Psychology'),
('Sociology', 'Science & Education', '👥', 'Sociology'),
('History', 'Science & Education', '📚', 'History'),
('Geography', 'Science & Education', '🌍', 'Geography'),
('Economics', 'Science & Education', '💰', 'Economics'),
('Philosophy', 'Science & Education', '🤔', 'Philosophy'),
('Literature', 'Science & Education', '📖', 'Literature'),
('Linguistics', 'Science & Education', '🗣️', 'Linguistics'),
('Computer Science', 'Science & Education', '💻', 'Computer science'),
('Engineering', 'Science & Education', '⚙️', 'Engineering'),
('Architecture', 'Science & Education', '🏗️', 'Architecture'),
('Medicine', 'Science & Education', '🏥', 'Medicine'),
('Nursing', 'Science & Education', '👩‍⚕️', 'Nursing'),

-- Crafts & DIY
('Knitting', 'Crafts & DIY', '🧶', 'Knitting'),
('Sewing', 'Crafts & DIY', '🧵', 'Sewing'),
('Woodworking', 'Crafts & DIY', '🪵', 'Woodworking'),
('Pottery', 'Crafts & DIY', '🏺', 'Pottery'),
('Origami', 'Crafts & DIY', '📄', 'Origami'),
('Jewelry Making', 'Crafts & DIY', '💍', 'Jewelry making'),
('Scrapbooking', 'Crafts & DIY', '📒', 'Scrapbooking'),
('Candle Making', 'Crafts & DIY', '🕯️', 'Candle making'),
('Soap Making', 'Crafts & DIY', '🧼', 'Soap making'),
('Gardening', 'Crafts & DIY', '🌱', 'Gardening'),
('Beekeeping', 'Crafts & DIY', '🐝', 'Beekeeping'),
('Carpentry', 'Crafts & DIY', '🔨', 'Carpentry'),
('Metalworking', 'Crafts & DIY', '⚒️', 'Metalworking'),
('Leather Crafting', 'Crafts & DIY', '👜', 'Leather crafting'),
('Glass Blowing', 'Crafts & DIY', '🫖', 'Glass blowing'),
('Weaving', 'Crafts & DIY', '🧵', 'Weaving'),
('Embroidery', 'Crafts & DIY', '🪡', 'Embroidery'),
('Cross-stitch', 'Crafts & DIY', '🪡', 'Cross-stitch'),
('Quilting', 'Crafts & DIY', '🧵', 'Quilting'),
('Macrame', 'Crafts & DIY', '🪢', 'Macrame'),
('Paper Crafting', 'Crafts & DIY', '📄', 'Paper crafting'),

-- Sports & Recreation
('Soccer', 'Sports & Recreation', '⚽', 'Soccer'),
('Basketball', 'Sports & Recreation', '🏀', 'Basketball'),
('Tennis', 'Sports & Recreation', '🎾', 'Tennis'),
('Martial Arts', 'Sports & Recreation', '🥋', 'Martial arts'),
('Golf', 'Sports & Recreation', '⛳', 'Golf'),
('Baseball', 'Sports & Recreation', '⚾', 'Baseball'),
('Table Tennis', 'Sports & Recreation', '🏓', 'Table tennis'),
('Volleyball', 'Sports & Recreation', '🏐', 'Volleyball'),
('Chess', 'Sports & Recreation', '♟️', 'Chess'),
('Swimming', 'Sports & Recreation', '🏊', 'Swimming'),
('Rock Climbing', 'Sports & Recreation', '🧗', 'Rock climbing'),
('Hiking', 'Sports & Recreation', '🏔️', 'Hiking'),
('Skiing', 'Sports & Recreation', '⛷️', 'Skiing'),
('Snowboarding', 'Sports & Recreation', '🏂', 'Snowboarding'),
('Surfing', 'Sports & Recreation', '🏄', 'Surfing'),
('Skateboarding', 'Sports & Recreation', '🛹', 'Skateboarding'),
('Dancing', 'Sports & Recreation', '💃', 'Dancing'),
('Gymnastics', 'Sports & Recreation', '🤸', 'Gymnastics'),
('Boxing', 'Sports & Recreation', '🥊', 'Boxing'),
('Wrestling', 'Sports & Recreation', '🤼', 'Wrestling'),
('Archery', 'Sports & Recreation', '🏹', 'Archery'),
('Fishing', 'Sports & Recreation', '🎣', 'Fishing'),
('Hunting', 'Sports & Recreation', '🏹', 'Hunting'),
('Camping', 'Sports & Recreation', '⛺', 'Camping'),

-- Life Skills
('Time Management', 'Life Skills', '⏰', 'Time management'),
('Productivity', 'Life Skills', '📈', 'Productivity'),
('Mindfulness', 'Life Skills', '🧘', 'Mindfulness'),
('Parenting', 'Life Skills', '👨‍👩‍👧‍👦', 'Parenting'),
('Self Defense', 'Life Skills', '🥋', 'Self defense'),
('Financial Planning', 'Life Skills', '💰', 'Financial planning'),
('Budgeting', 'Life Skills', '📊', 'Budgeting'),
('Tax Preparation', 'Life Skills', '📋', 'Tax preparation'),
('Home Maintenance', 'Life Skills', '🏠', 'Home maintenance'),
('Car Maintenance', 'Life Skills', '🚗', 'Car maintenance'),
('Cooking Basics', 'Life Skills', '👨‍🍳', 'Basic cooking'),
('Cleaning', 'Life Skills', '🧹', 'Cleaning'),
('Organization', 'Life Skills', '📁', 'Organization'),
('Planning', 'Life Skills', '📋', 'Planning'),
('Communication', 'Life Skills', '💬', 'Communication'),
('Conflict Resolution', 'Life Skills', '🤝', 'Conflict resolution'),
('Networking', 'Life Skills', '🌐', 'Networking'),
('Public Speaking', 'Life Skills', '🎤', 'Public speaking'),
('Writing', 'Life Skills', '✍️', 'Writing'),
('Reading', 'Life Skills', '📖', 'Reading'),
('Critical Thinking', 'Life Skills', '🤔', 'Critical thinking'),
('Problem Solving', 'Life Skills', '🧩', 'Problem solving'),

-- Writing & Communication
('Creative Writing', 'Writing & Communication', '✍️', 'Creative writing'),
('Copywriting', 'Writing & Communication', '📝', 'Copywriting'),
('Blogging', 'Writing & Communication', '📝', 'Blogging'),
('Editing', 'Writing & Communication', '✏️', 'Editing'),
('Storytelling', 'Writing & Communication', '📖', 'Storytelling'),
('Resume Writing', 'Writing & Communication', '📄', 'Resume writing'),
('Speech Writing', 'Writing & Communication', '🎤', 'Speech writing'),
('Technical Writing', 'Writing & Communication', '📋', 'Technical writing'),
('Journalism', 'Writing & Communication', '📰', 'Journalism'),
('Content Creation', 'Writing & Communication', '📝', 'Content creation'),
('Social Media', 'Writing & Communication', '📱', 'Social media'),
('Email Writing', 'Writing & Communication', '📧', 'Email writing'),
('Grant Writing', 'Writing & Communication', '📄', 'Grant writing'),
('Translation', 'Writing & Communication', '🌐', 'Translation'),
('Interpretation', 'Writing & Communication', '🗣️', 'Interpretation'),
('Public Relations', 'Writing & Communication', '📢', 'Public relations'),
('Advertising', 'Writing & Communication', '📢', 'Advertising'),

-- Travel & Culture
('Travel Planning', 'Travel & Culture', '✈️', 'Travel planning'),
('Cultural Awareness', 'Travel & Culture', '🌍', 'Cultural awareness'),
('History', 'Travel & Culture', '📚', 'History'),
('Geography', 'Travel & Culture', '🌍', 'Geography'),
('World Cuisine', 'Travel & Culture', '🍽️', 'World cuisine'),
('Photography', 'Travel & Culture', '📷', 'Photography'),
('Videography', 'Travel & Culture', '📹', 'Videography'),
('Language Learning', 'Travel & Culture', '🗣️', 'Language learning'),
('Cultural Exchange', 'Travel & Culture', '🤝', 'Cultural exchange'),
('Tourism', 'Travel & Culture', '🏖️', 'Tourism'),
('Hospitality', 'Travel & Culture', '🏨', 'Hospitality'),
('Event Planning', 'Travel & Culture', '📅', 'Event planning'),
('International Relations', 'Travel & Culture', '🌐', 'International relations'),
('Cultural Studies', 'Travel & Culture', '📚', 'Cultural studies'),
('Anthropology', 'Travel & Culture', '👥', 'Anthropology'),
('Archaeology', 'Travel & Culture', '🏺', 'Archaeology'),
('Museum Studies', 'Travel & Culture', '🏛️', 'Museum studies')
ON CONFLICT (name) DO NOTHING;

-- Create function to get all skills
CREATE OR REPLACE FUNCTION get_all_skills()
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  category TEXT,
  emoji TEXT,
  description TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT id, name, category, emoji, description
  FROM public.skills
  WHERE is_active = true
  ORDER BY category, name;
$$;

-- Create function to get skills by category
CREATE OR REPLACE FUNCTION get_skills_by_category(category_name TEXT)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  category TEXT,
  emoji TEXT,
  description TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT id, name, category, emoji, description
  FROM public.skills
  WHERE category = category_name AND is_active = true
  ORDER BY name;
$$;

-- Create function to find category for a skill
CREATE OR REPLACE FUNCTION find_category_for_skill(skill_name TEXT)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT category
  FROM public.skills
  WHERE LOWER(name) = LOWER(skill_name) AND is_active = true
  LIMIT 1;
$$;

-- Grant permissions
GRANT SELECT ON public.skills TO authenticated;
GRANT SELECT ON public.skill_categories TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_skills() TO authenticated;
GRANT EXECUTE ON FUNCTION get_skills_by_category(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION find_category_for_skill(TEXT) TO authenticated; 