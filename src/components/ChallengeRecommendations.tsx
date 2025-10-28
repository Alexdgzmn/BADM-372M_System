import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Clock, TrendingUp, Star, Loader2, RefreshCw } from 'lucide-react';
import { generateChallengeRecommendations, ChallengeMatchingContext, ChallengeRecommendation } from '../services/aiService';
import { Challenge } from '../types';

interface ChallengeRecommendationsProps {
  userProfile: {
    level: number;
    skills: string[];
    completedChallenges: string[];
    preferences: string[];
    currentStreak: number;
    timeAvailability: 'low' | 'medium' | 'high';
    learningStyle: 'visual' | 'practical' | 'collaborative' | 'independent';
  };
  availableChallenges: Challenge[];
  friendsActivity?: {
    challengeId: string;
    friendsParticipating: number;
  }[];
  onJoinChallenge: (challengeId: string) => void;
  className?: string;
}

export const ChallengeRecommendations: React.FC<ChallengeRecommendationsProps> = ({
  userProfile,
  availableChallenges,
  friendsActivity,
  onJoinChallenge,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState<ChallengeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      // Convert Challenge[] to the format expected by the AI service
      const challengesForAI = availableChallenges.map(challenge => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        skills: challenge.skills,
        difficulty: mapDifficulty(challenge.duration, challenge.skills.length),
        duration: challenge.duration,
        participants: challenge.participants.length,
        successRate: calculateSuccessRate(challenge),
        tags: challenge.tags
      }));

      // Get community trends (mock data for now)
      const communityTrends = availableChallenges.map(challenge => ({
        challengeId: challenge.id,
        popularityScore: Math.floor(Math.random() * 100), // Mock popularity
        recentCompletions: Math.floor(Math.random() * 20) // Mock completions
      }));

      const context: ChallengeMatchingContext = {
        userProfile,
        availableChallenges: challengesForAI,
        friendsActivity,
        communityTrends
      };

      const result = await generateChallengeRecommendations(context);
      if (result) {
        // Filter to only include challenges that exist and aren't already joined
        const validRecommendations = result.filter(rec => {
          const challenge = availableChallenges.find(c => c.id === rec.challengeId);
          return challenge && !challenge.isJoined;
        });
        
        setRecommendations(validRecommendations);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (availableChallenges.length > 0) {
      generateRecommendations();
    }
  }, [availableChallenges.length]);

  const getChallengeById = (id: string) => {
    return availableChallenges.find(c => c.id === id);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (availableChallenges.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-secondary/10 p-6 ${className}`}>
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-primary mb-2">
            No Challenges Available
          </h3>
          <p className="text-gray-600">
            Check back later for personalized challenge recommendations!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-secondary/10 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b border-secondary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">AI Recommendations</h2>
              <p className="text-sm text-gray-600">
                Challenges picked just for you
                {lastUpdated && (
                  <span className="ml-1">
                    • Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <button
            onClick={generateRecommendations}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-6">
        {isLoading && recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-gray-600">Analyzing your profile and finding perfect matches...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-primary mb-2">
              No Recommendations Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Complete your profile or join some challenges to get personalized recommendations!
            </p>
            <button
              onClick={generateRecommendations}
              className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors"
            >
              Get Recommendations
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const challenge = getChallengeById(rec.challengeId);
              if (!challenge) return null;

              return (
                <div
                  key={rec.challengeId}
                  className="border border-secondary/10 rounded-lg p-4 hover:border-primary/20 hover:bg-primary/5 transition-colors"
                >
                  {/* Challenge Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-primary">
                          #{index + 1}
                        </span>
                        <h3 className="font-semibold text-primary">
                          {challenge.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(rec.confidence)}`}>
                          {rec.confidence} confidence
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {challenge.description}
                      </p>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className={`text-2xl font-bold ${getScoreColor(rec.matchScore)}`}>
                        {rec.matchScore}%
                      </div>
                      <div className="text-xs text-gray-500">Match</div>
                    </div>
                  </div>

                  {/* Challenge Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {challenge.duration} days
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {challenge.participants.length} joined
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {Math.round(rec.estimatedCompletionProbability * 100)}% completion rate
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {challenge.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-secondary/10 text-primary text-xs rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Reasons */}
                  <div className="mb-3">
                    <div className="text-sm font-medium text-primary mb-1">Why this matches you:</div>
                    <ul className="text-sm text-gray-600">
                      {rec.reasons.map((reason, reasonIndex) => (
                        <li key={reasonIndex} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full"></span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Motivation */}
                  <div className="bg-primary/5 rounded-lg p-3 mb-3">
                    <div className="text-sm font-medium text-primary mb-1">💪 Motivation</div>
                    <p className="text-sm text-gray-600">{rec.personalizedMotivation}</p>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => onJoinChallenge(challenge.id)}
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
                    >
                      Join Challenge
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
function mapDifficulty(duration: number, skillsCount: number): 'easy' | 'medium' | 'hard' {
  if (duration <= 7 && skillsCount <= 1) return 'easy';
  if (duration <= 21 && skillsCount <= 2) return 'medium';
  return 'hard';
}

function calculateSuccessRate(challenge: Challenge): number {
  // Mock calculation - in real app, this would be based on historical data
  const baseRate = 0.7;
  const difficultyPenalty = challenge.duration > 30 ? 0.1 : 0;
  const popularityBonus = challenge.participants.length > 50 ? 0.1 : 0;
  
  return Math.max(0.3, Math.min(0.9, baseRate - difficultyPenalty + popularityBonus));
}