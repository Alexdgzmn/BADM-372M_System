-- RLS Policies for Friends System
-- Run this in Supabase SQL Editor to enable Row Level Security for friends features

-- ============================================================================
-- FRIENDS TABLE POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Users can view their own friendships
CREATE POLICY "Users can view their own friends"
ON friends FOR SELECT
USING (auth.uid() = user_id);

-- Users can create friendships (used by acceptFriendRequest)
CREATE POLICY "Users can create friendships"
ON friends FOR INSERT
WITH CHECK (auth.uid() = user_id);

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
