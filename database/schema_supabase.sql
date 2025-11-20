-- THE SYSTEM Database Schema - SUPABASE COMPATIBLE
-- Uses Supabase's built-in auth.users instead of custom users table
-- Run this in Supabase SQL Editor

-- ============================================================================
-- USER PROFILES (extends Supabase auth.users)
-- ============================================================================

-- User profiles and preferences (linked to auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    learning_style VARCHAR(50) CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'collaborative')),
    time_availability VARCHAR(50) CHECK (time_availability IN ('low', 'medium', 'high')),
    preferred_difficulty VARCHAR(50) CHECK (preferred_difficulty IN ('easy', 'medium', 'hard')),
    privacy_level VARCHAR(50) DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends', 'private')),
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- User progress and statistics
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_level INTEGER DEFAULT 1,
    total_experience INTEGER DEFAULT 0,
    missions_completed INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    skill_level_contributions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================================
-- SKILLS SYSTEM
-- ============================================================================

-- User skills
CREATE TABLE IF NOT EXISTS user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    total_experience INTEGER DEFAULT 0,
    experience_to_next INTEGER DEFAULT 100,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Skill categories for organization
CREATE TABLE IF NOT EXISTS skill_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MISSIONS SYSTEM
-- ============================================================================

-- Mission templates and user missions
CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES user_skills(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    experience INTEGER DEFAULT 100,
    time_limit INTEGER,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    is_completed BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50),
    is_ai_generated BOOLEAN DEFAULT FALSE,
    specific_tasks JSONB DEFAULT '[]',
    learning_resources JSONB DEFAULT '[]',
    personalized_tips JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- CHALLENGES SYSTEM
-- ============================================================================

-- Challenge templates and instances
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) CHECK (type IN ('quest', 'sprint', 'marathon', 'daily')),
    duration INTEGER NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    privacy VARCHAR(20) DEFAULT 'public' CHECK (privacy IN ('public', 'private', 'friends')),
    max_participants INTEGER,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    rules JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    reward_xp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge skills association
CREATE TABLE IF NOT EXISTS challenge_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge participants
CREATE TABLE IF NOT EXISTS challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    tasks_completed INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    completion_status VARCHAR(20) DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed', 'dropped_out')),
    UNIQUE(challenge_id, user_id)
);

-- ============================================================================
-- FRIENDS SYSTEM
-- ============================================================================

-- Friends table
CREATE TABLE IF NOT EXISTS friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'away')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_user_id)
);

-- Friend requests table
CREATE TABLE IF NOT EXISTS friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- ============================================================================
-- COMMUNITY SYSTEM
-- ============================================================================

-- Social posts
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('progress', 'achievement', 'tip', 'question', 'celebration', 'challenge')),
    content TEXT NOT NULL,
    image_url TEXT,
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]',
    mentioned_users JSONB DEFAULT '[]',
    linked_challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
    linked_skill_id UUID REFERENCES user_skills(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post likes
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Post comments
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment likes
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Social activity feed
CREATE TABLE IF NOT EXISTS social_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) CHECK (activity_type IN ('friend_achievement', 'challenge_invite', 'new_follower', 'challenge_complete', 'streak_milestone', 'post_like', 'post_comment')),
    message TEXT NOT NULL,
    related_post_id UUID REFERENCES social_posts(id) ON DELETE SET NULL,
    related_challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- RANKINGS AND LEADERBOARDS
-- ============================================================================

-- User rankings (calculated periodically)
CREATE TABLE IF NOT EXISTS user_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ranking_type VARCHAR(50) CHECK (ranking_type IN ('global', 'weekly', 'monthly', 'skill_based')),
    skill_name VARCHAR(100),
    rank_position INTEGER NOT NULL,
    score INTEGER NOT NULL,
    period_start DATE,
    period_end DATE,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, ranking_type, skill_name, period_start)
);

