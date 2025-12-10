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
  const nextLevelBaseXP = progress.totalLevel ** 2 * 100;
  const xpRequiredForLevel = nextLevelBaseXP - currentLevelBaseXP;
  const xpIntoCurrentLevel = progress.totalExperience - currentLevelBaseXP;
  const xpNeededForNextLevel = calculateExperienceToNextLevel(progress.totalExperience);
  const progressPercentage = (xpIntoCurrentLevel / xpRequiredForLevel) * 100;
  const clampedProgress = Math.min(100, Math.max(5, progressPercentage));

  return (
    <div className="mb-8">
      {/* Total Level Card with XP Bar and Streak */}
      <div className="card-game p-6 relative overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="level-badge">
                {progress.totalLevel}
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-accent-gold to-accent-orange bg-clip-text text-transparent">
                  Level {progress.totalLevel}
                </div>
                <div className="text-sm text-slate-300">Total Level</div>
              </div>
            </div>
            
            {/* Current Streak */}
            <div className="flex items-center gap-3 bg-gradient-to-br from-accent-orange/20 to-accent-gold/20 px-4 py-3 rounded-xl border-2 border-accent-orange/30 shadow-glow">
              <Flame className="w-6 h-6 text-accent-orange animate-pulse-slow" />
              <div>
                <div className="text-2xl font-bold text-accent-orange">{progress.currentStreak}</div>
                <div className="text-xs text-slate-300">Day Streak</div>
              </div>
            </div>
          </div>
          
          {/* XP Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-slate-400">
              <span className="font-medium">{xpIntoCurrentLevel.toLocaleString()} / {xpRequiredForLevel.toLocaleString()} XP</span>
              <span className="text-secondary">{xpNeededForNextLevel.toLocaleString()} XP to level up</span>
            </div>
            <div className="xp-bar">
              <div
                className="xp-fill relative"
                style={{ width: `${clampedProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};