// Database service functions for skills and missions
import { supabase } from '../lib/database'

export interface UserSkill {
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

export interface Mission {
  id: string
  user_id: string
  skill_id: string
  title: string
  description: string
  experience: number
  time_limit?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  is_completed: boolean
  is_recurring: boolean
  recurrence_pattern?: string
  is_ai_generated: boolean
  specific_tasks: string[]
  learning_resources: string[]
  personalized_tips: string[]
  created_at: string
  updated_at: string
  completed_at?: string
  due_date?: string
}

export interface MissionProgress {
  id: string
  mission_id: string
  user_id: string
  started_at: string
  progress_percentage: number
  time_spent: number
  notes?: string
  updated_at: string
}

// ============================================================================
// SKILLS SERVICE
// ============================================================================

export const skillsService = {
  // Get all skills for a user
  async getUserSkills(userId: string): Promise<UserSkill[]> {
    try {
      const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user skills:', error)
      return []
    }
  },

  // Create a new skill
  async createSkill(userId: string, skillData: {
    name: string
    color: string
    level?: number
    experience?: number
  }) {
    try {
      const { data, error } = await supabase
        .from('user_skills')
        .insert({
          user_id: userId,
          name: skillData.name,
          color: skillData.color,
          level: skillData.level || 1,
          experience: skillData.experience || 0,
          total_experience: skillData.experience || 0,
          experience_to_next: 100
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Update skill experience and level
  async updateSkillExperience(skillId: string, experienceGained: number) {
    try {
      // Get current skill data
      const { data: skill, error: fetchError } = await supabase
        .from('user_skills')
        .select('*')
        .eq('id', skillId)
        .single()

      if (fetchError) throw fetchError

      const newTotalExp = skill.total_experience + experienceGained
      const newLevel = Math.floor(Math.sqrt(newTotalExp / 100)) + 1
      const expForCurrentLevel = Math.pow(newLevel - 1, 2) * 100
      const expForNextLevel = Math.pow(newLevel, 2) * 100
      const expToNext = expForNextLevel - newTotalExp

      const { data, error } = await supabase
        .from('user_skills')
        .update({
          total_experience: newTotalExp,
          level: newLevel,
          experience: newTotalExp - expForCurrentLevel,
          experience_to_next: expToNext
        })
        .eq('id', skillId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Delete a skill
  async deleteSkill(skillId: string) {
    try {
      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('id', skillId)

      return { error }
    } catch (error) {
      return { error }
    }
  }
}

// ============================================================================
// MISSIONS SERVICE
// ============================================================================

export const missionsService = {
  // Get all missions for a user
  async getUserMissions(userId: string, options?: {
    skillId?: string
    completed?: boolean
    limit?: number
  }): Promise<Mission[]> {
    try {
      let query = supabase
        .from('missions')
        .select(`
          *,
          user_skills!inner(name, color)
        `)
        .eq('user_id', userId)

      if (options?.skillId) {
        query = query.eq('skill_id', options.skillId)
      }

      if (options?.completed !== undefined) {
        query = query.eq('is_completed', options.completed)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user missions:', error)
      return []
    }
  },

  // Create a new mission
  async createMission(userId: string, missionData: {
    skill_id: string
    title: string
    description: string
    experience?: number
    time_limit?: number
    difficulty?: 'easy' | 'medium' | 'hard'
    is_ai_generated?: boolean
    specific_tasks?: string[]
    learning_resources?: string[]
    personalized_tips?: string[]
    due_date?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .insert({
          user_id: userId,
          ...missionData,
          experience: missionData.experience || 100,
          specific_tasks: missionData.specific_tasks || [],
          learning_resources: missionData.learning_resources || [],
          personalized_tips: missionData.personalized_tips || []
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Complete a mission
  async completeMission(missionId: string, userId: string) {
    try {
      // Get mission details
      const { data: mission, error: fetchError } = await supabase
        .from('missions')
        .select('*, user_skills!inner(*)')
        .eq('id', missionId)
        .eq('user_id', userId)
        .single()

      if (fetchError) throw fetchError

      // Mark mission as completed
      const { data: updatedMission, error: updateError } = await supabase
        .from('missions')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', missionId)
        .select()
        .single()

      if (updateError) throw updateError

      // Update skill experience
      await skillsService.updateSkillExperience(mission.skill_id, mission.experience)

      // Update user progress
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (userProgress) {
        await supabase
          .from('user_progress')
          .update({
            missions_completed: userProgress.missions_completed + 1,
            total_experience: userProgress.total_experience + mission.experience
          })
          .eq('user_id', userId)
      }

      return { data: updatedMission, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Update mission progress
  async updateMissionProgress(missionId: string, userId: string, progressData: {
    progress_percentage?: number
    time_spent?: number
    notes?: string
  }) {
    try {
      // Check if progress record exists
      const { data: existingProgress } = await supabase
        .from('mission_progress')
        .select('*')
        .eq('mission_id', missionId)
        .eq('user_id', userId)
        .single()

      let result
      if (existingProgress) {
        // Update existing progress
        result = await supabase
          .from('mission_progress')
          .update(progressData)
          .eq('id', existingProgress.id)
          .select()
          .single()
      } else {
        // Create new progress record
        result = await supabase
          .from('mission_progress')
          .insert({
            mission_id: missionId,
            user_id: userId,
            ...progressData
          })
          .select()
          .single()
      }

      return result
    } catch (error) {
      return { data: null, error }
    }
  },

  // Delete a mission
  async deleteMission(missionId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', missionId)
        .eq('user_id', userId)

      return { error }
    } catch (error) {
      return { error }
    }
  },

  // Get mission statistics
  async getMissionStats(userId: string) {
    try {
      const { data: totalMissions } = await supabase
        .from('missions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)

      const { data: completedMissions } = await supabase
        .from('missions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_completed', true)

      const { data: activeMissions } = await supabase
        .from('missions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_completed', false)

      return {
        total: totalMissions?.length || 0,
        completed: completedMissions?.length || 0,
        active: activeMissions?.length || 0
      }
    } catch (error) {
      console.error('Error fetching mission stats:', error)
      return { total: 0, completed: 0, active: 0 }
    }
  }
}