export interface Skill {
  id: string;
  name: string;
  level: number;
  experience: number;
  experienceToNext: number;
  totalExperience: number;
  color: string;
  createdAt: Date;
}

export interface Mission {
  id: string;
  skillId: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  experience: number;
  timeLimit: number; // in minutes
  isCompleted: boolean;
  isRecurring: boolean;
  createdAt: Date;
  completedAt?: Date;
  timeRemaining?: number;
  // AI-generated content
  specificTasks?: string[];
  personalizedTips?: string[];
  resources?: { title: string; url: string; type: 'video' | 'article' | 'tutorial' }[];
  isAIGenerated?: boolean;
}

export interface UserProgress {
  totalLevel: number;
  totalExperience: number;
  missionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  skillLevelUpContributions?: { [skillId: string]: number }; // Track XP contribution per skill
}

export interface UserProfile {
  displayName: string;
  nickname: string;
  avatar?: string;
}

export interface Friend {
  id: string;
  userId: string;
  displayName: string;
  nickname: string;
  avatar?: string;
  level: number;
  currentStreak: number;
  status: 'online' | 'offline';
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserNickname: string;
  fromUserAvatar?: string;
  fromUserLevel: number;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface UserSearchResult {
  userId: string;
  displayName: string;
  nickname: string;
  avatar?: string;
  level: number;
  isFriend: boolean;
  hasPendingRequest: boolean;
}

// Social Feature Types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'sprint' | 'quest' | 'team' | 'skill';
  duration: number; // days
  startDate: Date;
  endDate: Date;
  skills: string[];
  participants: ChallengeParticipant[];
  maxParticipants?: number;
  privacy: 'public' | 'friends' | 'private';
  creator: {
    id: string;
    name: string;
    avatar: string;
  };
  rules: string[];
  tags: string[];
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  progress: {
    totalTasks: number;
    completedTasks: number;
    participantProgress: { [userId: string]: number };
  };
  isJoined?: boolean;
}

export interface ChallengeParticipant {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  joinedAt: Date;
  progress: number; // 0-100
  tasksCompleted: number;
  lastActivity: Date;
  isActive: boolean;
}

export interface SocialPost {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    level: number;
    skill?: string;
  };
  type: 'progress' | 'achievement' | 'struggle' | 'tip' | 'challenge_update';
  content: string;
  image?: string;
  timestamp: Date;
  likes: number;
  comments: SocialComment[];
  isLiked: boolean;
  tags?: string[];
  challengeId?: string;
  challengeName?: string;
  skillId?: string;
  missionId?: string;
  visibility: 'public' | 'friends' | 'challenge_members';
}

export interface SocialComment {
  id: string;
  postId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    level: number;
  };
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
  parentCommentId?: string; // For nested replies
}

export interface SocialActivity {
  id: string;
  type: 'friend_achievement' | 'challenge_invite' | 'new_follower' | 'challenge_complete' | 'streak_milestone' | 'level_up' | 'challenge_join';
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  targetUserId?: string; // For activities involving another user
  message: string;
  timestamp: Date;
  metadata?: {
    challengeId?: string;
    skillId?: string;
    level?: number;
    streak?: number;
    achievement?: string;
  };
  isRead: boolean;
  actionUrl?: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  weeklyXP: number;
  streak: number;
  completedMissions: number;
  rank: number;
  badges: string[];
  favoriteSkill: string;
  isCurrentUser?: boolean;
}

export interface SocialStats {
  totalFriends: number;
  activeChallenges: number;
  weeklyRank: number;
  totalRankImprovement: number;
}

export interface QuickChallenge {
  id: string;
  title: string;
  participants: number;
  timeLeft: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ChallengeFormData {
  title: string;
  description: string;
  type: 'sprint' | 'quest' | 'team' | 'skill';
  duration: number;
  skills: string[];
  privacy: 'public' | 'friends' | 'private';
  maxParticipants?: number;
  startDate: Date;
  rules: string[];
  tags: string[];
}