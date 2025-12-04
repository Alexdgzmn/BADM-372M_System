-- Fix RLS policies for challenge_skills table

-- Enable RLS if not already enabled
ALTER TABLE challenge_skills ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view challenge skills" ON challenge_skills;
DROP POLICY IF EXISTS "Challenge creators can add skills" ON challenge_skills;
DROP POLICY IF EXISTS "Challenge creators can delete skills" ON challenge_skills;

-- Allow anyone to view challenge skills (public challenges)
CREATE POLICY "Anyone can view challenge skills" 
ON challenge_skills FOR SELECT 
USING (true);

-- Allow challenge creators to insert skills when creating a challenge
CREATE POLICY "Challenge creators can add skills" 
ON challenge_skills FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM challenges 
    WHERE challenges.id = challenge_skills.challenge_id 
    AND challenges.creator_id = auth.uid()
  )
);

-- Allow challenge creators to delete skills from their challenges
CREATE POLICY "Challenge creators can delete skills" 
ON challenge_skills FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM challenges 
    WHERE challenges.id = challenge_skills.challenge_id 
    AND challenges.creator_id = auth.uid()
  )
);

-- Fix RLS policy for challenges table - ADD DELETE POLICY
DROP POLICY IF EXISTS "Users can delete own challenges" ON challenges;
CREATE POLICY "Users can delete own challenges" 
ON challenges FOR DELETE 
USING (auth.uid() = challenges.creator_id);

-- Fix RLS policy for social_posts table - ADD DELETE POLICY
DROP POLICY IF EXISTS "Users can delete own posts" ON social_posts;
CREATE POLICY "Users can delete own posts" 
ON social_posts FOR DELETE 
USING (auth.uid() = social_posts.user_id);

-- Fix RLS policies for user_progress table - ALLOW PUBLIC READ FOR LEADERBOARD
-- Drop ALL existing SELECT policies first
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Anyone can view user progress for leaderboard" ON user_progress;

-- Create a single policy that allows everyone to view all user progress
CREATE POLICY "Everyone can view user progress" 
ON user_progress FOR SELECT 
USING (true);
