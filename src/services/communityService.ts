// Database service functions for community features
import { supabase } from '../lib/database'
import { getAvatarUrl } from '../utils/avatarUtils'

export interface SocialPost {
  id: string
  user_id: string
  type: 'progress' | 'achievement' | 'tip' | 'question' | 'celebration' | 'challenge'
  content: string
  image_url?: string
  visibility: 'public' | 'friends' | 'private'
  likes_count: number
  comments_count: number
  shares_count: number
  tags: string[]
  mentioned_users: string[]
  linked_challenge_id?: string
  linked_skill_id?: string
  created_at: string
  updated_at: string
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  parent_comment_id?: string
  content: string
  likes_count: number
  created_at: string
  updated_at: string
}

export interface PostWithDetails extends SocialPost {
  user: {
    id: string
    display_name: string
    avatar_url: string
    level?: number
    skill?: string
  }
  comments: (PostComment & {
    user: {
      id: string
      display_name: string
      avatar_url: string
      level?: number
    }
    is_liked?: boolean
  })[]
  is_liked: boolean
  linked_challenge?: {
    id: string
    title: string
  }
  linked_skill?: {
    id: string
    name: string
  }
}

export interface UserRelationship {
  id: string
  follower_id: string
  following_id: string
  relationship_type: 'follow' | 'friend' | 'block'
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

export interface SocialActivity {
  id: string
  user_id: string
  actor_user_id: string
  activity_type: 'friend_achievement' | 'challenge_invite' | 'new_follower' | 'challenge_complete' | 'streak_milestone' | 'post_like' | 'post_comment'
  message: string
  related_post_id?: string
  related_challenge_id?: string
  is_read: boolean
  created_at: string
}

// ============================================================================
// COMMUNITY SERVICE
// ============================================================================

export const communityService = {
  // Get public posts with user details
  async getPublicPosts(options?: {
    limit?: number
    offset?: number
    type?: string
    userId?: string
  }): Promise<PostWithDetails[]> {
    try {
      let query = supabase
        .from('social_posts')
        .select(`
          *,
          post_comments(
            *
          )
        `)
        .eq('visibility', 'public')

      if (options?.type) {
        query = query.eq('type', options.type)
      }

      if (options?.offset) {
        query = query.range(options.offset, (options.offset + (options?.limit || 20)) - 1)
      } else if (options?.limit) {
        query = query.limit(options.limit)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      // Fetch all unique user IDs from posts and comments
      const userIds = new Set<string>()
      data?.forEach(post => {
        userIds.add(post.user_id)
        post.post_comments?.forEach((comment: any) => {
          userIds.add(comment.user_id)
        })
      })

      // Fetch user profiles for all users
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', Array.from(userIds))

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])

      // Check if current user liked each post and comment
      const posts = await Promise.all((data || []).map(async (post) => {
        let isLiked = false
        if (options?.userId) {
          const { data: likeData } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', options.userId)
            .single()
          
          isLiked = !!likeData
        }

        // Map comments with user profiles and like status
        const commentsWithLikes = await Promise.all((post.post_comments || []).map(async (comment: any) => {
          let commentLiked = false
          if (options?.userId) {
            const { data: commentLikeData } = await supabase
              .from('comment_likes')
              .select('id')
              .eq('comment_id', comment.id)
              .eq('user_id', options.userId)
              .single()
            
            commentLiked = !!commentLikeData
          }

          const commentUserProfile = profileMap.get(comment.user_id)
          return {
            ...comment,
            user: {
              id: commentUserProfile?.user_id || comment.user_id,
              display_name: commentUserProfile?.display_name || 'Unknown User',
              avatar_url: getAvatarUrl(commentUserProfile?.avatar_url),
              level: 1
            },
            is_liked: commentLiked
          }
        }))

        const postUserProfile = profileMap.get(post.user_id)
        return {
          ...post,
          user: {
            id: postUserProfile?.user_id || post.user_id,
            display_name: postUserProfile?.display_name || 'Unknown User',
            avatar_url: getAvatarUrl(postUserProfile?.avatar_url),
            level: 1,
            skill: ''
          },
          comments: commentsWithLikes,
          is_liked: isLiked,
          linked_challenge: null,
          linked_skill: null
        }
      }))

      return posts
    } catch (error) {
      console.error('Error fetching public posts:', error)
      return []
    }
  },

