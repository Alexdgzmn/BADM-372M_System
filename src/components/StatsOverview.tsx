import React from 'react';
import { UserProgress } from '../types';
import { TrendingUp, Target, Flame, Trophy } from 'lucide-react';

interface StatsOverviewProps {
  progress: UserProgress;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ progress }) => {
  const stats = [
    {
      label: 'Total Level',
      value: progress.totalLevel,
      icon: Trophy,
      color: 'text-primary bg-primary/10',
    },
    {
      label: 'Experience',
      value: progress.totalExperience.toLocaleString(),
      icon: TrendingUp,
      color: 'text-secondary bg-secondary/10',
    },
    {
      label: 'Missions Done',
      value: progress.missionsCompleted,
      icon: Target,
      color: 'text-accent-purple bg-accent-purple/10',
    },
    {
      label: 'Current Streak',
      value: progress.currentStreak,
      icon: Flame,
      color: 'text-primary bg-primary/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-secondary/10 p-4">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};