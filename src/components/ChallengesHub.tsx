import React, { useState } from 'react';
import { Users, Trophy, Calendar, Trash2 } from 'lucide-react';
import { Challenge } from '../types';

interface ChallengesHubProps {
  challenges: Challenge[];
  onJoinChallenge: (challengeId: string) => void;
  onCreateChallenge: () => void;
  onDeleteChallenge: (challengeId: string) => void;
  currentUserId: string;
}

export const ChallengesHub: React.FC<ChallengesHubProps> = ({
  challenges,
  onJoinChallenge,
  onCreateChallenge,
  onDeleteChallenge,
  currentUserId
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-challenges' | 'create'>('browse');
  const [filter, setFilter] = useState<'all' | 'sprint' | 'quest' | 'team' | 'skill'>('all');

  const filteredChallenges = challenges.filter(challenge => 
    filter === 'all' || challenge.type === filter
  );

  const myActiveChallenges = challenges.filter(c => c.isJoined);

  const getChallengeTypeColor = (type: Challenge['type']) => {
    switch (type) {
      case 'sprint': return 'bg-red-100 text-red-700';
      case 'quest': return 'bg-purple-100 text-purple-700';
      case 'team': return 'bg-blue-100 text-blue-700';
      case 'skill': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDuration = (days: number) => {
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days === 7) return '1 week';
    if (days < 30) return `${Math.ceil(days / 7)} weeks`;
    return `${Math.ceil(days / 30)} months`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Challenges</h1>
          <p className="text-white/70">Join others on skill-building journeys</p>
        </div>
        <button
          onClick={onCreateChallenge}
          className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Create Challenge
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {[
          { id: 'browse', label: 'Browse All', icon: Trophy },
          { id: 'my-challenges', label: 'My Challenges', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === 'my-challenges' && myActiveChallenges.length > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                {myActiveChallenges.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'browse' && (
        <div>
          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { id: 'all', label: 'All Challenges' },
              { id: 'sprint', label: '🏃‍♂️ Sprints' },
              { id: 'quest', label: '🗺️ Quests' },
              { id: 'team', label: '👥 Team' },
              { id: 'skill', label: '🎯 Skills' },
            ].map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id as any)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                  filter === filterOption.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-secondary hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-white rounded-xl shadow-sm border border-secondary/10 p-6 hover:shadow-md transition-shadow"
              >
                {/* Challenge Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChallengeTypeColor(challenge.type)}`}>
                        {challenge.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDuration(challenge.duration)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {challenge.description}
                    </p>
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {challenge.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-secondary/10 text-primary text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                  {challenge.skills.length > 3 && (
                    <span className="px-2 py-1 bg-secondary/10 text-gray-500 text-xs rounded-md">
                      +{challenge.skills.length - 3} more
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{challenge.participants.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Starts {challenge.startDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Creator */}
                {challenge.creator && (
                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src={challenge.creator.avatar}
                      alt={challenge.creator.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-500">
                      Created by {challenge.creator.name}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onJoinChallenge(challenge.id)}
                    disabled={challenge.isJoined}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      challenge.isJoined
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-primary text-white hover:opacity-90'
                    }`}
                  >
                    {challenge.isJoined ? '✓ Joined' : 'Join Challenge'}
                  </button>
                  {challenge.creator?.id === currentUserId && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this challenge?')) {
                          onDeleteChallenge(challenge.id);
                        }
                      }}
                      className="py-3 px-4 rounded-lg font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                      title="Delete Challenge"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'my-challenges' && (
        <div>
          {myActiveChallenges.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">
                No Active Challenges
              </h3>
              <p className="text-gray-600 mb-6">
                Join a challenge to start your journey with others!
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-colors"
              >
                Browse Challenges
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myActiveChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-white rounded-xl shadow-sm border border-secondary/10 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChallengeTypeColor(challenge.type)}`}>
                          {challenge.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          Progress: Day 3 of {challenge.duration}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-primary">
                        {challenge.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {challenge.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">73%</div>
                      <div className="text-xs text-gray-500">Complete</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all duration-300"
                        style={{ width: '73%' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};