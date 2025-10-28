// Database service functions for rankings and leaderboards
import { supabase } from '../lib/database'

export interface LeaderboardEntry {
  id: string
  user_id: string
  leaderboard_type: 'global_xp' | 'skill_mastery' | 'challenge_wins' | 'streak_days' | 'monthly_xp' | 'weekly_challenges'
  score: number
  rank: number
  period_start: string
  period_end: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface RankingWithUser extends LeaderboardEntry {
  user: {
    id: string
    display_name: string
    avatar_url: string
    level?: number
    current_skill?: string
  }
}

export interface UserRanking {
  userId: string
  displayName: string
  avatarUrl: string
  level: number
  totalXP: number
  currentStreak: number
  longestStreak: number
  challengesCompleted: number
  skillsMastered: number
  rank: number
  trend: 'up' | 'down' | 'same'
  rankChange: number
}

export interface SkillRanking {
  skillId: string
  skillName: string
  users: {
    userId: string
    displayName: string
    avatarUrl: string
    level: number
    xp: number
    rank: number
  }[]
}

export interface ChallengeRanking {
  challengeId: string
  challengeTitle: string
  participants: {
    userId: string
    displayName: string
    avatarUrl: string
    score: number
    completionTime?: number
    rank: number
    status: 'completed' | 'in_progress' | 'failed'
  }[]
}

// ============================================================================
// RANKINGS SERVICE
// ============================================================================

export const rankingsService = {
  // Get global XP leaderboard
  async getGlobalLeaderboard(limit: number = 50, currentUserId?: string): Promise<UserRanking[]> {
    try {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select(`
          *,
          users!leaderboard_entries_user_id_fkey(
            id,
            display_name,
            avatar_url,
            level,
            total_xp,
            current_streak,
            longest_streak,
            challenges_completed,
            skills_mastered
          )
        `)
        .eq('leaderboard_type', 'global_xp')
        .order('rank', { ascending: true })
        .limit(limit)

      if (error) throw error

      const rankings: UserRanking[] = (data || []).map(entry => ({
        userId: entry.user_id,
        displayName: entry.users.display_name,
        avatarUrl: entry.users.avatar_url,
        level: entry.users.level,
        totalXP: entry.users.total_xp,
        currentStreak: entry.users.current_streak,
        longestStreak: entry.users.longest_streak,
        challengesCompleted: entry.users.challenges_completed,
        skillsMastered: entry.users.skills_mastered,
        rank: entry.rank,
        trend: 'same', // Will be calculated based on historical data
        rankChange: 0
      }))

      // If current user is provided, include their ranking even if not in top N
      if (currentUserId) {
        const userInTop = rankings.find(r => r.userId === currentUserId)
        if (!userInTop) {
          const { data: userRank } = await supabase
            .from('leaderboard_entries')
            .select(`
              *,
              users!leaderboard_entries_user_id_fkey(
                id,
                display_name,
                avatar_url,
                level,
                total_xp,
                current_streak,
                longest_streak,
                challenges_completed,
                skills_mastered
              )
            `)
            .eq('leaderboard_type', 'global_xp')
            .eq('user_id', currentUserId)
            .single()

          if (userRank) {
            rankings.push({
              userId: userRank.user_id,
              displayName: userRank.users.display_name,
              avatarUrl: userRank.users.avatar_url,
              level: userRank.users.level,
              totalXP: userRank.users.total_xp,
              currentStreak: userRank.users.current_streak,
              longestStreak: userRank.users.longest_streak,
              challengesCompleted: userRank.users.challenges_completed,
              skillsMastered: userRank.users.skills_mastered,
              rank: userRank.rank,
              trend: 'same',
              rankChange: 0
            })
          }
        }
      }

      return rankings
    } catch (error) {
      console.error('Error fetching global leaderboard:', error)
      return []
    }
  },

  // Get skill-specific leaderboard
  async getSkillLeaderboard(skillId: string, limit: number = 50): Promise<SkillRanking> {
    try {
      const { data: skillData } = await supabase
        .from('user_skills')
        .select('name')
        .eq('id', skillId)
        .single()

      const { data: userSkills, error } = await supabase
        .from('user_skill_progress')
        .select(`
          *,
          users!user_skill_progress_user_id_fkey(
            id,
            display_name,
            avatar_url,
            level
          )
        `)
        .eq('skill_id', skillId)
        .order('xp_earned', { ascending: false })
        .limit(limit)

      if (error) throw error

      const users = (userSkills || []).map((progress, index) => ({
        userId: progress.user_id,
        displayName: progress.users.display_name,
        avatarUrl: progress.users.avatar_url,
        level: progress.users.level,
        xp: progress.xp_earned,
        rank: index + 1
      }))

      return {
        skillId,
        skillName: skillData?.name || 'Unknown Skill',
        users
      }
    } catch (error) {
      console.error('Error fetching skill leaderboard:', error)
      return {
        skillId,
        skillName: 'Unknown Skill',
        users: []
      }
    }
  },

  // Get challenge leaderboard
  async getChallengeLeaderboard(challengeId: string): Promise<ChallengeRanking> {
    try {
      const { data: challengeData } = await supabase
        .from('challenges')
        .select('title')
        .eq('id', challengeId)
        .single()

      const { data: participants, error } = await supabase
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
        .order('score', { ascending: false })

      if (error) throw error

      const participantList = (participants || []).map((participant, index) => ({
        userId: participant.user_id,
        displayName: participant.users.display_name,
        avatarUrl: participant.users.avatar_url,
        score: participant.score,
        completionTime: participant.completion_time,
        rank: index + 1,
        status: participant.status as 'completed' | 'in_progress' | 'failed'
      }))

      return {
        challengeId,
        challengeTitle: challengeData?.title || 'Unknown Challenge',
        participants: participantList
      }
    } catch (error) {
      console.error('Error fetching challenge leaderboard:', error)
      return {
        challengeId,
        challengeTitle: 'Unknown Challenge',
        participants: []
      }
    }
  },

  // Get monthly leaderboard
  async getMonthlyLeaderboard(year: number, month: number, limit: number = 50): Promise<UserRanking[]> {
    try {
      const periodStart = new Date(year, month - 1, 1).toISOString()
      const periodEnd = new Date(year, month, 0, 23, 59, 59).toISOString()

      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select(`
          *,
          users!leaderboard_entries_user_id_fkey(
            id,
            display_name,
            avatar_url,
            level
          )
        `)
        .eq('leaderboard_type', 'monthly_xp')
        .gte('period_start', periodStart)
        .lte('period_end', periodEnd)
        .order('rank', { ascending: true })
        .limit(limit)

      if (error) throw error

      return (data || []).map(entry => ({
        userId: entry.user_id,
        displayName: entry.users.display_name,
        avatarUrl: entry.users.avatar_url,
        level: entry.users.level,
        totalXP: entry.score,
        currentStreak: 0,
        longestStreak: 0,
        challengesCompleted: 0,
        skillsMastered: 0,
        rank: entry.rank,
        trend: 'same',
        rankChange: 0
      }))
    } catch (error) {
      console.error('Error fetching monthly leaderboard:', error)
      return []
    }
  },

  // Get user's rank in a specific leaderboard
  async getUserRank(userId: string, leaderboardType: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('rank')
        .eq('user_id', userId)
        .eq('leaderboard_type', leaderboardType)
        .single()

      if (error) return null

      return data?.rank || null
    } catch (error) {
      console.error('Error fetching user rank:', error)
      return null
    }
  },

