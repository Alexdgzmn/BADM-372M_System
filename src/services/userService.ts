// Database service functions for user management
import { supabase } from '../lib/database'
import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  user_id: string
  bio?: string
  location?: string
  website?: string
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'collaborative'
  time_availability?: 'low' | 'medium' | 'high'
  preferred_difficulty?: 'easy' | 'medium' | 'hard'
  privacy_level: 'public' | 'friends' | 'private'
  notification_preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  total_level: number
  total_experience: number
  missions_completed: number
  current_streak: number
  longest_streak: number
  last_activity_date: string
  created_at: string
  updated_at: string
}

// ============================================================================
// USER AUTHENTICATION
// ============================================================================

export const userService = {
  // Sign up new user
  async signUp(email: string, password: string, userData?: { username?: string; display_name?: string }) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile
        await this.createUserProfile(authData.user.id)
        // Create user progress
        await this.createUserProgress(authData.user.id)
      }

      return { data: authData, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Sign in user
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Update last login
      if (data.user) {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id)
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Create user profile
  async createUserProfile(userId: string, profileData?: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          privacy_level: 'public',
          notification_preferences: {},
          ...profileData
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Create user progress
  async createUserProgress(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          total_level: 1,
          total_experience: 0,
          missions_completed: 0,
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get user progress
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user progress:', error)
      return null
    }
  },

  // Update user progress
  async updateUserProgress(userId: string, updates: Partial<UserProgress>) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Update user streak
  async updateUserStreak(userId: string, increment: boolean = true) {
    try {
      const progress = await this.getUserProgress(userId)
      if (!progress) throw new Error('User progress not found')

      const today = new Date().toISOString().split('T')[0]
      const lastActivity = new Date(progress.last_activity_date).toISOString().split('T')[0]
      
      let newStreak = progress.current_streak
      
      if (increment && lastActivity !== today) {
        // Check if it's consecutive days
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        
        if (lastActivity === yesterdayStr) {
          newStreak += 1
        } else if (lastActivity !== today) {
          newStreak = 1 // Reset streak
        }
      }

      const updates = {
        current_streak: newStreak,
        longest_streak: Math.max(progress.longest_streak, newStreak),
        last_activity_date: today
      }

      return await this.updateUserProgress(userId, updates)
    } catch (error) {
      return { data: null, error }
    }
  },

  // Search users
  async searchUsers(query: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .rpc('search_users', { 
          search_query: query,
          result_limit: limit 
        })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}