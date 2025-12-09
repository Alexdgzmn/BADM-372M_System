import React, { useState } from 'react';
import { Trophy, Medal, Star, TrendingUp, Users, Filter, Crown, RefreshCw } from 'lucide-react';

interface LeaderboardUser {
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

interface LeaderboardsProps {
  users: LeaderboardUser[];
  currentUser: LeaderboardUser;
  onRefresh?: () => void;
}

export const Leaderboards: React.FC<LeaderboardsProps> = ({
  users,
  currentUser,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'weekly' | 'skills'>('global');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock friends data (in real app, this would be filtered by friendship)
  const friends = users.filter(user => user.id !== currentUser.id).slice(0, 10);
  
  const skills = ['all', 'JavaScript', 'Python', 'Design', 'Fitness', 'Music', 'Languages'];

  const getTabData = () => {
    switch (activeTab) {
      case 'friends':
        return [...friends, currentUser].sort((a, b) => b.xp - a.xp);
      case 'weekly':
        return users.sort((a, b) => b.weeklyXP - a.weeklyXP);
      case 'skills':
        if (selectedSkill === 'all') return users;
        return users.filter(user => user.favoriteSkill === selectedSkill);
      default:
        return users;
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600';
    if (rank === 2) return 'text-gray-600';
    if (rank === 3) return 'text-amber-600';
    return 'text-secondary/70';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-600" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-600" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-secondary/70">#{rank}</span>;
  };

  const tabData = getTabData();

  const handleRefresh = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboards</h1>
          <p className="text-white/70">See how you stack up with the community</p>
        </div>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>

      {/* Current User Highlight */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar || '/api/placeholder/48/48'}
            alt={currentUser?.name || 'User'}
            className="w-16 h-16 rounded-full border-4 border-secondary/30"
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">
              {currentUser.name}
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-secondary font-medium">
                <Trophy className="w-4 h-4" />
                Rank #{currentUser.rank}
              </span>
              <span className="text-white/80">
                Level {currentUser.level}
              </span>
              <span className="text-white/80">
                {currentUser.xp.toLocaleString()} XP
              </span>
              <span className="text-white/80">
                🔥 {currentUser.streak} day streak
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-secondary">
              {currentUser.completedMissions}
            </div>
            <div className="text-xs text-white/60">
              Missions Complete
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'global', label: '🌍 Global', icon: Trophy },
          { id: 'friends', label: '👥 Friends', icon: Users },
          { id: 'weekly', label: '📅 This Week', icon: TrendingUp },
          { id: 'skills', label: '🎯 By Skill', icon: Star },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Skills Filter */}
      {activeTab === 'skills' && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-white/60" />
            <span className="text-sm font-medium text-white">Filter by skill:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {skills.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedSkill === skill
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-secondary hover:bg-gray-200'
                }`}
              >
                {skill === 'all' ? 'All Skills' : skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary/10 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-secondary/10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-primary">
              {activeTab === 'global' && 'Global Rankings'}
              {activeTab === 'friends' && 'Friends Rankings'}
              {activeTab === 'weekly' && 'This Week\'s Top Performers'}
              {activeTab === 'skills' && `${selectedSkill === 'all' ? 'All Skills' : selectedSkill} Rankings`}
            </h3>
            <span className="text-sm text-gray-500">
              {tabData.length} {tabData.length === 1 ? 'user' : 'users'}
            </span>
          </div>
        </div>

        {/* Rankings List */}
        <div className="divide-y divide-secondary/5">
          {tabData.slice(0, 5).map((user, index) => {
            const displayRank = index + 1;
            const isCurrentUser = user.id === currentUser.id;
            
            return (
              <div
                key={user.id}
                className={`p-6 flex items-center gap-4 transition-colors ${
                  isCurrentUser
                    ? 'bg-primary/5 border-l-4 border-primary'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-10">
                  {getRankIcon(displayRank)}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={user?.avatar || '/api/placeholder/48/48'}
                    alt={user?.name || 'User'}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold ${isCurrentUser ? 'text-primary' : 'text-primary'}`}>
                        {user.name}
                        {isCurrentUser && <span className="text-xs">(You)</span>}
                      </h4>
                      <span className="text-xs bg-secondary/10 text-primary px-2 py-0.5 rounded-full">
                        Level {user.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span>{user.favoriteSkill}</span>
                      <span>•</span>
                      <span>🔥 {user.streak} days</span>
                      {user.badges.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{user.badges.length} badges</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {activeTab === 'weekly' 
                      ? `${user.weeklyXP.toLocaleString()} XP`
                      : `${user.xp.toLocaleString()} XP`
                    }
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.completedMissions} missions
                  </div>
                </div>

                {/* Badges Preview */}
                {user.badges.length > 0 && (
                  <div className="flex gap-1">
                    {user.badges.slice(0, 3).map((badge, badgeIndex) => (
                      <div
                        key={badgeIndex}
                        className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        title={badge}
                      >
                        {badge.charAt(0)}
                      </div>
                    ))}
                    {user.badges.length > 3 && (
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold">
                        +{user.badges.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Your Ranking Section - Show if user is not in top 5 */}
        {tabData.findIndex(user => user.id === currentUser.id) >= 5 && (
          <>
            <div className="px-6 py-3 bg-gray-50 border-t border-secondary/10">
              <div className="text-center text-sm text-gray-500">• • •</div>
            </div>
            <div className="p-6 flex items-center gap-4 bg-secondary/5 border-l-4 border-secondary">
              {/* Rank */}
              <div className="flex items-center justify-center w-10">
                <span className="text-sm font-bold text-secondary">
                  #{tabData.findIndex(user => user.id === currentUser.id) + 1}
                </span>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={currentUser?.avatar || '/api/placeholder/48/48'}
                  alt={currentUser?.name || 'User'}
                  className="w-12 h-12 rounded-full border-2 border-secondary"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-secondary">
                      {currentUser.name}
                      <span className="text-xs ml-1">(You)</span>
                    </h4>
                    <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
                      Level {currentUser.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                    <span>{currentUser.favoriteSkill}</span>
                    <span>•</span>
                    <span>🔥 {currentUser.streak} days</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <div className="text-lg font-bold text-secondary">
                  {activeTab === 'weekly' 
                    ? `${currentUser.weeklyXP.toLocaleString()} XP`
                    : `${currentUser.xp.toLocaleString()} XP`
                  }
                </div>
                <div className="text-sm text-gray-600">
                  {currentUser.completedMissions} missions
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {tabData.length === 0 && (
          <div className="p-12 text-center">
            <Trophy className="w-16 h-16 text-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary mb-2">
              No rankings yet
            </h3>
            <p className="text-secondary/60">
              Complete some missions to appear on the leaderboard!
            </p>
          </div>
        )}
      </div>

      {/* Achievement Spotlights */}
      {users.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Top Performer</span>
            </div>
            <div className="text-sm text-yellow-700">
              Most XP this week: <strong>{users[0]?.name}</strong>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Longest Streak</span>
            </div>
            <div className="text-sm text-green-700">
              {Math.max(...users.map(u => u.streak))} days by <strong>{users.find(u => u.streak === Math.max(...users.map(u => u.streak)))?.name}</strong>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-purple-800">Mission Master</span>
            </div>
            <div className="text-sm text-purple-700">
              Most missions: <strong>{users.reduce((prev, current) => (prev.completedMissions > current.completedMissions) ? prev : current).name}</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No achievements yet</p>
          <p className="text-sm text-gray-500 mt-1">Complete missions to appear on the leaderboard!</p>
        </div>
      )}
    </div>
  );
};