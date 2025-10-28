import { useState, useEffect } from 'react';
import { Plus, Gamepad2, Zap, LogOut, Home, Trophy, Users, Medal, User } from 'lucide-react';
import { Skill, Mission, UserProgress, Challenge, SocialPost, SocialActivity, LeaderboardUser, SocialStats, QuickChallenge } from './types';
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
  });
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'challenges' | 'community' | 'leaderboards' | 'profile'>('dashboard');
  const [isCreateChallengeModalOpen, setIsCreateChallengeModalOpen] = useState(false);

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

  const [mockPosts] = useState<SocialPost[]>([
    {
      id: '1',
      userId: 'user1',
      user: { id: 'user1', name: 'Alex', avatar: '/api/placeholder/40/40', level: 5, skill: 'JavaScript' },
      type: 'progress',
      content: 'Just completed my first React component! The feeling when everything clicks is amazing 🚀',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 12,
      comments: [
        {
          id: 'c1',
          postId: '1',
          userId: 'user2',
          user: { id: 'user2', name: 'Sarah', avatar: '/api/placeholder/32/32', level: 3 },
          content: 'Awesome work! React can be tricky at first but you got it!',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          likes: 3,
          isLiked: false
        }
      ],
      isLiked: true,
      tags: ['react', 'frontend'],
      visibility: 'public'
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

  const [mockLeaderboardUsers] = useState<LeaderboardUser[]>([
    {
      id: 'user1',
      name: 'Alex Chen',
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
  ]);

  const mockSocialStats: SocialStats = {
    totalFriends: 12,
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

  // Update user progress when skills change
  useEffect(() => {
    const totalExp = skills.reduce((sum, skill) => sum + skill.totalExperience, 0);
    const totalLevel = calculateLevelFromExperience(totalExp);

    setUserProgress(prev => ({
      ...prev,
      totalLevel,
      totalExperience: totalExp,
    }));
  }, [skills, setUserProgress]);

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
    setUserProgress(prev => ({
      ...prev,
      missionsCompleted: prev.missionsCompleted + 1,
      currentStreak: prev.currentStreak + 1,
      longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1),
    }));
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

  const handleLikePost = (postId: string) => {
    console.log('Liking post:', postId);
    // In real app, this would call API to like post
  };

  const handleAddComment = (postId: string, content: string) => {
    console.log('Adding comment to post:', postId, content);
    // In real app, this would call API to add comment
  };

  const handleReportPost = (postId: string) => {
    console.log('Reporting post:', postId);
    // In real app, this would call API to report post
  };

  const handleSharePost = (postId: string) => {
    console.log('Sharing post:', postId);
    // In real app, this would call API to share post
  };

  const handleInviteFriends = () => {
    console.log('Inviting friends');
    // In real app, this would open invite modal
  };

  const handleViewAllActivities = () => {
    console.log('Viewing all activities');
    // In real app, this would navigate to activities page
  };

  const activeMissions = missions.filter(m => !m.isCompleted);
  const completedMissions = missions.filter(m => m.isCompleted);

  // User profile for AI recommendations
  const userProfile = {
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
                  src="/The system logo.png" 
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
                <p className="text-sm font-medium text-white font-body">{user.email}</p>
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
                    : 'text-white/70 hover:text-white hover:bg-white/10'
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
                userProfile={userProfile}
                availableChallenges={mockChallenges}
                friendsActivity={friendsActivity}
                onJoinChallenge={handleJoinChallenge}
              />
            </div>

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
          </>
        )}

        {activeTab === 'challenges' && (
          <ChallengesHub
            challenges={mockChallenges}
            onJoinChallenge={handleJoinChallenge}
            onCreateChallenge={() => setIsCreateChallengeModalOpen(true)}
          />
        )}

        {activeTab === 'community' && (
          <CommunityBoard
            posts={mockPosts}
            currentUser={mockLeaderboardUsers[0]}
            onLikePost={handleLikePost}
            onLikeComment={(commentId) => console.log('Like comment:', commentId)}
            onAddComment={handleAddComment}
            onReportPost={handleReportPost}
            onSharePost={handleSharePost}
          />
        )}

        {activeTab === 'leaderboards' && (
          <Leaderboards
            users={mockLeaderboardUsers}
            currentUser={mockLeaderboardUsers[0]}
          />
        )}

        {activeTab === 'profile' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-secondary mb-4">Profile Settings</h2>
            <p className="text-secondary/70">Profile management coming soon!</p>
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