-- Fix Missing Tables - Run in Supabase Dashboard → SQL Editor

-- 1. Create skills table
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

-- 2. Create user_skills table
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_level TEXT DEFAULT 'beginner',
  is_teaching BOOLEAN DEFAULT false,
  is_learning BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_skills_name ON public.skills(name);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON public.user_skills(skill_id);

-- 4. Disable RLS to prevent permission issues
ALTER TABLE public.skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills DISABLE ROW LEVEL SECURITY;

-- 5. Insert default skills
INSERT INTO public.skills (name, category, emoji, description) VALUES
-- Programming & Tech
('Python', 'Programming & Tech', '🐍', 'Python programming language'),
('JavaScript', 'Programming & Tech', '📜', 'JavaScript programming language'),
('React', 'Programming & Tech', '⚛️', 'React JavaScript framework'),
('TypeScript', 'Programming & Tech', '📘', 'TypeScript programming language'),
('Node.js', 'Programming & Tech', '🟢', 'Node.js runtime environment'),
('HTML', 'Programming & Tech', '🌐', 'HTML markup language'),
('CSS', 'Programming & Tech', '🎨', 'CSS styling language'),
('SQL', 'Programming & Tech', '🗄️', 'SQL database language'),
('Git', 'Programming & Tech', '📝', 'Git version control'),
('Docker', 'Programming & Tech', '🐳', 'Docker containerization'),

-- Languages
('English', 'Languages', '🇺🇸', 'English language'),
('Arabic', 'Languages', '🇸🇦', 'Arabic language'),
('Spanish', 'Languages', '🇪🇸', 'Spanish language'),
('French', 'Languages', '🇫🇷', 'French language'),
('German', 'Languages', '🇩🇪', 'German language'),
('Chinese', 'Languages', '🇨🇳', 'Chinese language'),
('Japanese', 'Languages', '🇯🇵', 'Japanese language'),
('Korean', 'Languages', '🇰🇷', 'Korean language'),
('Italian', 'Languages', '🇮🇹', 'Italian language'),
('Portuguese', 'Languages', '🇵🇹', 'Portuguese language'),

-- Music & Arts
('Guitar', 'Music & Arts', '🎸', 'Guitar playing'),
('Piano', 'Music & Arts', '🎹', 'Piano playing'),
('Violin', 'Music & Arts', '🎻', 'Violin playing'),
('Drums', 'Music & Arts', '🥁', 'Drum playing'),
('Singing', 'Music & Arts', '🎤', 'Vocal singing'),
('Drawing', 'Music & Arts', '✏️', 'Drawing and sketching'),
('Painting', 'Music & Arts', '🎨', 'Painting techniques'),
('Photography', 'Music & Arts', '📷', 'Photography skills'),
('Digital Art', 'Music & Arts', '💻', 'Digital art creation'),
('Sculpture', 'Music & Arts', '🗿', 'Sculpture making'),

-- Business & Professional
('Project Management', 'Business & Professional', '📊', 'Project management skills'),
('Marketing', 'Business & Professional', '📈', 'Marketing strategies'),
('Sales', 'Business & Professional', '💰', 'Sales techniques'),
('Leadership', 'Business & Professional', '👥', 'Leadership skills'),
('Public Speaking', 'Business & Professional', '🎤', 'Public speaking'),
('Negotiation', 'Business & Professional', '🤝', 'Negotiation skills'),
('Business Strategy', 'Business & Professional', '🎯', 'Business strategy'),
('Financial Planning', 'Business & Professional', '💼', 'Financial planning'),
('Entrepreneurship', 'Business & Professional', '🚀', 'Entrepreneurship'),

-- Health & Wellness
('Yoga', 'Health & Wellness', '🧘', 'Yoga practice'),
('Meditation', 'Health & Wellness', '🧘‍♀️', 'Meditation techniques'),
('Fitness Training', 'Health & Wellness', '💪', 'Fitness training'),
('Nutrition', 'Health & Wellness', '🥗', 'Nutrition knowledge'),
('Mental Health', 'Health & Wellness', '🧠', 'Mental health awareness'),
('Stress Management', 'Health & Wellness', '😌', 'Stress management'),

-- Culinary Arts
('Cooking', 'Culinary Arts', '👨‍🍳', 'Cooking skills'),
('Baking', 'Culinary Arts', '🍰', 'Baking techniques'),
('Pastry Making', 'Culinary Arts', '🥐', 'Pastry making'),
('Wine Tasting', 'Culinary Arts', '🍷', 'Wine tasting'),
('Food Photography', 'Culinary Arts', '📸', 'Food photography'),

-- Other Skills
('Writing', 'Writing & Communication', '✍️', 'Writing skills'),
('Blogging', 'Writing & Communication', '📝', 'Blogging'),
('Content Creation', 'Writing & Communication', '📄', 'Content creation'),
('Translation', 'Writing & Communication', '🌐', 'Translation services'),
('Creative Writing', 'Writing & Communication', '✏️', 'Creative writing')
ON CONFLICT (name) DO NOTHING;

-- 6. Verify the setup
SELECT 'Skills and user_skills tables created successfully!' as status; 