-- User badges and achievements
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    badge_icon VARCHAR(100),
    badge_category VARCHAR(50) CHECK (badge_category IN ('streak', 'achievement', 'social', 'challenge', 'skill')),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criteria_met JSONB DEFAULT '{}',
    UNIQUE(user_id, badge_name)
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- User notifications
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('system', 'social', 'challenge', 'achievement', 'reminder')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    action_url TEXT,
    action_text VARCHAR(100),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_level ON user_skills(level DESC);
CREATE INDEX IF NOT EXISTS idx_missions_user_id ON missions(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_skill_id ON missions(skill_id);
CREATE INDEX IF NOT EXISTS idx_missions_completed ON missions(is_completed, created_at);
CREATE INDEX IF NOT EXISTS idx_challenges_creator_id ON challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_id ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profiles_updated_at') THEN
        CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_progress_updated_at') THEN
        CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_skills_updated_at') THEN
        CREATE TRIGGER update_user_skills_updated_at BEFORE UPDATE ON user_skills
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_missions_updated_at') THEN
        CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_challenges_updated_at') THEN
        CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_social_posts_updated_at') THEN
        CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_friend_requests_updated_at') THEN
        CREATE TRIGGER update_friend_requests_updated_at BEFORE UPDATE ON friend_requests
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- ============================================================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, display_name, username)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        split_part(NEW.email, '@', 1) || '_' || substring(NEW.id::text, 1, 8)
    );
    
    INSERT INTO public.user_progress (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_profiles.user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_profiles.user_id);

-- User Progress Policies
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_progress.user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_progress.user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_progress.user_id);

-- Skills Policies
CREATE POLICY "Users can view own skills" ON user_skills FOR SELECT USING (auth.uid() = user_skills.user_id);
CREATE POLICY "Users can insert own skills" ON user_skills FOR INSERT WITH CHECK (auth.uid() = user_skills.user_id);
CREATE POLICY "Users can update own skills" ON user_skills FOR UPDATE USING (auth.uid() = user_skills.user_id);
CREATE POLICY "Users can delete own skills" ON user_skills FOR DELETE USING (auth.uid() = user_skills.user_id);

-- Missions Policies
CREATE POLICY "Users can view own missions" ON missions FOR SELECT USING (auth.uid() = missions.user_id);
CREATE POLICY "Users can insert own missions" ON missions FOR INSERT WITH CHECK (auth.uid() = missions.user_id);
CREATE POLICY "Users can update own missions" ON missions FOR UPDATE USING (auth.uid() = missions.user_id);
CREATE POLICY "Users can delete own missions" ON missions FOR DELETE USING (auth.uid() = missions.user_id);

-- Friends Policies
CREATE POLICY "Users can view own friends" ON friends FOR SELECT USING (auth.uid() = friends.user_id OR auth.uid() = friends.friend_user_id);
CREATE POLICY "Users can insert own friendships" ON friends FOR INSERT WITH CHECK (auth.uid() = friends.user_id);
CREATE POLICY "Users can delete own friendships" ON friends FOR DELETE USING (auth.uid() = friends.user_id);

-- Friend Requests Policies
CREATE POLICY "Users can view relevant friend requests" ON friend_requests FOR SELECT USING (auth.uid() = friend_requests.sender_id OR auth.uid() = friend_requests.receiver_id);
CREATE POLICY "Users can send friend requests" ON friend_requests FOR INSERT WITH CHECK (auth.uid() = friend_requests.sender_id);
CREATE POLICY "Users can update friend requests they received" ON friend_requests FOR UPDATE USING (auth.uid() = friend_requests.receiver_id);
CREATE POLICY "Users can delete friend requests they sent" ON friend_requests FOR DELETE USING (auth.uid() = friend_requests.sender_id);

-- Challenges Policies
CREATE POLICY "Users can view public challenges" ON challenges FOR SELECT USING (
    challenges.privacy = 'public' OR 
    challenges.creator_id = auth.uid() OR
    EXISTS (SELECT 1 FROM challenge_participants WHERE challenge_participants.challenge_id = challenges.id AND challenge_participants.user_id = auth.uid())
);
CREATE POLICY "Users can insert own challenges" ON challenges FOR INSERT WITH CHECK (auth.uid() = challenges.creator_id);
CREATE POLICY "Users can update own challenges" ON challenges FOR UPDATE USING (auth.uid() = challenges.creator_id);

