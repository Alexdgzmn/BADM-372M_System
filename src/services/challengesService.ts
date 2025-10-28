// Database service functions for challenges
import { supabase } from '../lib/database'

export interface Challenge {
  id: string
  creator_id: string | null
  title: string
  description: string
  type: 'quest' | 'sprint' | 'marathon' | 'daily'
  duration: number
  start_date: string
  end_date: string
  privacy: 'public' | 'private' | 'friends'
  max_participants?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  rules: string[]
  tags: string[]
  reward_xp: number
  created_at: string
  updated_at: string
}

export interface ChallengeParticipant {
  id: string
  challenge_id: string
  user_id: string
  joined_at: string
  progress_percentage: number
  tasks_completed: number
  total_tasks: number
  last_activity: string
  is_active: boolean
  completion_status: 'in_progress' | 'completed' | 'dropped_out'
}

export interface ChallengeWithDetails extends Challenge {
  participants: ChallengeParticipant[]
  skills: string[]
  creator?: {
    id: string
    display_name: string
    avatar_url: string
  }
  is_joined?: boolean
  user_progress?: ChallengeParticipant
}

// ============================================================================
// CHALLENGES SERVICE
// ============================================================================

export const challengesService = {
  // Get all public challenges
  async getPublicChallenges(options?: {
    limit?: number
    offset?: number
    status?: string
    difficulty?: string
    type?: string
  }): Promise<ChallengeWithDetails[]> {
    try {
      let query = supabase
        .from('challenges')
        .select(`
          *,
          challenge_participants(
            id,
            user_id,
            progress_percentage,
            tasks_completed,
            total_tasks,
            joined_at,
            is_active,
            completion_status
          ),
          challenge_skills(skill_name),
          users!challenges_creator_id_fkey(
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('privacy', 'public')

      if (options?.status) {
        query = query.eq('status', options.status)
      }

      if (options?.difficulty) {
        query = query.eq('difficulty', options.difficulty)
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

      return (data || []).map(challenge => ({
        ...challenge,
        participants: challenge.challenge_participants || [],
        skills: (challenge.challenge_skills || []).map((s: any) => s.skill_name),
        creator: challenge.users || undefined
      }))
    } catch (error) {
      console.error('Error fetching public challenges:', error)
      return []
    }
  },

  // Get user's challenges (created or joined)
  async getUserChallenges(userId: string, type: 'created' | 'joined' = 'joined'): Promise<ChallengeWithDetails[]> {
    try {
      let query
      
      if (type === 'created') {
        query = supabase
          .from('challenges')
          .select(`
            *,
            challenge_participants(
              id,
              user_id,
              progress_percentage,
              tasks_completed,
              total_tasks,
              joined_at,
              is_active,
              completion_status
            ),
            challenge_skills(skill_name)
          `)
          .eq('creator_id', userId)
      } else {
        query = supabase
          .from('challenges')
          .select(`
            *,
            challenge_participants!inner(
              id,
              user_id,
              progress_percentage,
              tasks_completed,
              total_tasks,
              joined_at,
              is_active,
              completion_status
            ),
            challenge_skills(skill_name)
          `)
          .eq('challenge_participants.user_id', userId)
          .eq('challenge_participants.is_active', true)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      return (data || []).map(challenge => ({
        ...challenge,
        participants: challenge.challenge_participants || [],
        skills: (challenge.challenge_skills || []).map((s: any) => s.skill_name),
        is_joined: type === 'joined' || challenge.challenge_participants?.some((p: any) => p.user_id === userId),
        user_progress: challenge.challenge_participants?.find((p: any) => p.user_id === userId)
      }))
    } catch (error) {
      console.error('Error fetching user challenges:', error)
      return []
    }
  },

  // Create a new challenge
  async createChallenge(userId: string, challengeData: {
    title: string
    description: string
    type: 'quest' | 'sprint' | 'marathon' | 'daily'
    duration: number
    start_date: string
    end_date: string
    privacy?: 'public' | 'private' | 'friends'
    max_participants?: number
    difficulty?: 'easy' | 'medium' | 'hard'
    skills: string[]
    rules?: string[]
    tags?: string[]
    reward_xp?: number
  }) {
    try {
      // Create the challenge
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .insert({
          creator_id: userId,
          title: challengeData.title,
          description: challengeData.description,
          type: challengeData.type,
          duration: challengeData.duration,
          start_date: challengeData.start_date,
          end_date: challengeData.end_date,
          privacy: challengeData.privacy || 'public',
          max_participants: challengeData.max_participants,
          difficulty: challengeData.difficulty,
          rules: challengeData.rules || [],
          tags: challengeData.tags || [],
          reward_xp: challengeData.reward_xp || 0,
          status: 'active'
        })
        .select()
        .single()

      if (challengeError) throw challengeError

      // Add skills to the challenge
      if (challengeData.skills.length > 0) {
        const skillInserts = challengeData.skills.map(skill => ({
          challenge_id: challenge.id,
          skill_name: skill
        }))

        const { error: skillsError } = await supabase
          .from('challenge_skills')
          .insert(skillInserts)

        if (skillsError) throw skillsError
      }

      // Auto-join the creator
      await this.joinChallenge(challenge.id, userId)

      return { data: challenge, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Join a challenge
  async joinChallenge(challengeId: string, userId: string) {
    try {
      // Check if user is already a participant
      const { data: existingParticipant } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .single()

      if (existingParticipant) {
        return { data: existingParticipant, error: null }
      }

      // Check challenge capacity
      const { data: challenge } = await supabase
        .from('challenges')
        .select('max_participants')
        .eq('id', challengeId)
        .single()

      if (challenge?.max_participants) {
        const { data: participantCount } = await supabase
          .from('challenge_participants')
          .select('id', { count: 'exact', head: true })
          .eq('challenge_id', challengeId)
          .eq('is_active', true)

        if ((participantCount?.length || 0) >= challenge.max_participants) {
          throw new Error('Challenge is full')
        }
      }

      // Join the challenge
      const { data, error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: userId,
          progress_percentage: 0,
          tasks_completed: 0,
          total_tasks: 0,
          is_active: true,
          completion_status: 'in_progress'
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Leave a challenge
  async leaveChallenge(challengeId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .update({
          is_active: false,
          completion_status: 'dropped_out'
        })
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Update challenge progress
  async updateChallengeProgress(challengeId: string, userId: string, progressData: {
    progress_percentage?: number
    tasks_completed?: number
    total_tasks?: number
  }) {
    try {
      const updates: any = {
        ...progressData,
        last_activity: new Date().toISOString()
      }

      // Check if completed
      if (progressData.progress_percentage === 100) {
        updates.completion_status = 'completed'
      }

      const { data, error } = await supabase
        .from('challenge_participants')
        .update(updates)
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .select()
        .single()

      // Create progress update entry
      if (!error) {
        await supabase
          .from('challenge_updates')
          .insert({
            challenge_id: challengeId,
            user_id: userId,
            update_type: 'progress',
            content: `Updated progress to ${progressData.progress_percentage}%`,
            progress_delta: progressData.progress_percentage || 0
          })
      }

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Get challenge leaderboard
  async getChallengeLeaderboard(challengeId: string) {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          users!challenge_participants_user_id_fkey(
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('challenge_id', challengeId)
        .eq('is_active', true)
        .order('progress_percentage', { ascending: false })
        .order('tasks_completed', { ascending: false })

      if (error) throw error

      return data?.map((participant, index) => ({
        ...participant,
        rank: index + 1,
        user: participant.users
      })) || []
    } catch (error) {
      console.error('Error fetching challenge leaderboard:', error)
      return []
    }
  },

  // Search challenges
  async searchChallenges(query: string, filters?: {
    type?: string
    difficulty?: string
    status?: string
  }) {
    try {
      let dbQuery = supabase
        .from('challenges')
        .select(`
          *,
          challenge_participants(count),
          challenge_skills(skill_name)
        `)
        .eq('privacy', 'public')
        .ilike('title', `%${query}%`)

      if (filters?.type) {
        dbQuery = dbQuery.eq('type', filters.type)
      }

      if (filters?.difficulty) {
        dbQuery = dbQuery.eq('difficulty', filters.difficulty)
      }

      if (filters?.status) {
        dbQuery = dbQuery.eq('status', filters.status)
      }

      dbQuery = dbQuery.order('created_at', { ascending: false })

      const { data, error } = await dbQuery

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error searching challenges:', error)
      return []
    }
  }
}