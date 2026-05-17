-- ==================================================
-- CareerDNA — Complete Supabase Database Schema
-- ==================================================
-- HOW TO USE:
-- 1. Go to https://supabase.com/dashboard
-- 2. Open your project
-- 3. Click "SQL Editor" in the left sidebar
-- 4. Paste this ENTIRE file and click "Run"
-- ==================================================


-- =====================
-- 1. PROFILES TABLE
-- =====================
-- Stores public user profile data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  headline TEXT,
  location TEXT,
  website TEXT,
  github TEXT,
  linkedin TEXT,
  twitter TEXT,
  avatar_url TEXT,
  skills TEXT[] DEFAULT '{}',
  theme TEXT DEFAULT 'dark',
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- 2. PROJECTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  github_url TEXT,
  live_url TEXT,
  thumbnail_url TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'in-progress', 'concept')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- 3. VIDEOS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  public_id TEXT, -- Cloudinary public ID
  duration FLOAT,
  type TEXT DEFAULT 'intro' CHECK (type IN ('intro', 'project', 'achievement', 'presentation')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- 4. ACHIEVEMENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  organization TEXT,
  date TEXT, -- stored as YYYY-MM for month selection
  type TEXT DEFAULT 'certificate' CHECK (type IN ('certificate', 'hackathon', 'internship', 'award', 'workshop', 'course')),
  description TEXT,
  credential_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- 5. RESUMES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  content TEXT, -- resume text content (first 5000 chars)
  ats_score INTEGER CHECK (ats_score >= 0 AND ats_score <= 100),
  analysis JSONB, -- full AI analysis results
  file_url TEXT, -- original PDF URL if uploaded to Cloudinary
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- 6. ANALYTICS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('views', 'downloads', 'clicks', 'plays')),
  count INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}'
);

-- =====================
-- 7. PROFILE VIEWS TABLE
-- =====================
-- Tracks individual profile view events
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  viewer_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ==================================================
-- This trigger automatically creates a profile row
-- whenever a new user signs up via Supabase Auth

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    -- Auto-generate username from email (before the @)
    LOWER(SPLIT_PART(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ==================================================
-- INCREMENT VIEW FUNCTION (called from frontend)
-- ==================================================
CREATE OR REPLACE FUNCTION increment_view(profile_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert a view event
  INSERT INTO profile_views (profile_id)
  VALUES (profile_id);

  -- Update or insert the analytics counter
  INSERT INTO analytics (user_id, type, count, date)
  VALUES (profile_id, 'views', 1, CURRENT_DATE)
  ON CONFLICT (user_id, type, date) DO UPDATE
    SET count = analytics.count + 1;
END;
$$;


-- ==================================================
-- ROW LEVEL SECURITY (RLS) — IMPORTANT!
-- ==================================================
-- This ensures users can ONLY see/modify their own data.
-- Without this, any user could read any other user's data!

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;


-- PROFILES: Anyone can read public profiles, only owner can edit
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (is_public = TRUE OR auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);


-- PROJECTS: Public profiles' projects are visible; only owner can modify
CREATE POLICY "Projects on public profiles are viewable"
  ON projects FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = projects.user_id AND profiles.is_public = TRUE
    )
  );

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE USING (auth.uid() = user_id);


-- VIDEOS: Same as projects
CREATE POLICY "Videos on public profiles are viewable"
  ON videos FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = videos.user_id AND profiles.is_public = TRUE
    )
  );

CREATE POLICY "Users can insert their own videos"
  ON videos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON videos FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON videos FOR DELETE USING (auth.uid() = user_id);


-- ACHIEVEMENTS
CREATE POLICY "Achievements on public profiles are viewable"
  ON achievements FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = achievements.user_id AND profiles.is_public = TRUE
    )
  );

CREATE POLICY "Users can insert their own achievements"
  ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON achievements FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own achievements"
  ON achievements FOR DELETE USING (auth.uid() = user_id);


-- RESUMES: Private — only owner can see/edit
CREATE POLICY "Users can view their own resume"
  ON resumes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resume"
  ON resumes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resume"
  ON resumes FOR UPDATE USING (auth.uid() = user_id);


-- ANALYTICS: Only owner can see their analytics
CREATE POLICY "Users can view their own analytics"
  ON analytics FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert analytics (for view tracking)"
  ON analytics FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update their own analytics"
  ON analytics FOR UPDATE USING (auth.uid() = user_id);


-- PROFILE VIEWS: Anyone can insert (track views)
CREATE POLICY "Anyone can insert profile views"
  ON profile_views FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Profile owners can view their view stats"
  ON profile_views FOR SELECT USING (auth.uid() = profile_id);


-- ==================================================
-- UNIQUE CONSTRAINT for analytics deduplication
-- ==================================================
-- Ensures one row per user per type per day
ALTER TABLE analytics
  ADD CONSTRAINT analytics_user_type_date_unique
  UNIQUE (user_id, type, date);


-- ==================================================
-- INDEXES for performance
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);


-- ==================================================
-- DONE! Your CareerDNA database is ready.
-- ==================================================
