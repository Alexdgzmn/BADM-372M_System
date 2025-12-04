-- RLS Policies for Friends System
-- Run this in Supabase SQL Editor to enable Row Level Security for friends features

-- ============================================================================
-- FRIENDS TABLE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own friends" ON friends;
DROP POLICY IF EXISTS "Users can create friendships" ON friends;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON friends;
DROP POLICY IF EXISTS "Users can update their friendships" ON friends;

-- Users can view their own friendships
CREATE POLICY "Users can view their own friends"
ON friends FOR SELECT
USING (auth.uid() = user_id);

-- Users can create friendships (used by acceptFriendRequest)
-- Allow creating friendships when accepting a request (both directions)
CREATE POLICY "Users can create friendships"
ON friends FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR 
  (
    auth.uid() = friend_user_id AND
    EXISTS (
      SELECT 1 FROM friend_requests 
      WHERE (
        (friend_requests.sender_id = user_id AND friend_requests.receiver_id = auth.uid()) OR
        (friend_requests.receiver_id = user_id AND friend_requests.sender_id = auth.uid())
      )
      AND friend_requests.status = 'pending'
    )
  )
);

-- Users can delete their own friendships
CREATE POLICY "Users can delete their own friendships"
ON friends FOR DELETE
USING (auth.uid() = user_id);

-- Users can update status of their friendships
CREATE POLICY "Users can update their friendships"
ON friends FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================================================
-- FRIEND REQUESTS TABLE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can send friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Receivers can update friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can delete their sent requests" ON friend_requests;

-- Users can view requests they sent or received
CREATE POLICY "Users can view their friend requests"
ON friend_requests FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send friend requests
CREATE POLICY "Users can send friend requests"
ON friend_requests FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Receivers can update requests (accept/reject)
CREATE POLICY "Receivers can update friend requests"
ON friend_requests FOR UPDATE
USING (auth.uid() = receiver_id);

-- Users can delete their sent requests (cancel)
CREATE POLICY "Users can delete their sent requests"
ON friend_requests FOR DELETE
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
