import React from 'react';
import { Skill } from '../types';
import { Trophy, Target, Zap } from 'lucide-react';

interface SkillCardProps {
  skill: Skill;
  onGenerateMission: (skillId: string) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, onGenerateMission }) => {
  const progressPercentage = ((skill.totalExperience - (skill.level - 1) ** 2 * 100) / skill.experienceToNext) * 100;
  const clampedProgress = Math.min(100, Math.max(5, progressPercentage));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary/10 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: skill.color }}
          />
          <h3 className="text-lg font-semibold text-secondary">{skill.name}</h3>
        </div>
        <div className="flex items-center gap-1 bg-primary/20 px-3 py-1 rounded-full">
          <Trophy className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium text-secondary">Level {skill.level}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm text-secondary/70 mb-1">
            <span>Progress to Level {skill.level + 1}</span>
            <span>{skill.experienceToNext} XP remaining</span>
          </div>
          <div className="w-full bg-secondary/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${clampedProgress}%`,
                backgroundColor: skill.color
              }}
            />
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1 text-secondary/70">
            <Zap className="w-4 h-4" />
            <span>{skill.totalExperience} Total XP</span>
          </div>
        </div>

        <button
          onClick={() => onGenerateMission(skill.id)}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Target className="w-4 h-4" />
          Generate Mission
        </button>
      </div>
    </div>
  );
};