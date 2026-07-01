-- KidhrCode Database Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Courses
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner',
  creator_id UUID REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT false,
  modules_count INTEGER DEFAULT 0,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Modules
CREATE TABLE modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lessons
CREATE TABLE lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  exercise_type TEXT NOT NULL DEFAULT 'lesson',
  config JSONB DEFAULT '{}',
  difficulty TEXT DEFAULT 'easy',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Progress
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  xp_earned INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 1,
  language TEXT,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Achievements / Badges
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT
);

-- User Achievements
CREATE TABLE user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Leaderboard
CREATE TABLE leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  period TEXT DEFAULT 'all_time',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Streaks
CREATE TABLE user_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Published courses are public" ON courses FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can all courses" ON courses FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Creators can manage own courses" ON courses FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Modules are viewable" ON modules FOR SELECT USING (true);
CREATE POLICY "Lessons are viewable" ON lessons FOR SELECT USING (true);
CREATE POLICY "Users view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users earn achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Leaderboard is public" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Users view own streak" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own streak" ON user_streaks FOR ALL USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS trigger AS $$
BEGIN
  INSERT INTO leaderboard (user_id, username, xp, level, period)
  VALUES (
    NEW.user_id,
    (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = NEW.user_id),
    (SELECT COALESCE(SUM(xp_earned), 0) FROM user_progress WHERE user_id = NEW.user_id),
    GREATEST(1, FLOOR(SQRT((SELECT COALESCE(SUM(xp_earned), 0) FROM user_progress WHERE user_id = NEW.user_id) / 100)) + 1),
    'all_time'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    xp = (SELECT COALESCE(SUM(xp_earned), 0) FROM user_progress WHERE user_id = NEW.user_id),
    level = GREATEST(1, FLOOR(SQRT((SELECT COALESCE(SUM(xp_earned), 0) FROM user_progress WHERE user_id = NEW.user_id) / 100)) + 1),
    username = (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = NEW.user_id),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_progress_update
  AFTER INSERT OR UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_leaderboard();

-- Seed default achievements
INSERT INTO achievements (name, description, icon) VALUES
  ('First Code', 'Complete your first exercise', '🌟'),
  ('Getting Started', '3-day streak', '🔥'),
  ('Week Warrior', '7-day streak', '🔥'),
  ('Monthly Master', '30-day streak', '💪'),
  ('Polyglot', 'Complete courses in 3 languages', '🗣️'),
  ('Language Master', 'Complete courses in 5 languages', '🌍'),
  ('Speed Demon', 'Complete 10 timed challenges', '⚡'),
  ('Bug Hunter', 'Fix 50 bugs', '🐛'),
  ('Perfectionist', 'Get 100% on 10 exercises', '✨'),
  ('Contributor', 'Create your first course', '📚'),
  ('Centurion', 'Complete 100 exercises', '💯'),
  ('Course Completer', 'Finish your first course', '🎓');
