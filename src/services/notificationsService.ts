// Database service functions for notifications
import { supabase } from '../lib/database'

export interface UserNotification {
  id: string
  user_id: string
  type: 'system' | 'social' | 'challenge' | 'achievement' | 'reminder'
  title: string
  message: string
  data?: Record<string, any>
  is_read: boolean
  is_deleted: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  action_url?: string
  action_text?: string
  expires_at?: string
  created_at: string
  read_at?: string
}

export interface NotificationPreferences {
  id: string
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  social_notifications: boolean
  challenge_notifications: boolean
  achievement_notifications: boolean
  reminder_notifications: boolean
  marketing_notifications: boolean
  frequency: 'immediate' | 'daily' | 'weekly' | 'never'
  quiet_hours_start?: string
  quiet_hours_end?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// NOTIFICATIONS SERVICE
// ============================================================================

export const notificationsService = {
  // Get user notifications
  async getUserNotifications(userId: string, options?: {
    limit?: number
    offset?: number
    unreadOnly?: boolean
    type?: string
  }): Promise<UserNotification[]> {
    try {
      let query = supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)

      if (options?.unreadOnly) {
        query = query.eq('is_read', false)
      }

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

      return data || []
    } catch (error) {
      console.error('Error fetching user notifications:', error)
      return []
    }
  },

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .eq('is_deleted', false)

      if (error) throw error