-- Challenge Participants Policies
CREATE POLICY "Users can view challenge participants" ON challenge_participants FOR SELECT USING (true);
CREATE POLICY "Users can join challenges" ON challenge_participants FOR INSERT WITH CHECK (auth.uid() = challenge_participants.user_id);
CREATE POLICY "Users can update own participation" ON challenge_participants FOR UPDATE USING (auth.uid() = challenge_participants.user_id);

-- Social Posts Policies
CREATE POLICY "Users can view public posts" ON social_posts FOR SELECT USING (
    social_posts.visibility = 'public' OR 
    social_posts.user_id = auth.uid() OR
    (social_posts.visibility = 'friends' AND EXISTS (SELECT 1 FROM friends WHERE friends.user_id = social_posts.user_id AND friends.friend_user_id = auth.uid()))
);
CREATE POLICY "Users can insert own posts" ON social_posts FOR INSERT WITH CHECK (auth.uid() = social_posts.user_id);
CREATE POLICY "Users can update own posts" ON social_posts FOR UPDATE USING (auth.uid() = social_posts.user_id);
CREATE POLICY "Users can delete own posts" ON social_posts FOR DELETE USING (auth.uid() = social_posts.user_id);

-- Post Likes Policies
CREATE POLICY "Users can view post likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON post_likes FOR INSERT WITH CHECK (auth.uid() = post_likes.user_id);
CREATE POLICY "Users can unlike posts" ON post_likes FOR DELETE USING (auth.uid() = post_likes.user_id);

-- Post Comments Policies
CREATE POLICY "Users can view comments" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON post_comments FOR INSERT WITH CHECK (auth.uid() = post_comments.user_id);
CREATE POLICY "Users can update own comments" ON post_comments FOR UPDATE USING (auth.uid() = post_comments.user_id);
CREATE POLICY "Users can delete own comments" ON post_comments FOR DELETE USING (auth.uid() = post_comments.user_id);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON user_notifications FOR SELECT USING (auth.uid() = user_notifications.user_id);
CREATE POLICY "Users can update own notifications" ON user_notifications FOR UPDATE USING (auth.uid() = user_notifications.user_id);

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

INSERT INTO skill_categories (name, description, icon, color) 
VALUES
    ('Programming', 'Software development and coding skills', 'code', '#3B82F6'),
    ('Design', 'Visual design and creative skills', 'palette', '#EF4444'),
    ('Music', 'Musical instruments and composition', 'music', '#8B5CF6'),
    ('Fitness', 'Physical health and exercise', 'dumbbell', '#10B981'),
    ('Language', 'Foreign language learning', 'globe', '#F59E0B'),
    ('Business', 'Entrepreneurship and business skills', 'briefcase', '#6366F1'),
    ('Art', 'Visual arts and crafts', 'brush', '#EC4899'),
    ('Science', 'Scientific knowledge and research', 'flask', '#14B8A6')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- RPC FUNCTIONS FOR COUNTERS
-- ============================================================================

-- Increment post likes count
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE social_posts
    SET likes_count = likes_count + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement post likes count
CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE social_posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment post comments count
CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE social_posts
    SET comments_count = comments_count + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement post comments count
CREATE OR REPLACE FUNCTION decrement_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE social_posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment comment likes count
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE post_comments
    SET likes_count = likes_count + 1
    WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement comment likes count
CREATE OR REPLACE FUNCTION decrement_comment_likes(comment_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE post_comments
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ THE SYSTEM Database schema deployed successfully!';
    RAISE NOTICE '✅ All tables, functions, triggers, and RLS policies are ready.';
    RAISE NOTICE '✅ Auto-create user profile trigger is active.';
    RAISE NOTICE '✅ RPC functions for counters are ready.';
END
$$;
