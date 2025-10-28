// Database connection configuration
import { createClient } from '@supabase/supabase-js'

// Database types (generated from your schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          last_login: string | null
          email_verified: boolean
          email_verification_token: string | null
          password_reset_token: string | null
          password_reset_expires: string | null
          is_active: boolean
          timezone: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          email_verified?: boolean
          email_verification_token?: string | null
          password_reset_token?: string | null
          password_reset_expires?: string | null
          is_active?: boolean
          timezone?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          email_verified?: boolean
          email_verification_token?: string | null
          password_reset_token?: string | null
          password_reset_expires?: string | null
          is_active?: boolean
          timezone?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          location: string | null
          website: string | null
          learning_style: string | null
          time_availability: string | null
          preferred_difficulty: string | null
          privacy_level: string
          notification_preferences: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          location?: string | null
          website?: string | null
          learning_style?: string | null
          time_availability?: string | null
          preferred_difficulty?: string | null
          privacy_level?: string
          notification_preferences?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bio?: string | null
          location?: string | null
          website?: string | null
          learning_style?: string | null
          time_availability?: string | null
          preferred_difficulty?: string | null
          privacy_level?: string
          notification_preferences?: any
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          total_level?: number
          total_experience?: number
          missions_completed?: number
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_level?: number
          total_experience?: number
          missions_completed?: number
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_skills: {
        Row: {
          id: string
          user_id: string
          name: string
          level: number
          experience: number
          total_experience: number
          experience_to_next: number
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          level?: number
          experience?: number
          total_experience?: number
          experience_to_next?: number
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          level?: number
          experience?: number
          total_experience?: number
          experience_to_next?: number
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      missions: {
        Row: {
          id: string
          user_id: string
          skill_id: string
          title: string
          description: string
          experience: number
          time_limit: number | null
          difficulty: string | null
          is_completed: boolean
          is_recurring: boolean
          recurrence_pattern: string | null
          is_ai_generated: boolean
          specific_tasks: any
          learning_resources: any
          personalized_tips: any
          created_at: string
          updated_at: string
          completed_at: string | null
          due_date: string | null
        }
        Insert: {
          id?: string
          user_id: string
          skill_id: string
          title: string
          description: string
          experience?: number
          time_limit?: number | null
          difficulty?: string | null
          is_completed?: boolean
          is_recurring?: boolean
          recurrence_pattern?: string | null
          is_ai_generated?: boolean
          specific_tasks?: any
          learning_resources?: any
          personalized_tips?: any
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          due_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          skill_id?: string
          title?: string
          description?: string
          experience?: number
          time_limit?: number | null
          difficulty?: string | null
          is_completed?: boolean
          is_recurring?: boolean
          recurrence_pattern?: string | null
          is_ai_generated?: boolean
          specific_tasks?: any
          learning_resources?: any
          personalized_tips?: any
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          due_date?: string | null
        }
      }
      challenges: {
        Row: {
          id: string
          creator_id: string | null
          title: string
          description: string
          type: string
          duration: number
          start_date: string
          end_date: string
          privacy: string
          max_participants: number | null
          difficulty: string | null
          status: string
          rules: any
          tags: any
          reward_xp: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id?: string | null
          title: string
          description: string
          type: string
          duration: number
          start_date: string
          end_date: string
          privacy?: string
          max_participants?: number | null
          difficulty?: string | null
          status?: string
          rules?: any
          tags?: any
          reward_xp?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string | null
          title?: string
          description?: string
          type?: string
          duration?: number
          start_date?: string
          end_date?: string
          privacy?: string
          max_participants?: number | null
          difficulty?: string | null
          status?: string
          rules?: any
          tags?: any
          reward_xp?: number
          created_at?: string
          updated_at?: string
        }
      }
      challenge_participants: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          joined_at: string
          progress_percentage: number
          tasks_completed: number
          total_tasks: number
          last_activity: string
          is_active: boolean
          completion_status: string
        }
        Insert: {
          id?: string
          challenge_id: string
          user_id: string
          joined_at?: string
          progress_percentage?: number
          tasks_completed?: number
          total_tasks?: number
          last_activity?: string
          is_active?: boolean
          completion_status?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          user_id?: string
          joined_at?: string
          progress_percentage?: number
          tasks_completed?: number
          total_tasks?: number
          last_activity?: string
          is_active?: boolean
          completion_status?: string
        }
      }
      social_posts: {
        Row: {
          id: string
          user_id: string
          type: string
          content: string
          image_url: string | null
          visibility: string
          likes_count: number
          comments_count: number
          shares_count: number
          tags: any
          mentioned_users: any
          linked_challenge_id: string | null
          linked_skill_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          content: string
          image_url?: string | null
          visibility?: string
          likes_count?: number
          comments_count?: number
          shares_count?: number
          tags?: any
          mentioned_users?: any
          linked_challenge_id?: string | null
          linked_skill_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          content?: string
          image_url?: string | null
          visibility?: string
          likes_count?: number
          comments_count?: number
          shares_count?: number
          tags?: any
          mentioned_users?: any
          linked_challenge_id?: string | null
          linked_skill_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_rankings: {
        Row: {
          id: string
          user_id: string
          ranking_type: string
          skill_name: string | null
          rank_position: number
          score: number
          period_start: string | null
          period_end: string | null
          calculated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ranking_type: string
          skill_name?: string | null
          rank_position: number
          score: number
          period_start?: string | null
          period_end?: string | null
          calculated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ranking_type?: string
          skill_name?: string | null
          rank_position?: number
          score?: number
          period_start?: string | null
          period_end?: string | null
          calculated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export default supabase