import { useState, useEffect } from 'react';
import { Plus, Gamepad2, Zap, LogOut, Home, Trophy, Users, Medal, User } from 'lucide-react';
import { Skill, Mission, UserProgress, UserProfile, Friend, FriendRequest, UserSearchResult, Challenge, SocialPost, SocialActivity, LeaderboardUser, SocialStats, QuickChallenge } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/AuthPage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useLocalStorage } from './hooks/useLocalStorage';
import { supabase } from './lib/database';
import { getAvatarUrl } from './utils/avatarUtils';
import * as friendsService from './services/friendsService';
import { 
  generateMissionForSkill, 
  calculateLevelFromExperience, 
  calculateExperienceToNextLevel
} from './utils/gameLogic';
import { SkillCard } from './components/SkillCard';
import { MissionCard } from './components/MissionCard';
import { StatsOverview } from './components/StatsOverview';
import { AddSkillModal } from './components/AddSkillModal';
import { EmailVerificationCallback } from './components/EmailVerificationCallback';
import { ChallengesHub } from './components/ChallengesHub';
import { CommunityBoard } from './components/CommunityBoard';
import { Leaderboards } from './components/Leaderboards';
import { SocialDashboard } from './components/SocialDashboard';
import { CreateChallengeModal } from './components/CreateChallengeModal';
import { ChallengeRecommendations } from './components/ChallengeRecommendations';
import { DatabaseTestPanel } from './components/DatabaseTestPanel';
import { FriendsModal } from './components/FriendsModal';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  
  // Check if this is an email verification callback
  const isEmailVerificationCallback = window.location.pathname === '/auth/callback' || 
                                      window.location.search.includes('access_token');
  
  if (isEmailVerificationCallback) {
    return <EmailVerificationCallback />;
  }
  
  const [skills, setSkills] = useLocalStorage<Skill[]>('system-skills', []);
  const [missions, setMissions] = useLocalStorage<Mission[]>('system-missions', []);
  const [userProgress, setUserProgress] = useLocalStorage<UserProgress>('system-progress', {
    totalLevel: 1,
    totalExperience: 0,
    missionsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    skillLevelUpContributions: {},
  });
  const [lastStreakDate, setLastStreakDate] = useLocalStorage<string | null>('system-last-streak-date', null);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('system-profile', {
    displayName: '',
    nickname: '',
    avatar: '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ displayName: '', nickname: '', avatar: '' });
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'challenges' | 'community' | 'leaderboards' | 'profile'>('dashboard');
  const [isCreateChallengeModalOpen, setIsCreateChallengeModalOpen] = useState(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);

  // Friends system state
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [allUsers] = useLocalStorage<UserProfile[]>('system-all-users', []); // Mock user database
  
  // Real data from Supabase
  const [realPosts, setRealPosts] = useState<SocialPost[]>([]);
  const [realChallenges, setRealChallenges] = useState<Challenge[]>([]);
  const [realLeaderboard, setRealLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  // Load user data from database on login
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) {
        setIsLoadingUserData(false);
        return;
      }

      console.log('📥 Loading user data from database...');
      
      try {
        // Load user progress
        const { userService } = await import('./services/userService');
        const progress = await userService.getUserProgress(user.id);
        if (progress) {
          setUserProgress({
            totalLevel: progress.total_level,
            totalExperience: progress.total_experience,
            missionsCompleted: progress.missions_completed,
            currentStreak: progress.current_streak,
            longestStreak: progress.longest_streak,
            skillLevelUpContributions: {},
          });
          console.log('✅ User progress loaded from database');
        }

        // Load user skills
        const { skillsService } = await import('./services/skillsService');
        const dbSkills = await skillsService.getUserSkills(user.id);
        if (dbSkills.length > 0) {
          setSkills(dbSkills.map(skill => ({
            id: skill.id,
            name: skill.name,
            level: skill.level,
            experience: skill.experience,
            totalExperience: skill.total_experience,
            experienceToNext: skill.experience_to_next,
            color: skill.color,
            createdAt: new Date(skill.created_at)
          })));
          console.log(`✅ Loaded ${dbSkills.length} skills from database`);
        }

        // Load user profile
        const profile = await userService.getUserProfile(user.id);
        if (profile) {
          setUserProfile({
            displayName: profile.display_name || '',
            nickname: profile.username || '', // nickname is stored as username in database
            avatar: profile.avatar_url || '',
          });
          console.log('✅ User profile loaded from database');
        }

        // Load user missions
        const { missionsService } = await import('./services/skillsService');
        const dbMissions = await missionsService.getUserMissions(user.id);
        if (dbMissions.length > 0) {
          setMissions(dbMissions.map(mission => ({
            id: mission.id,
            skillId: mission.skill_id,
            title: mission.title,
            description: mission.description,
            experience: mission.experience,
            isCompleted: mission.is_completed,
            isRecurring: mission.is_recurring,
            difficulty: mission.difficulty,
            specificTasks: mission.specific_tasks || [],
            learningResources: mission.learning_resources || [],
            personalizedTips: mission.personalized_tips || [],
            createdAt: new Date(mission.created_at),
            completedAt: mission.completed_at ? new Date(mission.completed_at) : undefined,
            dueDate: mission.due_date ? new Date(mission.due_date) : undefined,
          })));
          console.log(`✅ Loaded ${dbMissions.length} missions from database`);
        }

      } catch (error) {
        console.error('❌ Error loading user data:', error);
      } finally {
        setIsLoadingUserData(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  // Fetch real posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user?.id) {
        setIsLoadingPosts(false);
        return;
      }
      
      try {
        console.log('📥 Loading posts from database...');
        const { communityService } = await import('./services/communityService');
        const posts = await communityService.getPublicPosts({ userId: user.id });
        
        console.log('Raw posts from DB:', posts);
        
        // Convert Supabase posts to app format with null checks
        const formattedPosts: SocialPost[] = posts
          .filter(post => post.user?.id) // Only include posts with valid user data
          .map(post => ({
            id: post.id,
            userId: post.user_id,
            user: {
              id: post.user.id,
              name: post.user.display_name || 'Unknown User',
              avatar: getAvatarUrl(post.user.avatar_url),
              level: post.user.level || 1,
              skill: post.user.skill || ''
            },
            type: post.type as any,
            content: post.content,
            timestamp: new Date(post.created_at),
            likes: post.likes_count,
            comments: (post.comments || [])
              .filter(comment => comment.user?.id) // Only include comments with valid user data
              .map(comment => ({
                id: comment.id,
                postId: post.id,
                userId: comment.user_id,
                user: {
                  id: comment.user.id,
                  name: comment.user.display_name || 'Unknown User',
                  avatar: getAvatarUrl(comment.user.avatar_url),
                  level: comment.user.level || 1
                },
                content: comment.content,
                timestamp: new Date(comment.created_at),
                likes: comment.likes_count,
                isLiked: comment.is_liked || false
              })),
            isLiked: post.is_liked,
            tags: (post.tags as string[]) || [],
            visibility: post.visibility as any,
            image: post.image_url
          }));
        
        setRealPosts(formattedPosts);
        console.log(`✅ Loaded ${formattedPosts.length} posts from database`);
      } catch (error: any) {
        console.error('❌ Error fetching posts:', error);
        console.error('Error details:', error.message, error.stack);
        // Set empty array on error so UI doesn't break
        setRealPosts([]);
      } finally {
        setIsLoadingPosts(false);
      }
    };
    
    fetchPosts();
  }, [user?.id]);

  // Fetch challenges from Supabase
  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user?.id) {
        setIsLoadingChallenges(false);
        return;
      }
      
      try {
        console.log('📥 Loading challenges from database...');
        const { challengesService } = await import('./services/challengesService');
        const publicChallenges = await challengesService.getPublicChallenges({ status: 'active' });
        
        console.log('Raw challenges from DB:', publicChallenges);
        
        // Convert database challenges to app format
        const formattedChallenges: Challenge[] = publicChallenges.map(challenge => ({
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          type: challenge.type,
          duration: challenge.duration,
          startDate: new Date(challenge.start_date),
          endDate: new Date(challenge.end_date),
          skills: challenge.skills || [],
          participants: (challenge.participants || []).map(p => ({
            id: p.id,
            userId: p.user_id,
            name: '', // Will be populated from user_profiles
            avatar: getAvatarUrl(),
            joinedAt: new Date(p.joined_at),
            progress: p.progress_percentage,
            tasksCompleted: p.tasks_completed,
            lastActivity: new Date(p.last_activity),
            isActive: p.is_active
          })),
          privacy: challenge.privacy,
          creator: challenge.creator ? {
            id: challenge.creator.id,
            name: challenge.creator.display_name,
            avatar: getAvatarUrl(challenge.creator.avatar_url)
          } : undefined,
          rules: challenge.rules || [],
          tags: challenge.tags || [],
          status: challenge.status,
          progress: {
            totalTasks: challenge.participants?.[0]?.total_tasks || 0,
            completedTasks: challenge.participants?.[0]?.tasks_completed || 0,
            participantProgress: {}
          },
          isJoined: challenge.is_joined || false
        }));
        
        setRealChallenges(formattedChallenges);
        console.log(`✅ Loaded ${formattedChallenges.length} challenges from database`);
      } catch (error: any) {
        console.error('❌ Error fetching challenges:', error);
        console.error('Error details:', error.message, error.stack);
        // Set empty array on error so UI doesn't break
        setRealChallenges([]);
      } finally {
        setIsLoadingChallenges(false);
      }
    };
    
    fetchChallenges();
  }, [user?.id]);

  // Load friends data from database
  const loadFriendsData = async () => {
    if (!user?.id) return;
    
    setLoadingFriends(true);
    try {
      const [friendsData, requestsData] = await Promise.all([
        friendsService.getFriends(user.id),
        friendsService.getFriendRequests(user.id)
      ]);

      // Convert friendsService data to App Friend type
      const convertedFriends: Friend[] = friendsData.map(f => ({
        id: f.id,
        userId: f.userId,
        displayName: f.displayName,
        nickname: f.nickname,
        avatar: f.avatar,
        level: f.level,
        currentStreak: f.currentStreak,
        status: f.status
      }));

      // Convert friendsService data to App FriendRequest type
      const convertedRequests: FriendRequest[] = requestsData.map(r => ({
        id: r.id,
        fromUserId: r.senderId,
        fromUserName: r.senderDisplayName,
        fromUserNickname: r.senderNickname || 'user',
        fromUserAvatar: r.senderAvatar,
        fromUserLevel: r.senderLevel,
        toUserId: r.receiverId,
        status: r.status,
        createdAt: r.createdAt,
        // Legacy fields for compatibility
        senderId: r.senderId,
        senderDisplayName: r.senderDisplayName,
        senderNickname: r.senderNickname,
        senderAvatar: r.senderAvatar,
        receiverId: r.receiverId
      }));

      setFriends(convertedFriends);
      setFriendRequests(convertedRequests);
    } catch (error) {
      console.error('Error loading friends data:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  // Load friends when user logs in
  useEffect(() => {
    if (user?.id) {
      loadFriendsData();
    } else {
      setFriends([]);
      setFriendRequests([]);
    }
  }, [user?.id]);

  // Fetch leaderboard from Supabase
  useEffect(() => {
    const fetchLeaderboard = async () => {
      console.log('🔄 LEADERBOARD EFFECT TRIGGERED - user.id:', user?.id);
      
      if (!user?.id) {
        console.log('⚠️ No user ID, skipping leaderboard fetch');
        setIsLoadingLeaderboard(false);
        return;
      }
      
      try {
        console.log('📥 Loading leaderboard from database...');
        
        // Query user_profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('user_id, display_name, avatar_url');
        
        if (profilesError) throw profilesError;
        
        // Query user_progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('user_id, total_level, total_experience, current_streak, missions_completed');
        
        if (progressError) throw progressError;
        
        console.log('📊 Profiles:', profiles?.length, 'Progress records:', progressData?.length);
        
        // Create a map of user progress
        const progressMap = new Map(
          (progressData || []).map(p => [p.user_id, p])
        );
        
        // Join profiles with progress
        const formattedLeaderboard: LeaderboardUser[] = (profiles || [])
          .filter(profile => progressMap.has(profile.user_id))
          .map(profile => {
            const progress = progressMap.get(profile.user_id)!;
            return {
              id: profile.user_id,
              name: profile.display_name || 'Unknown User',
              avatar: getAvatarUrl(profile.avatar_url),
              level: progress.total_level || 1,
              xp: progress.total_experience || 0,
              weeklyXP: 0,
              streak: progress.current_streak || 0,
              completedMissions: progress.missions_completed || 0,
              rank: 0,
              badges: [],
              favoriteSkill: '',
              isCurrentUser: profile.user_id === user.id
            };
          })
          .sort((a, b) => b.xp - a.xp)
          .map((leaderboardUser, index) => ({
            ...leaderboardUser,
            rank: index + 1
          }));
        
        setRealLeaderboard(formattedLeaderboard);
        console.log(`✅ Loaded ${formattedLeaderboard.length} users on leaderboard`);
      } catch (error: any) {
        console.error('❌ Error fetching leaderboard:', error);
        console.error('Error details:', error.message, error.stack);
        setRealLeaderboard([]);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };
    
    fetchLeaderboard();
  }, [user?.id]);

  // Helper function to refresh leaderboard
  const refreshLeaderboard = async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 Refreshing leaderboard...');
      
      // Query user_profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, avatar_url');
      
      if (profilesError) throw profilesError;
      
      // Query user_progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('user_id, total_level, total_experience, current_streak, missions_completed');
      
      if (progressError) throw progressError;
      
      // Create a map of user progress
      const progressMap = new Map(
        (progressData || []).map(p => [p.user_id, p])
      );
      
      // Join profiles with progress
      const formattedLeaderboard: LeaderboardUser[] = (profiles || [])
        .filter(profile => progressMap.has(profile.user_id))
        .map(profile => {
          const progress = progressMap.get(profile.user_id)!;
          return {
            id: profile.user_id,
            name: profile.display_name || 'Unknown User',
            avatar: getAvatarUrl(profile.avatar_url),
            level: progress.total_level || 1,
            xp: progress.total_experience || 0,
            weeklyXP: 0,
            streak: progress.current_streak || 0,
            completedMissions: progress.missions_completed || 0,
            rank: 0,
            badges: [],
            favoriteSkill: '',
            isCurrentUser: profile.user_id === user.id
          };
        })
        .sort((a, b) => b.xp - a.xp)
        .map((leaderboardUser, index) => ({
          ...leaderboardUser,
          rank: index + 1
        }));
      
      setRealLeaderboard(formattedLeaderboard);
      console.log(`✅ Leaderboard refreshed: ${formattedLeaderboard.length} users`);
    } catch (error) {
      console.error('❌ Error refreshing leaderboard:', error);
    }
  };

  // Helper function to refresh posts
  const refreshPosts = async () => {
    if (!user?.id) return;
    
    try {
      const { communityService } = await import('./services/communityService');
      const posts = await communityService.getPublicPosts({ userId: user.id });
      
      const formattedPosts: SocialPost[] = posts.map(post => ({
        id: post.id,
        userId: post.user_id,
        user: {
          id: post.user.id,
          name: post.user.display_name,
          avatar: getAvatarUrl(post.user.avatar_url),
          level: post.user.level || 1,
          skill: post.user.skill
        },
        type: post.type as any,
        content: post.content,
        timestamp: new Date(post.created_at),
        likes: post.likes_count,
        comments: post.comments.map(comment => ({
          id: comment.id,
          postId: post.id,
          userId: comment.user_id,
          user: {
            id: comment.user.id,
            name: comment.user.display_name,
            avatar: getAvatarUrl(comment.user.avatar_url),
            level: comment.user.level || 1
          },
          content: comment.content,
          timestamp: new Date(comment.created_at),
          likes: comment.likes_count,
          isLiked: comment.is_liked || false
        })),
        isLiked: post.is_liked,
        tags: post.tags as string[],
        visibility: post.visibility as any,
        image: post.image_url
      }));
      
      setRealPosts(formattedPosts);
    } catch (error) {
      console.error('Error refreshing posts:', error);
    }
  };

  // Mock data for social features (in real app, this would come from API)
  const [mockChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: '30-Day JavaScript Mastery',
      description: 'Master JavaScript fundamentals through daily coding challenges',
      type: 'quest',
      duration: 30,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      skills: ['JavaScript'],
      participants: [
        { id: '1', userId: 'user1', name: 'Alex', avatar: getAvatarUrl(), joinedAt: new Date(), progress: 75, tasksCompleted: 22, lastActivity: new Date(), isActive: true },
        { id: '2', userId: 'user2', name: 'Sarah', avatar: getAvatarUrl(), joinedAt: new Date(), progress: 60, tasksCompleted: 18, lastActivity: new Date(), isActive: true }
      ],
      privacy: 'public',
      creator: { id: 'creator1', name: 'CodeMentor', avatar: getAvatarUrl() },
      rules: ['Complete daily coding challenge', 'Share progress in community'],
      tags: ['programming', 'beginner-friendly'],
      status: 'active',
      progress: { totalTasks: 30, completedTasks: 22, participantProgress: { 'user1': 75, 'user2': 60 } },
      isJoined: false
    },
    {
      id: '2',
      title: '7-Day Design Sprint',
      description: 'Create a complete design system in one week',
      type: 'sprint',
      duration: 7,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      skills: ['Design', 'UI/UX'],
      participants: [
        { id: '3', userId: 'user3', name: 'Maya', avatar: getAvatarUrl(), joinedAt: new Date(), progress: 40, tasksCompleted: 3, lastActivity: new Date(), isActive: true }
      ],
      privacy: 'public',
      creator: { id: 'creator2', name: 'DesignGuru', avatar: getAvatarUrl() },
      rules: ['Daily design exercises', 'Get feedback from peers'],
      tags: ['design', 'intensive'],
      status: 'active',
      progress: { totalTasks: 7, completedTasks: 3, participantProgress: { 'user3': 40 } },
      isJoined: true
    }
  ]);

  const [mockActivities] = useState<SocialActivity[]>([]);

  // Mock leaderboard users - computed based on current user data
  const mockLeaderboardUsers: LeaderboardUser[] = [
    {
      id: 'user1',
      name: userProfile.displayName || user?.email || 'You',
      avatar: getAvatarUrl(),
      level: userProgress.totalLevel,
      xp: userProgress.totalExperience,
      weeklyXP: 245,
      streak: userProgress.currentStreak,
      completedMissions: userProgress.missionsCompleted,
      rank: 1,
      badges: ['Streak Master', 'Code Warrior'],
      favoriteSkill: skills[0]?.name || 'JavaScript',
      isCurrentUser: true
    },
    {
      id: 'user2',
      name: 'Sarah Johnson',
      avatar: getAvatarUrl(),
      level: 8,
      xp: 3250,
      weeklyXP: 180,
      streak: 21,
      completedMissions: 45,
      rank: 2,
      badges: ['Team Player', 'Mentor'],
      favoriteSkill: 'Python'
    },
    {
      id: 'user3',
      name: 'Maya Patel',
      avatar: getAvatarUrl(),
      level: 6,
      xp: 2100,
      weeklyXP: 320,
      streak: 12,
      completedMissions: 38,
      rank: 3,
      badges: ['Designer', 'Creative'],
      favoriteSkill: 'Design'
    }
  ];

  const mockSocialStats: SocialStats = {
    totalFriends: friends.length,
    activeChallenges: 2,
    weeklyRank: 1,
    totalRankImprovement: 3
  };

  const mockQuickChallenges: QuickChallenge[] = [
    {
      id: 'q1',
      title: 'Weekend Code Challenge',
      participants: 23,
      timeLeft: '2 days',
      difficulty: 'medium'
    },
    {
      id: 'q2',
      title: 'Daily Meditation',
      participants: 156,
      timeLeft: '12 hours',
      difficulty: 'easy'
    }
  ];

  // Navigation tabs
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'leaderboards', label: 'Rankings', icon: Medal },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  // No longer auto-calculating total level from skills sum
  // Total level now gains XP independently when skills level up

  // Reset Total Level if no skills exist (cleanup for orphaned XP)
  useEffect(() => {
    if (skills.length === 0 && (userProgress.totalExperience > 0 || userProgress.totalLevel > 1)) {
      setUserProgress(prev => ({
        ...prev,
        totalLevel: 1,
        totalExperience: 0,
        skillLevelUpContributions: {},
      }));
    }
  }, [skills.length, userProgress.totalExperience, userProgress.totalLevel, setUserProgress]);

  // Show loading spinner while checking auth
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />;
  }

  const addSkill = async (name: string, color: string) => {
    // If user is logged in, save to database first and use its ID
    if (user?.id) {
      const { skillsService } = await import('./services/skillsService');
      const result = await skillsService.createSkill(user.id, {
        name,
        color,
        level: 1,
        experience: 0
      });
      
      if (result.error) {
        console.error('❌ Failed to save skill to database:', result.error);
        return;
      } else if (result.data) {
        console.log('✅ Skill saved to database with ID:', result.data.id);
        const newSkill: Skill = {
          id: result.data.id, // Use database ID from the start
          name,
          level: 1,
          experience: 0,
          experienceToNext: 100,
          totalExperience: 0,
          color,
          createdAt: new Date(result.data.created_at),
        };
        setSkills(prev => [...prev, newSkill]);
      }
    } else {
      // Guest mode: use local UUID
      const newSkill: Skill = {
        id: crypto.randomUUID(),
        name,
        level: 1,
        experience: 0,
        experienceToNext: 100,
        totalExperience: 0,
        color,
        createdAt: new Date(),
      };
      setSkills(prev => [...prev, newSkill]);
    }
  };

  const deleteSkill = async (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    // Show confirmation dialog
    const confirmed = window.confirm(`Remove Skill?\n\nThis will permanently delete "${skill.name}" and remove all XP earned from this skill.`);
    if (!confirmed) return;

    // Remove the skill
    setSkills(prev => prev.filter(s => s.id !== skillId));

    // Remove missions associated with this skill
    setMissions(prev => prev.filter(m => m.skillId !== skillId));

    // Deduct XP from total level using tracked contributions
    setUserProgress(prev => {
      const xpContributed = prev.skillLevelUpContributions?.[skillId] || 0;
      const newTotalXP = Math.max(0, prev.totalExperience - xpContributed);
      const newTotalLevel = calculateLevelFromExperience(newTotalXP);
      
      // Remove this skill from contributions tracking
      const newContributions = { ...prev.skillLevelUpContributions };
      delete newContributions[skillId];
      
      return {
        ...prev,
        totalExperience: newTotalXP,
        totalLevel: newTotalLevel,
        skillLevelUpContributions: newContributions,
      };
    });

    // Delete from database if user is logged in
    if (user?.id) {
      import('./services/skillsService').then(({ skillsService }) => {
        skillsService.deleteSkill(skillId).then(result => {
          if (result.error) {
            console.error('Failed to delete skill from database:', result.error);
          } else {
            console.log('✅ Skill deleted from database');
          }
        });
      });
    }
  };

  const generateMission = async (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    try {
      const newMission = await generateMissionForSkill(skill, userProgress, missions);
      
      // Save to database if user is logged in
      if (user?.id) {
        const { missionsService } = await import('./services/skillsService');
        const result = await missionsService.createMission(user.id, {
          skill_id: skillId,
          title: newMission.title,
          description: newMission.description,
          experience: newMission.experience,
          difficulty: newMission.difficulty,
          is_ai_generated: true,
          specific_tasks: newMission.specificTasks || [],
          learning_resources: newMission.learningResources || [],
          personalized_tips: newMission.personalizedTips || [],
        });
        
        if (result.error) {
          console.error('❌ Failed to save mission to database:', result.error);
        } else if (result.data) {
          console.log('✅ Mission saved to database with ID:', result.data.id);
          // Use database ID
          newMission.id = result.data.id;
        }
      }
      
      setMissions(prev => [...prev, newMission]);
    } catch (error) {
      console.error('Failed to generate mission:', error);
    }
  };

  const completeMission = async (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.isCompleted) return;

    // Update mission
    setMissions(prev => 
      prev.map(m => 
        m.id === missionId 
          ? { ...m, isCompleted: true, completedAt: new Date() }
          : m
      )
    );
    
    // Save mission completion to database
    if (user?.id) {
      const { missionsService } = await import('./services/skillsService');
      const result = await missionsService.completeMission(missionId, user.id);
      if (result.error) {
        console.error('❌ Failed to mark mission as completed in database:', result.error);
      } else {
        console.log('✅ Mission marked as completed in database');
      }
    }

    // Track if skill leveled up
    let skillLeveledUp = false;
    const skill = skills.find(s => s.id === mission.skillId);
    if (skill) {
      const oldLevel = skill.level;
      const newTotalExp = skill.totalExperience + mission.experience;
      const newLevel = calculateLevelFromExperience(newTotalExp);
      skillLeveledUp = newLevel > oldLevel;
    }

    // Update skill experience
    setSkills(prev => 
      prev.map(skill => {
        if (skill.id === mission.skillId) {
          const newTotalExp = skill.totalExperience + mission.experience;
          const newLevel = calculateLevelFromExperience(newTotalExp);
          const newExpToNext = calculateExperienceToNextLevel(newTotalExp);
          
          // Save skill experience to database
          if (user?.id) {
            console.log('💾 Saving skill experience to database:', {
              skillId: skill.id,
              experience: mission.experience,
              newTotalExp
            });
            import('./services/skillsService').then(({ skillsService }) => {
              skillsService.updateSkillExperience(skill.id, mission.experience)
                .then(result => {
                  if (result.error) {
                    console.error('❌ Failed to update skill experience:', result.error);
                  } else {
                    console.log('✅ Skill experience updated successfully');
                  }
                })
                .catch(err => {
                  console.error('❌ Error updating skill experience:', err);
                });
            });
          }
          
          return {
            ...skill,
            level: newLevel,
            totalExperience: newTotalExp,
            experienceToNext: newExpToNext,
          };
        }
        return skill;
      })
    );

    // Update user progress in state and database
    setUserProgress(prev => {
      // Award XP to total level if skill leveled up (50 XP per skill level)
      const totalLevelXP = skillLeveledUp ? 50 : 0;
      const newTotalXP = prev.totalExperience + totalLevelXP;
      const newTotalLevel = calculateLevelFromExperience(newTotalXP);

      // Track this skill's contribution to total level
      const contributions = prev.skillLevelUpContributions || {};
      const updatedContributions = {
        ...contributions,
        [mission.skillId]: (contributions[mission.skillId] || 0) + totalLevelXP
      };

      // Update streak: only increment once per day
      const today = new Date().toDateString();
      const lastDate = lastStreakDate;
      let newStreak = prev.currentStreak;
      
      // Check if this is the first mission completed today
      if (lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        // If last streak was yesterday, increment. Otherwise reset to 1
        if (lastDate === yesterdayStr) {
          newStreak = prev.currentStreak + 1;
        } else if (lastDate === null || lastDate === today) {
          // First mission ever or already counted today, keep current streak
          newStreak = prev.currentStreak || 1;
        } else {
          // Streak broken, restart at 1
          newStreak = 1;
        }
        
        // Update the last streak date
        setLastStreakDate(today);
      }

      const newProgress = {
        ...prev,
        totalExperience: newTotalXP,
        totalLevel: newTotalLevel,
        missionsCompleted: prev.missionsCompleted + 1,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        skillLevelUpContributions: updatedContributions,
      };

      // Save to database if user is logged in
      if (user?.id) {
        console.log('💾 Saving progress to database for user:', user.id);
        import('./services/userService').then(({ userService }) => {
          userService.updateUserProgress(user.id, {
            total_level: newTotalLevel,
            total_experience: newTotalXP,
            missions_completed: prev.missionsCompleted + 1,
            current_streak: newStreak,
            longest_streak: Math.max(prev.longestStreak, newStreak),
            last_activity_date: new Date().toISOString().split('T')[0]
          }).then(result => {
            if (result.error) {
              console.error('❌ Failed to save progress to database:', result.error);
            } else {
              console.log('✅ Progress saved to database successfully:', result.data);
              // Refresh leaderboard after progress update
              refreshLeaderboard();
            }
          }).catch(err => {
            console.error('❌ Error saving to database:', err);
          });
        });
      } else {
        console.log('⚠️ User not logged in, progress only saved locally');
      }

      return newProgress;
    });
  };

  // Social feature handlers
  const handleJoinChallenge = async (challengeId: string) => {
    if (!user?.id) {
      alert('You must be logged in to join challenges');
      return;
    }

    // Check if this is a real database challenge (UUID format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(challengeId)) {
      alert('This is a demo challenge. Please create a real challenge to participate!');
      return;
    }

    console.log('💾 Joining challenge:', challengeId);
    try {
      const { challengesService } = await import('./services/challengesService');
      const { data, error } = await challengesService.joinChallenge(challengeId, user.id);
      
      if (error) {
        console.error('❌ Failed to join challenge:', error);
        alert('Failed to join challenge. Please try again.');
      } else {
        console.log('✅ Successfully joined challenge');
        // Update local state
        setRealChallenges(prev => prev.map(c => 
          c.id === challengeId ? { ...c, isJoined: true } : c
        ));
      }
    } catch (error) {
      console.error('❌ Error joining challenge:', error);
      alert('Failed to join challenge. Please try again.');
    }
  };

  const handleCreateChallenge = async (challengeData: any) => {
    if (!user?.id) {
      alert('You must be logged in to create challenges');
      return;
    }

    console.log('💾 Creating challenge with data:', challengeData);
    try {
      const { challengesService } = await import('./services/challengesService');
      
      // Prepare challenge data with proper validation
      const challengePayload = {
        title: challengeData.title,
        description: challengeData.description,
        type: challengeData.type as 'quest' | 'sprint' | 'marathon' | 'daily',
        duration: parseInt(challengeData.duration) || 7,
        start_date: challengeData.startDate || new Date().toISOString(),
        end_date: challengeData.endDate || new Date(Date.now() + (parseInt(challengeData.duration) || 7) * 24 * 60 * 60 * 1000).toISOString(),
        skills: Array.isArray(challengeData.skills) ? challengeData.skills : [],
        difficulty: challengeData.difficulty as 'easy' | 'medium' | 'hard' | undefined,
        privacy: (challengeData.privacy || 'public') as 'public' | 'private' | 'friends',
        rules: Array.isArray(challengeData.rules) ? challengeData.rules : [],
        tags: Array.isArray(challengeData.tags) ? challengeData.tags : [],
        reward_xp: parseInt(challengeData.rewardXP) || 100
      };
      
      console.log('💾 Sending to database:', challengePayload);
      const { data, error } = await challengesService.createChallenge(user.id, challengePayload);
      
      if (error) {
        console.error('❌ Failed to create challenge:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        alert(`Failed to create challenge: ${error.message || 'Please try again.'}`);
      } else {
        console.log('✅ Challenge created successfully:', data);
        setIsCreateChallengeModalOpen(false);
        // Reload challenges to show the new one
        const publicChallenges = await challengesService.getPublicChallenges({ status: 'active' });
        setRealChallenges(publicChallenges.map(challenge => ({
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          type: challenge.type,
          duration: challenge.duration,
          startDate: new Date(challenge.start_date),
          endDate: new Date(challenge.end_date),
          skills: challenge.skills,
          participants: [],
          privacy: challenge.privacy,
          creator: challenge.creator,
          rules: challenge.rules,
          tags: challenge.tags,
          status: challenge.status,
          progress: { totalTasks: 0, completedTasks: 0, participantProgress: {} },
          isJoined: false
        })));
      }
    } catch (error: any) {
      console.error('❌ Error creating challenge:', error);
      console.error('Error stack:', error.stack);
      alert(`Failed to create challenge: ${error.message || 'Please try again.'}`);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user?.id) {
      alert('You must be logged in to like posts');
      return;
    }

    try {
      const { communityService } = await import('./services/communityService');
      await communityService.togglePostLike(postId, user.id);
      // Refresh posts to show updated like count
      await refreshPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    if (!user?.id) {
      alert('You must be logged in to comment');
      return;
    }

    if (!content.trim()) {
      return;
    }

    try {
      const { communityService } = await import('./services/communityService');
      const { error } = await communityService.addComment(postId, user.id, content);
      
      if (error) {
        console.error('Error adding comment:', error);
        alert('Failed to add comment. Please try again.');
      } else {
        // Refresh posts to show new comment
        await refreshPosts();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReportPost = (postId: string) => {
    console.log('Reporting post:', postId);
    // In real app, this would call API to report post
  };

  const handleSharePost = (postId: string) => {
    console.log('Sharing post:', postId);
    // In real app, this would call API to share post
  };

  const handleCreatePost = async (postData: { type: string; content: string; tags: string[]; image?: string }) => {
    if (!user?.id) {
      alert('You must be logged in to create a post');
      return;
    }

    try {
      const { communityService } = await import('./services/communityService');
      const { data, error } = await communityService.createPost(user.id, {
        type: postData.type as any,
        content: postData.content,
        image_url: postData.image,
        tags: postData.tags,
        visibility: 'public'
      });

      if (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
      } else {
        alert('Post created successfully!');
        console.log('Post created:', data);
        // Refresh posts to show the new one
        await refreshPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user?.id) {
      alert('You must be logged in to delete a post');
      return;
    }

    try {
      const { communityService } = await import('./services/communityService');
      await communityService.deletePost(postId, user.id);
      
      alert('Post deleted successfully!');
      // Refresh posts to remove the deleted one
      await refreshPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. ' + (error instanceof Error ? error.message : 'Please try again.'));
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!user?.id) {
      alert('You must be logged in to delete a challenge');
      return;
    }

    try {
      const { challengesService } = await import('./services/challengesService');
      await challengesService.deleteChallenge(challengeId, user.id);
      
      alert('Challenge deleted successfully!');
      // Refresh challenges to remove the deleted one
      setRealChallenges(prev => prev.filter(c => c.id !== challengeId));
    } catch (error) {
      console.error('Error deleting challenge:', error);
      alert('Failed to delete challenge. ' + (error instanceof Error ? error.message : 'Please try again.'));
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const { userService } = await import('./services/userService');
      await userService.updateUserProfile(user.id, {
        avatar_url: publicUrl
      });

      // Update local state
      setUserProfile(prev => ({ ...prev, avatar: publicUrl }));
      setProfileForm(prev => ({ ...prev, avatar: publicUrl }));

      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload profile picture. Please try again.');
    }
  };

  // Profile handlers
  const handleEditProfile = () => {
    setProfileForm({
      displayName: userProfile.displayName,
      nickname: userProfile.nickname,
      avatar: userProfile.avatar
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!profileForm.displayName.trim() || !profileForm.nickname.trim()) {
      alert('Please fill in both name and nickname');
      return;
    }
    
    // Check if nickname contains only valid characters
    if (!/^[a-zA-Z0-9_]+$/.test(profileForm.nickname)) {
      alert('Nickname can only contain letters, numbers, and underscores');
      return;
    }

    const newProfile = {
      ...userProfile,
      displayName: profileForm.displayName.trim(),
      nickname: profileForm.nickname.trim()
    };

    setUserProfile(newProfile);
    setIsEditingProfile(false);

    // Save to database if user is logged in
    if (user?.id) {
      const { userService } = await import('./services/userService');
      const result = await userService.updateUserProfile(user.id, {
        display_name: newProfile.displayName,
        username: newProfile.nickname, // nickname maps to username in database
      });
      
      if (result.error) {
        console.error('❌ Failed to save profile to database:', result.error);
      } else {
        console.log('✅ Profile saved to database (display name & nickname)');
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileForm({ displayName: '', nickname: '' });
  };

  // Friends system handlers
  const handleSearchUsers = async (query: string): Promise<UserSearchResult[]> => {
    if (!user || query.length < 2) return [];
    
    try {
      const results = await friendsService.searchUsers(query, user.id);
      return results;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    if (!user) return;
    
    try {
      const result = await friendsService.sendFriendRequest(user.id, userId);
      if (result.success) {
        alert('Friend request sent!');
      } else {
        alert(result.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!user) return;
    
    try {
      const result = await friendsService.acceptFriendRequest(requestId, user.id);
      if (result.success) {
        // Refresh friends and requests
        await loadFriendsData();
      } else {
        alert(result.error || 'Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!user) return;
    
    try {
      const result = await friendsService.rejectFriendRequest(requestId, user.id);
      if (result.success) {
        // Refresh friend requests
        await loadFriendsData();
      } else {
        alert(result.error || 'Failed to reject friend request');
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      alert('Failed to reject friend request');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user || !confirm('Are you sure you want to remove this friend?')) return;
    
    try {
      const result = await friendsService.removeFriend(user.id, friendId);
      if (result.success) {
        // Refresh friends list
        await loadFriendsData();
      } else {
        alert(result.error || 'Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend');
    }
  };

  const handleInviteFriends = () => {
    setIsFriendsModalOpen(true);
  };

  const handleViewAllActivities = () => {
    console.log('Viewing all activities');
    // In real app, this would navigate to activities page
  };

  const activeMissions = missions.filter(m => !m.isCompleted);
  const completedMissions = missions.filter(m => m.isCompleted);

  // User profile for AI recommendations
  const userRecommendationProfile = {
    level: userProgress.totalLevel,
    skills: skills.map(s => s.name),
    completedChallenges: ['challenge1', 'challenge2'], // Mock completed challenges
    preferences: ['collaborative', 'short-term'], // Mock preferences
    currentStreak: userProgress.currentStreak,
    timeAvailability: 'medium' as const,
    learningStyle: 'collaborative' as const
  };

  const friendsActivity = [
    { challengeId: '1', friendsParticipating: 2 },
    { challengeId: '2', friendsParticipating: 1 }
  ];

  return (
    <div className="min-h-screen bg-primary font-body">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-secondary p-3 rounded-xl shadow-lg">
                <img 
                  src="/logo.png" 
                  alt="The System Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <h1 className="text-4xl font-bold font-headline text-white">
                THE SYSTEM
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-secondary/80 font-body">Welcome back!</p>
                <p className="text-sm font-medium text-white font-body">
                  {userProfile.displayName || user.email}
                  {userProfile.nickname && <span className="text-secondary ml-1">(@{userProfile.nickname})</span>}
                </p>
              </div>
              <button
                onClick={signOut}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors duration-200 shadow-sm"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium font-body transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-secondary text-primary shadow-md'
                    : 'text-sky-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Overview */}
            <StatsOverview progress={userProgress} />

            {/* Skills Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-secondary">Your Skills</h2>
                <button
                  onClick={() => setIsAddSkillModalOpen(true)}
                  className="bg-secondary text-primary px-4 py-2 rounded-lg font-medium hover:bg-secondary/90 transition-all duration-200 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </button>
              </div>

              {skills.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">Ready to Level Up?</h3>
                  <p className="text-secondary/70 mb-4">Add your first skill to start your growth journey!</p>
                  <button
                    onClick={() => setIsAddSkillModalOpen(true)}
                    className="bg-secondary text-primary px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition-all duration-200"
                  >
                    Add Your First Skill
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {skills.map(skill => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      onGenerateMission={generateMission}
                      onDeleteSkill={deleteSkill}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Active Missions */}
            {activeMissions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-secondary mb-6">Active Missions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeMissions.map(mission => {
                    const skill = skills.find(s => s.id === mission.skillId);
                    return skill ? (
                      <MissionCard
                        key={mission.id}
                        mission={mission}
                        skill={skill}
                        onComplete={completeMission}
                      />
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Social Dashboard */}
            <div className="mb-8">
              <SocialDashboard
                activities={mockActivities}
                stats={mockSocialStats}
                quickChallenges={mockQuickChallenges}
                onViewAllActivities={handleViewAllActivities}
                onJoinChallenge={handleJoinChallenge}
                onInviteFriends={handleInviteFriends}
                onCreateChallenge={() => setIsCreateChallengeModalOpen(true)}
              />
            </div>

            {/* AI Challenge Recommendations */}
            <div className="mb-8">
              <ChallengeRecommendations
                userProfile={userRecommendationProfile}
                availableChallenges={realChallenges.length > 0 ? realChallenges : mockChallenges}
                friendsActivity={friendsActivity}
                onJoinChallenge={handleJoinChallenge}
              />
            </div>
          </>
        )}

        {activeTab === 'challenges' && (
          <ChallengesHub
            challenges={realChallenges.length > 0 ? realChallenges : mockChallenges}
            onJoinChallenge={handleJoinChallenge}
            onCreateChallenge={() => setIsCreateChallengeModalOpen(true)}
            onDeleteChallenge={handleDeleteChallenge}
            currentUserId={user?.id || ''}
          />
        )}

        {activeTab === 'community' && (
          <CommunityBoard
            posts={realPosts}
            currentUser={{
              id: user?.id || '',
              name: userProfile.displayName || user?.email || 'You',
              avatar: getAvatarUrl(userProfile.avatar),
              level: userProgress.totalLevel,
              xp: userProgress.totalExperience,
              weeklyXP: 0,
              streak: userProgress.currentStreak,
              completedMissions: userProgress.missionsCompleted,
              rank: 0,
              badges: [],
              favoriteSkill: skills[0]?.name || '',
              isCurrentUser: true
            }}
            onLikePost={handleLikePost}
            onLikeComment={(commentId) => console.log('Like comment:', commentId)}
            onAddComment={handleAddComment}
            onReportPost={handleReportPost}
            onSharePost={handleSharePost}
            onCreatePost={handleCreatePost}
            onDeletePost={handleDeletePost}
          />
        )}

        {activeTab === 'leaderboards' && (
          <Leaderboards
            users={realLeaderboard}
            currentUser={realLeaderboard.find(u => u.isCurrentUser) || {
              id: user?.id || '',
              name: userProfile.displayName || user?.email || 'You',
              avatar: getAvatarUrl(userProfile.avatar),
              level: userProgress.totalLevel,
              xp: userProgress.totalExperience,
              weeklyXP: 0,
              streak: userProgress.currentStreak,
              completedMissions: userProgress.missionsCompleted,
              rank: 0,
              badges: [],
              favoriteSkill: skills[0]?.name || '',
              isCurrentUser: true
            }}
            onRefresh={refreshLeaderboard}
          />
        )}

        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-secondary mb-6">Profile & Settings</h2>
            
            {/* User Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary/10 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">Profile Information</h3>
                {!isEditingProfile && (
                  <button
                    onClick={handleEditProfile}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              
              {!isEditingProfile ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Display Name:</span>
                    <span className="font-medium text-primary">
                      {userProfile.displayName || <span className="text-gray-400 italic">Not set</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nickname:</span>
                    <span className="font-medium text-primary">
                      {userProfile.nickname ? `@${userProfile.nickname}` : <span className="text-gray-400 italic">Not set</span>}
                    </span>
                  </div>
                  {(!userProfile.displayName || !userProfile.nickname) && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Set your display name and nickname to appear in rankings, challenges, and community features!
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Avatar Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-4">
                      <img
                        src={getAvatarUrl(profileForm.avatar)}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div className="flex-1">
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                        >
                          Upload Photo
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Max 2MB. JPG, PNG, or GIF</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.displayName}
                      onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                      placeholder="Your full name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">This will be shown to other users</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unique Nickname <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-2 text-gray-500">@</span>
                      <input
                        type="text"
                        value={profileForm.nickname}
                        onChange={(e) => setProfileForm({ ...profileForm, nickname: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                        placeholder="username"
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        maxLength={20}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Letters, numbers, and underscores only</p>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Account Info */}
            <div className="bg-white rounded-xl shadow-sm border border-secondary/10 p-6">
              <h3 className="text-lg font-semibold text-primary mb-3">Account Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-primary">{user.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Level:</span>
                  <span className="font-medium text-primary">Level {userProgress.totalLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total XP:</span>
                  <span className="font-medium text-primary">{userProgress.totalExperience.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Streak:</span>
                  <span className="font-medium text-primary">{userProgress.currentStreak} days</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddSkillModal
        isOpen={isAddSkillModalOpen}
        onClose={() => setIsAddSkillModalOpen(false)}
        onAddSkill={addSkill}
      />

      <CreateChallengeModal
        isOpen={isCreateChallengeModalOpen}
        onClose={() => setIsCreateChallengeModalOpen(false)}
        onCreateChallenge={handleCreateChallenge}
      />

      <FriendsModal
        isOpen={isFriendsModalOpen}
        onClose={() => setIsFriendsModalOpen(false)}
        friends={friends}
        friendRequests={friendRequests}
        onSearchUsers={handleSearchUsers}
        onSendRequest={handleSendFriendRequest}
        onAcceptRequest={handleAcceptRequest}
        onRejectRequest={handleRejectRequest}
        onRemoveFriend={handleRemoveFriend}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
