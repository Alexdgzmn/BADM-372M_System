-- THE SYSTEM Database Cleanup Script
-- Run this FIRST to remove old tables before running schema_supabase.sql
-- WARNING: This will delete all existing data!

-- Drop all existing tables in correct order (respecting foreign key dependencies)
DROP TABLE IF EXISTS user_engagement CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS user_notifications CASCADE;
DROP TABLE IF EXISTS challenge_recommendations CASCADE;
DROP TABLE IF EXISTS user_progress_logs CASCADE;
DROP TABLE IF EXISTS user_skill_progress CASCADE;
DROP TABLE IF EXISTS leaderboard_entries CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS user_rankings CASCADE;
DROP TABLE IF EXISTS social_activities CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS social_posts CASCADE;
DROP TABLE IF EXISTS user_relationships CASCADE;
DROP TABLE IF EXISTS challenge_updates CASCADE;
DROP TABLE IF EXISTS challenge_participants CASCADE;
DROP TABLE IF EXISTS challenge_skills CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS mission_progress CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS skill_categories CASCADE;
DROP TABLE IF EXISTS user_skills CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any existing friend-related tables
DROP TABLE IF EXISTS friend_requests CASCADE;
DROP TABLE IF EXISTS friends CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS increment_post_likes(UUID);
DROP FUNCTION IF EXISTS decrement_post_likes(UUID);
DROP FUNCTION IF EXISTS increment_post_comments(UUID);
DROP FUNCTION IF EXISTS increment_comment_likes(UUID);
DROP FUNCTION IF EXISTS decrement_comment_likes(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop existing triggers on auth.users if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ All old tables and functions dropped successfully!';
    RAISE NOTICE '📝 Now run schema_supabase.sql to create new tables';
END
$$;