      return count || 0
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }
  },

  // Create a notification
  async createNotification(notification: {
    user_id: string
    type: 'system' | 'social' | 'challenge' | 'achievement' | 'reminder'
    title: string
    message: string
    data?: Record<string, any>
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    action_url?: string
    action_text?: string
    expires_at?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .insert({
          user_id: notification.user_id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          priority: notification.priority || 'medium',
          action_url: notification.action_url,
          action_text: notification.action_text,
          expires_at: notification.expires_at,
          is_read: false,
          is_deleted: false
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)

      return { error }
    } catch (error) {
      return { error }
    }
  },

  // Delete notification
  async deleteNotification(notificationId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_deleted: true })
        .eq('id', notificationId)
        .eq('user_id', userId)

      return { error }
    } catch (error) {
      return { error }
    }
  },

  // Get notification preferences
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found is ok
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching notification preferences:', error)
      return null
    }
  },

  // Update notification preferences
  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>) {
    try {
      // Check if preferences exist
      const existing = await this.getNotificationPreferences(userId)

      if (existing) {
        // Update existing preferences
        const { data, error } = await supabase
          .from('notification_preferences')
          .update({
            ...preferences,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single()

        return { data, error }
      } else {
        // Create new preferences
        const { data, error } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: userId,
            email_notifications: true,
            push_notifications: true,
            social_notifications: true,
            challenge_notifications: true,
            achievement_notifications: true,
            reminder_notifications: true,
            marketing_notifications: false,
            frequency: 'immediate',
            ...preferences
          })
          .select()
          .single()

        return { data, error }
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Clean up expired notifications
  async cleanupExpiredNotifications() {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_deleted: true })
        .lt('expires_at', new Date().toISOString())
        .eq('is_deleted', false)

      return { error }
    } catch (error) {
      return { error }
    }
  },

  // Send achievement notification
  async sendAchievementNotification(userId: string, achievementTitle: string, achievementDescription: string, xpGained: number) {
    try {
      await this.createNotification({
        user_id: userId,
        type: 'achievement',
        title: '🏆 New Achievement Unlocked!',
        message: `You've earned "${achievementTitle}"! ${achievementDescription} (+${xpGained} XP)`,
        data: {
          achievement_title: achievementTitle,
          xp_gained: xpGained
        },
        priority: 'high',
        action_url: '/profile',
        action_text: 'View Profile'
      })
    } catch (error) {
      console.error('Error sending achievement notification:', error)
    }
  },

  // Send challenge invitation notification
  async sendChallengeInvitation(userId: string, challengeTitle: string, inviterName: string, challengeId: string) {
    try {
      await this.createNotification({
        user_id: userId,
        type: 'challenge',
        title: '🎯 Challenge Invitation',
        message: `${inviterName} invited you to join "${challengeTitle}"`,
        data: {
          challenge_id: challengeId,
          inviter_name: inviterName
        },
        priority: 'medium',
        action_url: `/challenges/${challengeId}`,
        action_text: 'View Challenge',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
    } catch (error) {
      console.error('Error sending challenge invitation:', error)
    }
  },

  // Send social notification (follow, like, comment)
  async sendSocialNotification(userId: string, actorName: string, action: string, postId?: string) {
    try {
      let title = ''
      let message = ''
      let actionUrl = ''

      switch (action) {
        case 'follow':
          title = '👥 New Follower'
          message = `${actorName} started following you`
          actionUrl = '/profile'
          break
        case 'like':
          title = '❤️ Post Liked'
          message = `${actorName} liked your post`
          actionUrl = postId ? `/community/post/${postId}` : '/community'
          break
        case 'comment':
          title = '💬 New Comment'
          message = `${actorName} commented on your post`
          actionUrl = postId ? `/community/post/${postId}` : '/community'
          break
        default:
          return
      }

      await this.createNotification({
        user_id: userId,
        type: 'social',
        title,
        message,
        data: {
          actor_name: actorName,
          action,
          post_id: postId
        },
        priority: 'low',
        action_url: actionUrl,
        action_text: 'View'
      })
    } catch (error) {
      console.error('Error sending social notification:', error)
    }
  },

  // Send streak reminder
  async sendStreakReminder(userId: string, currentStreak: number) {
    try {
      await this.createNotification({
        user_id: userId,
        type: 'reminder',
        title: '🔥 Keep Your Streak Going!',
        message: `You're on a ${currentStreak}-day streak! Complete a mission today to keep it going.`,
        data: {
          current_streak: currentStreak
        },
        priority: 'medium',
        action_url: '/dashboard',
        action_text: 'View Missions',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
    } catch (error) {
      console.error('Error sending streak reminder:', error)
    }
  },

  // Send level up notification
  async sendLevelUpNotification(userId: string, newLevel: number, skillName?: string) {
    try {
      const title = skillName ? `🌟 ${skillName} Level Up!` : '🌟 Level Up!'
      const message = skillName 
        ? `Congratulations! You've reached level ${newLevel} in ${skillName}!`
        : `Congratulations! You've reached level ${newLevel}!`

      await this.createNotification({
        user_id: userId,
        type: 'achievement',
        title,
        message,
        data: {
          new_level: newLevel,
          skill_name: skillName
        },
        priority: 'high',
        action_url: '/profile',
        action_text: 'View Profile'
      })
    } catch (error) {
      console.error('Error sending level up notification:', error)
    }
  },

  // Send mission completion notification
  async sendMissionCompletionNotification(userId: string, missionTitle: string, xpGained: number, streakCount: number) {
    try {
      await this.createNotification({
        user_id: userId,
        type: 'achievement',
        title: '✅ Mission Complete!',
        message: `Great job completing "${missionTitle}"! (+${xpGained} XP, ${streakCount} day streak)`,
        data: {
          mission_title: missionTitle,
          xp_gained: xpGained,
          streak_count: streakCount
        },
        priority: 'medium',
        action_url: '/dashboard',
        action_text: 'View Dashboard'
      })
    } catch (error) {
      console.error('Error sending mission completion notification:', error)
    }
  },

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<{
    total: number
    unread: number
    byType: Record<string, number>
    recentActivity: number
  }> {
    try {
      // Get total notifications
      const { count: total } = await supabase
        .from('user_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_deleted', false)

      // Get unread count
      const unread = await this.getUnreadCount(userId)

      // Get notifications by type
      const { data: typeData } = await supabase
        .from('user_notifications')
        .select('type')
        .eq('user_id', userId)
        .eq('is_deleted', false)

      const byType: Record<string, number> = {}
      typeData?.forEach(notification => {
        byType[notification.type] = (byType[notification.type] || 0) + 1
      })

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { count: recentActivity } = await supabase
        .from('user_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .gte('created_at', sevenDaysAgo.toISOString())

      return {
        total: total || 0,
        unread,
        byType,
        recentActivity: recentActivity || 0
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error)
      return {
        total: 0,
        unread: 0,
        byType: {},
        recentActivity: 0
      }
    }
  }
}