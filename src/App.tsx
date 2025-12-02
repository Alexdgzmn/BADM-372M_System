import { useState, useEffect } from 'react';
import { Plus, Gamepad2, Zap, LogOut, Home, Trophy, Users, Medal, User } from 'lucide-react';
import { Skill, Mission, UserProgress, UserProfile, Friend, FriendRequest, UserSearchResult, Challenge, SocialPost, SocialActivity, LeaderboardUser, SocialStats, QuickChallenge } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/AuthPage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useLocalStorage } from './hooks/useLocalStorage';
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
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('system-profile', {
    displayName: '',
    nickname: '',
    avatar: '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ displayName: '', nickname: '' });
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'challenges' | 'community' | 'leaderboards' | 'profile'>('dashboard');
  const [isCreateChallengeModalOpen, setIsCreateChallengeModalOpen] = useState(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  
  // Friends system state
  const [friends, setFriends] = useLocalStorage<Friend[]>('system-friends', []);
  const [friendRequests, setFriendRequests] = useLocalStorage<FriendRequest[]>('system-friend-requests', []);
  const [allUsers] = useLocalStorage<UserProfile[]>('system-all-users', []); // Mock user database
  
  // Real posts from Supabase
  const [realPosts, setRealPosts] = useState<SocialPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  // Fetch real posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user?.id) return;
      
      try {
        const { communityService } = await import('./services/communityService');
        const posts = await communityService.getPublicPosts({ userId: user.id });
        
        // Convert Supabase posts to app format
        const formattedPosts: SocialPost[] = posts.map(post => ({
          id: post.id,
          userId: post.user_id,
          user: {
            id: post.user.id,
            name: post.user.display_name,
            avatar: post.user.avatar_url || '/api/placeholder/40/40',
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
              avatar: comment.user.avatar_url || '/api/placeholder/32/32',
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
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoadingPosts(false);
      }
    };
    
    fetchPosts();
  }, [user?.id]);

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
          avatar: post.user.avatar_url || '/api/placeholder/40/40',
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
            avatar: comment.user.avatar_url || '/api/placeholder/32/32',
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
        { id: '1', userId: 'user1', name: 'Alex', avatar: '/api/placeholder/32/32', joinedAt: new Date(), progress: 75, tasksCompleted: 22, lastActivity: new Date(), isActive: true },
        { id: '2', userId: 'user2', name: 'Sarah', avatar: '/api/placeholder/32/32', joinedAt: new Date(), progress: 60, tasksCompleted: 18, lastActivity: new Date(), isActive: true }
      ],
      privacy: 'public',
      creator: { id: 'creator1', name: 'CodeMentor', avatar: '/api/placeholder/32/32' },
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
        { id: '3', userId: 'user3', name: 'Maya', avatar: '/api/placeholder/32/32', joinedAt: new Date(), progress: 40, tasksCompleted: 3, lastActivity: new Date(), isActive: true }
      ],
      privacy: 'public',
      creator: { id: 'creator2', name: 'DesignGuru', avatar: '/api/placeholder/32/32' },
      rules: ['Daily design exercises', 'Get feedback from peers'],
      tags: ['design', 'intensive'],
      status: 'active',
      progress: { totalTasks: 7, completedTasks: 3, participantProgress: { 'user3': 40 } },
      isJoined: true
    }
  ]);

  const [mockActivities] = useState<SocialActivity[]>([
    {
      id: '1',
      type: 'friend_achievement',
      userId: 'user2',
      user: { id: 'user2', name: 'Sarah', avatar: '/api/placeholder/32/32' },
      message: 'completed the JavaScript Fundamentals challenge!',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false
    },
    {
      id: '2',
      type: 'challenge_join',
      userId: 'user3',
      user: { id: 'user3', name: 'Maya', avatar: '/api/placeholder/32/32' },
      message: 'joined the 7-Day Design Sprint challenge',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false
    }
  ]);

  // Mock leaderboard users - computed based on current user data
  const mockLeaderboardUsers: LeaderboardUser[] = [
    {
      id: 'user1',
      name: userProfile.displayName || user?.email || 'You',
      avatar: '/api/placeholder/48/48',
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
      avatar: '/api/placeholder/48/48',
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
      avatar: '/api/placeholder/48/48',
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

  const addSkill = (name: string, color: string) => {
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
  };

  const deleteSkill = (skillId: string) => {
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
  };

  const generateMission = async (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    try {
      const newMission = await generateMissionForSkill(skill, userProgress, missions);
      setMissions(prev => [...prev, newMission]);
    } catch (error) {
      console.error('Failed to generate mission:', error);
    }
  };

  const completeMission = (missionId: string) => {
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

    // Update user progress
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

      return {
        ...prev,
        totalExperience: newTotalXP,
        totalLevel: newTotalLevel,
        missionsCompleted: prev.missionsCompleted + 1,
        currentStreak: prev.currentStreak + 1,
        longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1),
        skillLevelUpContributions: updatedContributions,
      };
    });
  };

  // Social feature handlers
  const handleJoinChallenge = (challengeId: string) => {
    console.log('Joining challenge:', challengeId);
    // In real app, this would call API to join challenge
  };

  const handleCreateChallenge = (challengeData: any) => {
    console.log('Creating challenge:', challengeData);
    setIsCreateChallengeModalOpen(false);
    // In real app, this would call API to create challenge
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

  // Profile handlers
  const handleEditProfile = () => {
    setProfileForm({
      displayName: userProfile.displayName,
      nickname: userProfile.nickname
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    if (!profileForm.displayName.trim() || !profileForm.nickname.trim()) {
      alert('Please fill in both name and nickname');
      return;
    }
    
    // Check if nickname contains only valid characters
    if (!/^[a-zA-Z0-9_]+$/.test(profileForm.nickname)) {
      alert('Nickname can only contain letters, numbers, and underscores');
      return;
    }

    setUserProfile({
      ...userProfile,
      displayName: profileForm.displayName.trim(),
      nickname: profileForm.nickname.trim()
    });
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileForm({ displayName: '', nickname: '' });
  };

  // Friends system handlers
  const handleSearchUsers = (query: string) => {
    if (query.length < 2) return [];
    
    // Mock search - filter mock users by name or nickname
    const mockUsers: UserSearchResult[] = [
      { id: '1', userId: 'mock-user-1', displayName: 'Alex Chen', nickname: 'alexchen', avatar: null, level: 12, currentStreak: 5, isFriend: false, hasPendingRequest: false },
      { id: '2', userId: 'mock-user-2', displayName: 'Sarah Johnson', nickname: 'sarah_j', avatar: null, level: 8, currentStreak: 3, isFriend: false, hasPendingRequest: false },
      { id: '3', userId: 'mock-user-3', displayName: 'Mike Taylor', nickname: 'miketaylor', avatar: null, level: 15, currentStreak: 10, isFriend: false, hasPendingRequest: false },
      { id: '4', userId: 'mock-user-4', displayName: 'Emma Davis', nickname: 'emma_d', avatar: null, level: 6, currentStreak: 2, isFriend: false, hasPendingRequest: false },
      { id: '5', userId: 'mock-user-5', displayName: 'John Smith', nickname: 'johnsmith', avatar: null, level: 20, currentStreak: 15, isFriend: false, hasPendingRequest: false },
    ];

    const lowerQuery = query.toLowerCase();
    return mockUsers
      .filter(user => {
        // Don't show users who are already friends
        const isAlreadyFriend = friends.some(f => f.userId === user.userId);
        // Don't show users with pending requests
        const hasPending = friendRequests.some(r => r.senderId === user.userId && r.status === 'pending');
        
        const matchesSearch = user.displayName.toLowerCase().includes(lowerQuery) || 
                            user.nickname.toLowerCase().includes(lowerQuery);
        
        return matchesSearch && !isAlreadyFriend;
      })
      .map(user => ({
        ...user,
        isFriend: friends.some(f => f.userId === user.userId),
        hasPendingRequest: friendRequests.some(r => r.senderId === user.userId && r.status === 'pending')
      }));
  };

  const handleSendFriendRequest = (user: UserSearchResult) => {
    const newRequest: FriendRequest = {
      id: `request-${Date.now()}`,
      senderId: 'current-user', // In real app, would be current user's ID
      senderDisplayName: userProfile.displayName || 'You',
      senderNickname: userProfile.nickname,
      senderAvatar: null,
      receiverId: user.userId,
      status: 'pending',
      createdAt: new Date()
    };
    
    setFriendRequests([...friendRequests, newRequest]);
    alert(`Friend request sent to ${user.displayName}!`);
  };

  const handleAcceptRequest = (request: FriendRequest) => {
    const newFriend: Friend = {
      id: `friend-${Date.now()}`,
      userId: request.senderId,
      displayName: request.senderDisplayName,
      nickname: request.senderNickname || undefined,
      avatar: request.senderAvatar || undefined,
      level: 10, // Mock level
      currentStreak: 5, // Mock streak
      status: 'online'
    };

    setFriends([...friends, newFriend]);
    setFriendRequests(friendRequests.filter(r => r.id !== request.id));
  };

  const handleRejectRequest = (requestId: string) => {
    setFriendRequests(friendRequests.filter(r => r.id !== requestId));
  };

  const handleRemoveFriend = (friendId: string) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      setFriends(friends.filter(f => f.id !== friendId));
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
              <div className="flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="The System Logo" 
                  className="w-16 h-16 object-cover rounded-xl"
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
                availableChallenges={mockChallenges}
                friendsActivity={friendsActivity}
                onJoinChallenge={handleJoinChallenge}
              />
            </div>
          </>
        )}

        {activeTab === 'challenges' && (
          <div className="relative">
            {/* Work in Progress Overlay */}
            <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
              <div className="bg-secondary/95 p-8 rounded-xl shadow-2xl max-w-md text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-2xl font-bold text-primary mb-2">Work in Progress</h3>
                <p className="text-primary/70">This feature is currently under development. Check back soon!</p>
              </div>
            </div>
            {/* Original Component (hidden but functional) */}
            <div className="opacity-20 pointer-events-none">
              <ChallengesHub
                challenges={mockChallenges}
                onJoinChallenge={handleJoinChallenge}
                onCreateChallenge={() => setIsCreateChallengeModalOpen(true)}
              />
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="relative">
            {/* Work in Progress Overlay */}
            <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
              <div className="bg-secondary/95 p-8 rounded-xl shadow-2xl max-w-md text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-2xl font-bold text-primary mb-2">Work in Progress</h3>
                <p className="text-primary/70">This feature is currently under development. Check back soon!</p>
              </div>
            </div>
            {/* Original Component (hidden but functional) */}
            <div className="opacity-20 pointer-events-none">
              <CommunityBoard
                posts={realPosts}
                currentUser={mockLeaderboardUsers[0]}
                onLikePost={handleLikePost}
                onLikeComment={(commentId) => console.log('Like comment:', commentId)}
                onAddComment={handleAddComment}
                onReportPost={handleReportPost}
                onSharePost={handleSharePost}
                onCreatePost={handleCreatePost}
              />
            </div>
          </div>
        )}

        {activeTab === 'leaderboards' && (
          <div className="relative">
            {/* Work in Progress Overlay */}
            <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
              <div className="bg-secondary/95 p-8 rounded-xl shadow-2xl max-w-md text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-2xl font-bold text-primary mb-2">Work in Progress</h3>
                <p className="text-primary/70">This feature is currently under development. Check back soon!</p>
              </div>
            </div>
            {/* Original Component (hidden but functional) */}
            <div className="opacity-20 pointer-events-none">
              <Leaderboards
                users={mockLeaderboardUsers}
                currentUser={mockLeaderboardUsers[0]}
              />
            </div>
          </div>
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