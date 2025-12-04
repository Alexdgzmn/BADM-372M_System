// Friends service for managing friend relationships and requests
import { supabase } from '../lib/database';
import { getAvatarUrl } from '../utils/avatarUtils';

export interface FriendData {
  id: string;
  userId: string;
  displayName: string;
  nickname?: string;
  avatar?: string;
  level: number;
  currentStreak: number;
  status: 'online' | 'offline' | 'away';
}

export interface FriendRequestData {
  id: string;
  senderId: string;
  senderDisplayName: string;
  senderNickname?: string;
  senderAvatar?: string;
  senderLevel: number;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface UserSearchResultData {
  id: string;
  userId: string;
  displayName: string;
  nickname: string;
  avatar: string | null;
  level: number;
  currentStreak: number;
  isFriend: boolean;
  hasPendingRequest: boolean;
}

// ============================================================================
// SEARCH USERS
// ============================================================================

export async function searchUsers(
  query: string,
  currentUserId: string
): Promise<UserSearchResultData[]> {
  try {
    if (query.length < 2) return [];

    // Search user_profiles by display_name or username
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, username, avatar_url')
      .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
      .neq('user_id', currentUserId) // Exclude current user
      .limit(20);

    if (profilesError) throw profilesError;
    if (!profiles || profiles.length === 0) return [];

    const userIds = profiles.map(p => p.user_id);

    // Get user progress for levels and streaks
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('user_id, total_level, current_streak')
      .in('user_id', userIds);

    if (progressError) throw progressError;

    // Get existing friends
    const { data: friendsData, error: friendsError } = await supabase
      .from('friends')
      .select('friend_user_id')
      .eq('user_id', currentUserId)
      .in('friend_user_id', userIds);

    if (friendsError) throw friendsError;

    const friendIds = new Set(friendsData?.map(f => f.friend_user_id) || []);

    // Get pending friend requests
    const { data: requestsData, error: requestsError } = await supabase
      .from('friend_requests')
      .select('receiver_id, sender_id')
      .eq('status', 'pending')
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

    if (requestsError) throw requestsError;

    const pendingRequestIds = new Set(
      requestsData?.map(r => 
        r.sender_id === currentUserId ? r.receiver_id : r.sender_id
      ) || []
    );

    // Combine data
    const progressMap = new Map(
      progressData?.map(p => [p.user_id, p]) || []
    );

    const results: UserSearchResultData[] = profiles.map(profile => {
      const progress = progressMap.get(profile.user_id);
      return {
        id: profile.user_id,
        userId: profile.user_id,
        displayName: profile.display_name || 'Anonymous',
        nickname: profile.username || 'user',
        avatar: profile.avatar_url,
        level: progress?.total_level || 1,
        currentStreak: progress?.current_streak || 0,
        isFriend: friendIds.has(profile.user_id),
        hasPendingRequest: pendingRequestIds.has(profile.user_id)
      };
    });

    return results;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

// ============================================================================
// FRIEND REQUESTS
// ============================================================================

export async function sendFriendRequest(
  currentUserId: string,
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if request already exists
    const { data: existing } = await supabase
      .from('friend_requests')
      .select('id')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${currentUserId})`)
      .single();

    if (existing) {
      return { success: false, error: 'Friend request already exists' };
    }

    // Check if already friends
    const { data: alreadyFriends } = await supabase
      .from('friends')
      .select('id')
      .or(`and(user_id.eq.${currentUserId},friend_user_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_user_id.eq.${currentUserId})`)
      .single();

    if (alreadyFriends) {
      return { success: false, error: 'Already friends' };
    }

    // Create friend request
    const { error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: currentUserId,
        receiver_id: targetUserId,
        status: 'pending'
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error sending friend request:', error);
    return { success: false, error: 'Failed to send friend request' };
  }
}

export async function getFriendRequests(
  currentUserId: string
): Promise<FriendRequestData[]> {
  try {
    // Get requests where current user is the receiver (incoming requests)
    const { data: requests, error } = await supabase
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status, created_at')
      .eq('receiver_id', currentUserId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!requests || requests.length === 0) return [];

    const senderIds = requests.map(r => r.sender_id);

    // Get sender profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, username, avatar_url')
      .in('user_id', senderIds);

    if (profilesError) throw profilesError;

    // Get sender progress
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('user_id, total_level')
      .in('user_id', senderIds);

    if (progressError) throw progressError;

    const profileMap = new Map(
      profiles?.map(p => [p.user_id, p]) || []
    );

    const progressMap = new Map(
      progressData?.map(p => [p.user_id, p]) || []
    );

    const result: FriendRequestData[] = requests.map(request => {
      const profile = profileMap.get(request.sender_id);
      const progress = progressMap.get(request.sender_id);

      return {
        id: request.id,
        senderId: request.sender_id,
        senderDisplayName: profile?.display_name || 'Anonymous',
        senderNickname: profile?.username,
        senderAvatar: profile?.avatar_url,
        senderLevel: progress?.total_level || 1,
        receiverId: request.receiver_id,
        status: request.status as 'pending' | 'accepted' | 'rejected',
        createdAt: new Date(request.created_at)
      };
    });

    return result;
  } catch (error) {
    console.error('Error getting friend requests:', error);
    return [];
  }
}

export async function acceptFriendRequest(
  requestId: string,
  currentUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the request
    const { data: request, error: requestError } = await supabase
      .from('friend_requests')
      .select('sender_id, receiver_id')
      .eq('id', requestId)
      .eq('receiver_id', currentUserId)
      .single();

    if (requestError) throw requestError;
    if (!request) return { success: false, error: 'Request not found' };

    // Create friendship (both directions)
    const { error: friendError1 } = await supabase
      .from('friends')
      .insert({
        user_id: request.sender_id,
        friend_user_id: request.receiver_id,
        status: 'offline'
      });

    if (friendError1) throw friendError1;

    const { error: friendError2 } = await supabase
      .from('friends')
      .insert({
        user_id: request.receiver_id,
        friend_user_id: request.sender_id,
        status: 'offline'
      });

    if (friendError2) throw friendError2;

    // Update request status to accepted
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return { success: false, error: 'Failed to accept friend request' };
  }
}

export async function rejectFriendRequest(
  requestId: string,
  currentUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update request status to rejected
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('receiver_id', currentUserId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    return { success: false, error: 'Failed to reject friend request' };
  }
}

// ============================================================================
// FRIENDS LIST
// ============================================================================

export async function getFriends(currentUserId: string): Promise<FriendData[]> {
  try {
    // Get friend relationships
    const { data: friendships, error } = await supabase
      .from('friends')
      .select('friend_user_id, status')
      .eq('user_id', currentUserId);

    if (error) throw error;
    if (!friendships || friendships.length === 0) return [];

    const friendIds = friendships.map(f => f.friend_user_id);

    // Get friend profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, username, avatar_url')
      .in('user_id', friendIds);

    if (profilesError) throw profilesError;

    // Get friend progress
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('user_id, total_level, current_streak')
      .in('user_id', friendIds);

    if (progressError) throw progressError;

    const profileMap = new Map(
      profiles?.map(p => [p.user_id, p]) || []
    );

    const progressMap = new Map(
      progressData?.map(p => [p.user_id, p]) || []
    );

    const statusMap = new Map(
      friendships.map(f => [f.friend_user_id, f.status])
    );

    const friends: FriendData[] = friendIds.map(friendId => {
      const profile = profileMap.get(friendId);
      const progress = progressMap.get(friendId);
      const status = statusMap.get(friendId) as 'online' | 'offline' | 'away' || 'offline';

      return {
        id: friendId,
        userId: friendId,
        displayName: profile?.display_name || 'Anonymous',
        nickname: profile?.username,
        avatar: profile?.avatar_url,
        level: progress?.total_level || 1,
        currentStreak: progress?.current_streak || 0,
        status
      };
    });

    return friends;
  } catch (error) {
    console.error('Error getting friends:', error);
    return [];
  }
}

export async function removeFriend(
  currentUserId: string,
  friendUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Remove both directions of the friendship
    const { error: error1 } = await supabase
      .from('friends')
      .delete()
      .eq('user_id', currentUserId)
      .eq('friend_user_id', friendUserId);

    if (error1) throw error1;

    const { error: error2 } = await supabase
      .from('friends')
      .delete()
      .eq('user_id', friendUserId)
      .eq('friend_user_id', currentUserId);

    if (error2) throw error2;

    return { success: true };
  } catch (error) {
    console.error('Error removing friend:', error);
    return { success: false, error: 'Failed to remove friend' };
  }
}
