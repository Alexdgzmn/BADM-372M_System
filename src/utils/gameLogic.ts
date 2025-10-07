import { Skill, Mission } from '../types';

export const calculateLevelFromExperience = (experience: number): number => {
  return Math.floor(Math.sqrt(experience / 100)) + 1;
};

export const calculateExperienceForLevel = (level: number): number => {
  return (level - 1) ** 2 * 100;
};

export const calculateExperienceToNextLevel = (currentExp: number): number => {
  const currentLevel = calculateLevelFromExperience(currentExp);
  const nextLevelExp = calculateExperienceForLevel(currentLevel + 1);
  return nextLevelExp - currentExp;
};

export const generateMissionForSkill = (skill: Skill): Mission => {
  const skillLevel = skill.level;
  const difficulty = getDifficultyForLevel(skillLevel);
  const missionTemplates = getMissionTemplates(skill.name, difficulty);
  const template = missionTemplates[Math.floor(Math.random() * missionTemplates.length)];
  
  return {
    id: crypto.randomUUID(),
    skillId: skill.id,
    title: template.title,
    description: template.description,
    difficulty,
    experience: getExperienceForDifficulty(difficulty, skillLevel),
    timeLimit: getTimeLimitForDifficulty(difficulty),
    isCompleted: false,
    isRecurring: template.isRecurring || false,
    createdAt: new Date(),
  };
};

const getDifficultyForLevel = (level: number): Mission['difficulty'] => {
  if (level < 3) return 'Easy';
  if (level < 6) return 'Medium';
  if (level < 10) return 'Hard';
  return 'Expert';
};

const getExperienceForDifficulty = (difficulty: Mission['difficulty'], level: number): number => {
  const baseExp = { Easy: 50, Medium: 100, Hard: 200, Expert: 400 };
  return Math.floor(baseExp[difficulty] * (1 + level * 0.1));
};

const getTimeLimitForDifficulty = (difficulty: Mission['difficulty']): number => {
  const timeLimits = { Easy: 30, Medium: 60, Hard: 120, Expert: 240 };
  return timeLimits[difficulty];
};

const getMissionTemplates = (skillName: string, difficulty: Mission['difficulty']) => {
  const templates = {
    Easy: [
      { title: `Quick ${skillName} Practice`, description: `Spend 15 minutes practicing ${skillName} fundamentals`, isRecurring: false },
      { title: `${skillName} Basics`, description: `Review core concepts in ${skillName}`, isRecurring: true },
      { title: `Daily ${skillName} Warmup`, description: `Start your day with light ${skillName} exercises`, isRecurring: true },
    ],
    Medium: [
      { title: `${skillName} Deep Dive`, description: `Tackle an intermediate ${skillName} challenge`, isRecurring: false },
      { title: `Build Something`, description: `Create a small project using ${skillName} skills`, isRecurring: false },
      { title: `Study Session`, description: `Intensive ${skillName} learning session`, isRecurring: true },
    ],
    Hard: [
      { title: `${skillName} Challenge`, description: `Complete a difficult ${skillName} task`, isRecurring: false },
      { title: `Teach ${skillName}`, description: `Explain ${skillName} concepts to someone else`, isRecurring: false },
      { title: `Master Class`, description: `Advanced ${skillName} techniques practice`, isRecurring: false },
    ],
    Expert: [
      { title: `${skillName} Mastery`, description: `Push your ${skillName} skills to the limit`, isRecurring: false },
      { title: `Innovation Challenge`, description: `Create something new with ${skillName}`, isRecurring: false },
      { title: `Mentor Others`, description: `Guide others in ${skillName} development`, isRecurring: true },
    ],
  };
  
  return templates[difficulty];
};

export const getSkillColors = (): string[] => [
  '#8EE3EF', '#254E70', '#37718E', '#5A9FB5', '#1B3E52',
  '#6BC9D5', '#3D6B8F', '#4DA3B8', '#2A5D75', '#A0E7F0'
];