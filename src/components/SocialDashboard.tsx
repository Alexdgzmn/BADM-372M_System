import React, { useState } from 'react';
import { Users, Trophy, MessageCircle, Calendar, Star, TrendingUp, Bell, Plus } from 'lucide-react';

interface SocialActivity {
  id: string;
  type: 'friend_achievement' | 'challenge_invite' | 'new_follower' | 'challenge_complete' | 'streak_milestone';
  user: {
    name: string;
    avatar: string;
  };
  message: string;
  timestamp: Date;
  actionUrl?: string;
}

interface SocialStats {
  totalFriends: number;
  activeChallenges: number;
  weeklyRank: number;
  totalRankImprovement: number;
}

interface QuickChallenge {
  id: string;
  title: string;
  participants: number;
  timeLeft: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface SocialDashboardProps {
  activities: SocialActivity[];
  stats: SocialStats;
  quickChallenges: QuickChallenge[];
  onViewAllActivities: () => void;
  onJoinChallenge: (challengeId: string) => void;
  onInviteFriends: () => void;
  onCreateChallenge: () => void;
}

export const SocialDashboard: React.FC<SocialDashboardProps> = ({
  activities,
  stats,
  quickChallenges,
  onViewAllActivities,
  onJoinChallenge,
  onInviteFriends,
  onCreateChallenge
}) => {
  const [activeTab, setActiveTab] = useState<'activities' | 'challenges'>('activities');

  const getActivityIcon = (type: SocialActivity['type']) => {
    switch (type) {
      case 'friend_achievement': return '🏆';
      case 'challenge_invite': return '📨';
      case 'new_follower': return '👋';
      case 'challenge_complete': return '✅';
      case 'streak_milestone': return '🔥';
      default: return '📱';
    }
  };

  const getDifficultyColor = (difficulty: QuickChallenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary/10 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b border-secondary/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-primary">Social Hub</h2>
          <button
            onClick={onInviteFriends}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
          >
            <Users className="w-4 h-4" />
            Invite Friends
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.totalFriends}
            </div>
            <div className="text-xs text-gray-500">Friends</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.activeChallenges}
            </div>
            <div className="text-xs text-gray-500">Active Challenges</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              #{stats.weeklyRank}
            </div>
            <div className="text-xs text-gray-500">Weekly Rank</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${stats.totalRankImprovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalRankImprovement >= 0 ? '+' : ''}{stats.totalRankImprovement}
            </div>
            <div className="text-xs text-gray-500">Rank Change</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-secondary/10">
        <button
          onClick={() => setActiveTab('activities')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'activities'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Bell className="w-4 h-4" />
            Recent Activity
            {activities.length > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                {activities.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'challenges'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" />
            Quick Join
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'activities' && (
          <div>
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-primary mb-2">
                  No recent activity
                </h3>
                <p className="text-gray-600 mb-4">
                  Connect with friends and join challenges to see updates here!
                </p>
                <button
                  onClick={onInviteFriends}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors"
                >
                  Find Friends
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <img
                        src={activity.user.avatar}
                        alt={activity.user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="absolute ml-7 -mt-3 text-lg">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{activity.user.name}</span>{' '}
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {activities.length > 5 && (
                  <button
                    onClick={onViewAllActivities}
                    className="w-full py-2 text-sm text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    View all activities ({activities.length})
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'challenges' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary">
                Trending Challenges
              </h3>
              <button
                onClick={onCreateChallenge}
                className="flex items-center gap-2 text-sm text-primary font-medium hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create
              </button>
            </div>

            {quickChallenges.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-primary mb-2">
                  No challenges available
                </h3>
                <p className="text-gray-600 mb-4">
                  Be the first to create a challenge!
                </p>
                <button
                  onClick={onCreateChallenge}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors"
                >
                  Create Challenge
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {quickChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="flex items-center justify-between p-4 border border-secondary/10 rounded-lg hover:border-primary/20 hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-primary">
                          {challenge.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {challenge.participants} joined
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {challenge.timeLeft} left
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onJoinChallenge(challenge.id)}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};