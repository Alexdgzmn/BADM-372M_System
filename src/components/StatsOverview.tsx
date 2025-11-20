import React from 'react';
import { UserProgress } from '../types';
import { Flame, Trophy } from 'lucide-react';
import { calculateExperienceToNextLevel } from '../utils/gameLogic';

interface StatsOverviewProps {
  progress: UserProgress;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ progress }) => {
  // Calculate XP progress for Total Level
  const currentLevelBaseXP = (progress.totalLevel - 1) ** 2 * 100;
  const xpIntoCurrentLevel = progress.totalExperience - currentLevelBaseXP;
  const xpNeededForNextLevel = calculateExperienceToNextLevel(progress.totalExperience);
  const progressPercentage = (xpIntoCurrentLevel / xpNeededForNextLevel) * 100;
  const clampedProgress = Math.min(100, Math.max(5, progressPercentage));

  return (
    <div className="mb-8">
      {/* Total Level Card with XP Bar and Streak */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg text-primary bg-primary/10 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">Level {progress.totalLevel}</div>
              <div className="text-sm text-gray-600">Total Level</div>
            </div>
          </div>
          
          {/* Current Streak */}
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <div className="text-lg font-bold text-orange-600">{progress.currentStreak}</div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{xpIntoCurrentLevel.toLocaleString()} / {xpNeededForNextLevel.toLocaleString()} XP</span>
            <span>{(xpNeededForNextLevel - xpIntoCurrentLevel).toLocaleString()} XP to next level</span>
          </div>
          <div className="w-full bg-secondary/10 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full transition-all duration-300 bg-primary"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};