  // Create a new post
  async createPost(userId: string, postData: {
    type: 'progress' | 'achievement' | 'tip' | 'question' | 'celebration' | 'challenge'
    content: string
    image_url?: string
    visibility?: 'public' | 'friends' | 'private'
    tags?: string[]
    mentioned_users?: string[]
    linked_challenge_id?: string
    linked_skill_id?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          user_id: userId,
          type: postData.type,
          content: postData.content,
          image_url: postData.image_url,
          visibility: postData.visibility || 'public',
          tags: postData.tags || [],
          mentioned_users: postData.mentioned_users || [],
          linked_challenge_id: postData.linked_challenge_id,
          linked_skill_id: postData.linked_skill_id,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Like/unlike a post
  async togglePostLike(postId: string, userId: string) {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      if (existingLike) {
        // Unlike the post
        await supabase
          .from('post_likes')
          .delete()
          .eq('id', existingLike.id)

        // Decrement likes count
        await supabase.rpc('decrement_post_likes', { post_id: postId })

        return { data: { liked: false }, error: null }
      } else {
        // Like the post
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: userId
          })

        // Increment likes count
        await supabase.rpc('increment_post_likes', { post_id: postId })

        return { data: { liked: true }, error: null }
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Add a comment to a post
  async addComment(postId: string, userId: string, content: string, parentCommentId?: string) {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content,
          parent_comment_id: parentCommentId,
          likes_count: 0
        })
        .select(`
          *,
          user_profiles(
            user_id,
            display_name,
            avatar_url
          )
        `)
        .single()

      if (!error) {
        // Increment comments count
        await supabase.rpc('increment_post_comments', { post_id: postId })
      }

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Like/unlike a comment
  async toggleCommentLike(commentId: string, userId: string) {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .single()

      if (existingLike) {
        // Unlike the comment
        await supabase
          .from('comment_likes')
          .delete()
          .eq('id', existingLike.id)

        // Decrement likes count
        await supabase.rpc('decrement_comment_likes', { comment_id: commentId })

        return { data: { liked: false }, error: null }
      } else {
        // Like the comment
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: userId
          })

        // Increment likes count
        await supabase.rpc('increment_comment_likes', { comment_id: commentId })

        return { data: { liked: true }, error: null }
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Follow/unfollow a user (using friends table)
  async toggleFollow(followerId: string, followingId: string) {
    try {
      // Check if already friends
      const { data: existingFriend } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', followerId)
        .eq('friend_user_id', followingId)
        .single()

      if (existingFriend) {
        // Unfollow - remove friendship
        await supabase
          .from('friends')
          .delete()
          .eq('id', existingFriend.id)

        return { data: { following: false }, error: null }
      } else {
        // Check if there's a pending friend request
        const { data: pendingRequest } = await supabase
          .from('friend_requests')
          .select('*')
          .eq('sender_id', followingId)
          .eq('receiver_id', followerId)
          .eq('status', 'pending')
          .single()

        if (pendingRequest) {
          // Accept the friend request
          await supabase
            .from('friend_requests')
            .update({ status: 'accepted' })
            .eq('id', pendingRequest.id)

          // Create bidirectional friendship
          await supabase.from('friends').insert([
            { user_id: followerId, friend_user_id: followingId },
            { user_id: followingId, friend_user_id: followerId }
          ])
        } else {
          // Send a friend request
          await supabase
            .from('friend_requests')
            .insert({
              sender_id: followerId,
              receiver_id: followingId,
              status: 'pending'
            })
        }

        // Create activity notification
        await this.createActivity(followingId, followerId, 'new_follower', 'sent you a friend request')

        return { data: { following: true }, error: null }
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get user's social activities
  async getUserActivities(userId: string, limit: number = 20): Promise<SocialActivity[]> {
    try {
      const { data, error } = await supabase
        .from('social_activities')
        .select(`
          *,
          user_profiles(
            user_id,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data?.map(activity => ({
        ...activity,
        actor_user: activity.user_profiles
      })) || []
    } catch (error) {
      console.error('Error fetching user activities:', error)
      return []
    }
  },

  // Create a social activity
  async createActivity(userId: string, actorUserId: string, type: SocialActivity['activity_type'], message: string, relatedIds?: {
    postId?: string
    challengeId?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('social_activities')
        .insert({
          user_id: userId,
          actor_user_id: actorUserId,
          activity_type: type,
          message,
          related_post_id: relatedIds?.postId,
          related_challenge_id: relatedIds?.challengeId,
          is_read: false
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Mark activities as read
  async markActivitiesAsRead(userId: string, activityIds?: string[]) {
    try {
      let query = supabase
        .from('social_activities')
        .update({ is_read: true })
        .eq('user_id', userId)

      if (activityIds) {
        query = query.in('id', activityIds)
      }

      const { error } = await query

      return { error }
    } catch (error) {
      return { error }
    }
  },

  // Get user's friends
  async getUserRelationships(userId: string, type: 'following' | 'followers' = 'following') {
    try {
      // For friends table, both types return the same data (bidirectional friendship)
      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          user_profiles(
            user_id,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', userId)

      if (error) throw error

      return data?.map(friend => ({
        ...friend,
        user: friend.user_profiles
      })) || []
    } catch (error) {
      console.error('Error fetching user friends:', error)
      return []
    }
  },

  // Search posts
  async searchPosts(query: string, filters?: {
    type?: string
    userId?: string
  }) {
    try {
      let dbQuery = supabase
        .from('social_posts')
        .select(`
          *,
          user_profiles(
            user_id,
            display_name,
            avatar_url
          )
        `)
        .eq('visibility', 'public')
        .ilike('content', `%${query}%`)

      if (filters?.type) {
        dbQuery = dbQuery.eq('type', filters.type)
      }

      dbQuery = dbQuery.order('created_at', { ascending: false })

      const { data, error } = await dbQuery

      if (error) throw error

      return data?.map(post => ({
        ...post,
        user: post.user_profiles
      })) || []
    } catch (error) {
      console.error('Error searching posts:', error)
      return []
    }
  },

  // Delete a post (only by creator)
  async deletePost(postId: string, userId: string) {
    try {
      // First verify the user is the creator
      const { data: post, error: fetchError } = await supabase
        .from('social_posts')
        .select('user_id')
        .eq('id', postId)
        .single()

      if (fetchError) throw fetchError
      
      if (post.user_id !== userId) {
        throw new Error('Only the creator can delete this post')
      }

      // Delete the post (cascade will handle comments and likes)
      const { error: deleteError } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId)

      if (deleteError) throw deleteError

      return { success: true }
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  }
}
