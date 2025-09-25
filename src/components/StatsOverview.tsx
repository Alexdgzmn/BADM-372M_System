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
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      label: 'Experience',
      value: progress.totalExperience.toLocaleString(),
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Missions Done',
      value: progress.missionsCompleted,
      icon: Target,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Current Streak',
      value: progress.currentStreak,
      icon: Flame,
      color: 'text-orange-600 bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};