-- Fix RLS policies for social_posts to ensure posts are visible
-- Run this in Supabase SQL Editor

-- Enable RLS on social_posts
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view public posts" ON social_posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON social_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON social_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON social_posts;

-- Allow users to view public posts, their own posts, or friends-only posts where they are friends
CREATE POLICY "Users can view public posts" 
ON social_posts FOR SELECT 
USING (
    visibility = 'public' OR 
    user_id = auth.uid() OR
    (visibility = 'friends' AND EXISTS (
        SELECT 1 FROM friends 
        WHERE friends.user_id = social_posts.user_id 
        AND friends.friend_user_id = auth.uid()
    ))
);

-- Allow users to create their own posts
CREATE POLICY "Users can insert own posts" 
ON social_posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Users can update own posts" 
ON social_posts FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete own posts" 
ON social_posts FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on post_comments
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing comment policies
DROP POLICY IF EXISTS "Users can view comments" ON post_comments;
DROP POLICY IF EXISTS "Users can insert comments" ON post_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON post_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;

-- Allow everyone to view comments on posts they can see
CREATE POLICY "Users can view comments" 
ON post_comments FOR SELECT 
USING (true);

-- Allow users to create comments
CREATE POLICY "Users can insert comments" 
ON post_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Users can update own comments" 
ON post_comments FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete own comments" 
ON post_comments FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on post_likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing like policies
DROP POLICY IF EXISTS "Users can view post likes" ON post_likes;
DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON post_likes;

-- Allow everyone to view post likes
CREATE POLICY "Users can view post likes" 
ON post_likes FOR SELECT 
USING (true);

-- Allow users to like posts
CREATE POLICY "Users can like posts" 
ON post_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to remove their likes
CREATE POLICY "Users can unlike posts" 
ON post_likes FOR DELETE 
USING (auth.uid() = user_id);

-- Grant necessary permissions to user_profiles for joins
-- This allows the posts query to join with user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON user_profiles FOR SELECT 
USING (true);
