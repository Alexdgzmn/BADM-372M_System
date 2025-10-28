export interface Skill {
  id: string;
  name: string;
  level: number;
  experience: number;
  experienceToNext: number;
  totalExperience: number;
  color: string;
  createdAt: Date;
}

export interface Mission {
  id: string;
  skillId: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  experience: number;
  timeLimit: number; // in minutes
  isCompleted: boolean;
  isRecurring: boolean;
  createdAt: Date;
  completedAt?: Date;
  timeRemaining?: number;
  // AI-generated content
  specificTasks?: string[];
  personalizedTips?: string[];
  isAIGenerated?: boolean;
}

export interface UserProgress {
  totalLevel: number;
  totalExperience: number;
  missionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
}