  // Update leaderboard entries (typically called by a cron job or after user actions)
  async updateGlobalLeaderboard() {
    try {
      // Clear existing global leaderboard
      await supabase
        .from('leaderboard_entries')
        .delete()
        .eq('leaderboard_type', 'global_xp')

      // Get all users ordered by total XP
      const { data: users, error } = await supabase
        .from('users')
        .select('id, total_xp')
        .order('total_xp', { ascending: false })

      if (error) throw error

      // Create new leaderboard entries
      const leaderboardEntries = (users || []).map((user, index) => ({
        user_id: user.id,
        leaderboard_type: 'global_xp',
        score: user.total_xp,
        rank: index + 1,
        period_start: new Date(2024, 0, 1).toISOString(), // Start of current period
        period_end: new Date(2030, 11, 31).toISOString()  // End of current period
      }))

      const { error: insertError } = await supabase
        .from('leaderboard_entries')
        .insert(leaderboardEntries)

      return { error: insertError }
    } catch (error) {
      return { error }
    }
  },

  // Update monthly leaderboard
  async updateMonthlyLeaderboard(year: number, month: number) {
    try {
      const periodStart = new Date(year, month - 1, 1).toISOString()
      const periodEnd = new Date(year, month, 0, 23, 59, 59).toISOString()

      // Clear existing monthly leaderboard for this period
      await supabase
        .from('leaderboard_entries')
        .delete()
        .eq('leaderboard_type', 'monthly_xp')
        .gte('period_start', periodStart)
        .lte('period_end', periodEnd)

      // Calculate monthly XP for all users
      const { data: monthlyXP, error } = await supabase
        .from('user_progress_logs')
        .select('user_id, xp_earned')
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd)

      if (error) throw error

      // Aggregate XP by user
      const userXPMap = new Map<string, number>()
      monthlyXP?.forEach(log => {
        const currentXP = userXPMap.get(log.user_id) || 0
        userXPMap.set(log.user_id, currentXP + log.xp_earned)
      })

      // Sort by XP and create leaderboard entries
      const sortedUsers = Array.from(userXPMap.entries())
        .sort(([, xpA], [, xpB]) => xpB - xpA)
        .map(([userId, xp], index) => ({
          user_id: userId,
          leaderboard_type: 'monthly_xp',
          score: xp,
          rank: index + 1,
          period_start: periodStart,
          period_end: periodEnd
        }))

      if (sortedUsers.length > 0) {
        const { error: insertError } = await supabase
          .from('leaderboard_entries')
          .insert(sortedUsers)

        return { error: insertError }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  // Get leaderboard statistics
  async getLeaderboardStats(): Promise<{
    totalUsers: number
    activeUsers: number
    topSkills: Array<{ skillName: string; userCount: number }>
    challengeParticipation: number
  }> {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Get active users (users with activity in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: activeUsers } = await supabase
        .from('user_progress_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())

      // Get top skills by user count
      const { data: skillCounts } = await supabase
        .from('user_skill_progress')
        .select(`
          skill_id,
          user_skills!user_skill_progress_skill_id_fkey(name)
        `)

      const skillMap = new Map<string, number>()
      skillCounts?.forEach(item => {
        const skillName = item.user_skills?.name || 'Unknown'
        skillMap.set(skillName, (skillMap.get(skillName) || 0) + 1)
      })

      const topSkills = Array.from(skillMap.entries())
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5)
        .map(([skillName, userCount]) => ({ skillName, userCount }))

      // Get challenge participation
      const { count: challengeParticipation } = await supabase
        .from('challenge_participants')
        .select('*', { count: 'exact', head: true })

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        topSkills,
        challengeParticipation: challengeParticipation || 0
      }
    } catch (error) {
      console.error('Error fetching leaderboard stats:', error)
      return {
        totalUsers: 0,
        activeUsers: 0,
        topSkills: [],
        challengeParticipation: 0
      }
    }
  },

  // Get user's rank history
  async getUserRankHistory(userId: string, leaderboardType: string, days: number = 30) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('rank, created_at')
        .eq('user_id', userId)
        .eq('leaderboard_type', leaderboardType)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching user rank history:', error)
      return []
    }
  }
}