// Test AI Mission Generation
import { generatePersonalizedMission } from './src/services/aiService.js';

const testSkill = {
  id: 'test-skill',
  name: 'JavaScript Programming',
  level: 5,
  totalExperience: 2500,
  experienceToNext: 400,
  color: '#8EE3EF'
};

const testUserProgress = {
  totalLevel: 8,
  missionsCompleted: 15,
  currentStreak: 3
};

const testContext = {
  skill: testSkill,
  userProgress: testUserProgress,
  recentMissions: [],
  completedMissionsThisWeek: []
};

console.log('🧪 Testing AI Mission Generation...');
console.log('Context:', testContext);

try {
  const aiMission = await generatePersonalizedMission(testContext);
  console.log('✅ AI Mission Generated:', aiMission);
} catch (error) {
  console.error('❌ AI Mission Generation Failed:', error);
}