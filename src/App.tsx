import React, { useState, useEffect } from 'react';
import { Plus, Gamepad2, Zap } from 'lucide-react';
import { Skill, Mission, UserProgress } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { 
  generateMissionForSkill, 
  calculateLevelFromExperience, 
  calculateExperienceToNextLevel,
  getSkillColors 
} from './utils/gameLogic';
import { SkillCard } from './components/SkillCard';
import { MissionCard } from './components/MissionCard';
import { StatsOverview } from './components/StatsOverview';
import { AddSkillModal } from './components/AddSkillModal';

function App() {
  const [skills, setSkills] = useLocalStorage<Skill[]>('system-skills', []);
  const [missions, setMissions] = useLocalStorage<Mission[]>('system-missions', []);
  const [userProgress, setUserProgress] = useLocalStorage<UserProgress>('system-progress', {
    totalLevel: 1,
    totalExperience: 0,
    missionsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);

  // Update user progress when skills change
  useEffect(() => {
    const totalExp = skills.reduce((sum, skill) => sum + skill.totalExperience, 0);
    const totalLevel = calculateLevelFromExperience(totalExp);
    
    setUserProgress(prev => ({
      ...prev,
      totalLevel,
      totalExperience: totalExp,
    }));
  }, [skills, setUserProgress]);

  const addSkill = (name: string, color: string) => {
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      totalExperience: 0,
      color,
      createdAt: new Date(),
    };
    setSkills(prev => [...prev, newSkill]);
  };

  const generateMission = (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    const newMission = generateMissionForSkill(skill);
    setMissions(prev => [...prev, newMission]);
  };

  const completeMission = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.isCompleted) return;

    // Update mission
    setMissions(prev => 
      prev.map(m => 
        m.id === missionId 
          ? { ...m, isCompleted: true, completedAt: new Date() }
          : m
      )
    );

    // Update skill experience
    setSkills(prev => 
      prev.map(skill => {
        if (skill.id === mission.skillId) {
          const newTotalExp = skill.totalExperience + mission.experience;
          const newLevel = calculateLevelFromExperience(newTotalExp);
          const newExpToNext = calculateExperienceToNextLevel(newTotalExp);
          
          return {
            ...skill,
            level: newLevel,
            totalExperience: newTotalExp,
            experienceToNext: newExpToNext,
          };
        }
        return skill;
      })
    );

    // Update user progress
    setUserProgress(prev => ({
      ...prev,
      missionsCompleted: prev.missionsCompleted + 1,
      currentStreak: prev.currentStreak + 1,
      longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1),
    }));
  };

  const activeMissions = missions.filter(m => !m.isCompleted);
  const completedMissions = missions.filter(m => m.isCompleted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              System
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Level up what you love. Transform your skills into an epic journey of growth and achievement.
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview progress={userProgress} />

        {/* Skills Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Skills</h2>
            <button
              onClick={() => setIsAddSkillModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Skill
            </button>
          </div>

          {skills.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Level Up?</h3>
              <p className="text-gray-600 mb-4">Add your first skill to start your growth journey!</p>
              <button
                onClick={() => setIsAddSkillModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Add Your First Skill
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map(skill => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onGenerateMission={generateMission}
                />
              ))}
            </div>
          )}
        </div>

        {/* Active Missions */}
        {activeMissions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Missions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeMissions.map(mission => {
                const skill = skills.find(s => s.id === mission.skillId);
                return skill ? (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    skill={skill}
                    onComplete={completeMission}
                  />
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Completed Missions */}
        {completedMissions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Completed Missions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedMissions.slice(0, 6).map(mission => {
                const skill = skills.find(s => s.id === mission.skillId);
                return skill ? (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    skill={skill}
                    onComplete={completeMission}
                  />
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={isAddSkillModalOpen}
        onClose={() => setIsAddSkillModalOpen(false)}
        onAddSkill={addSkill}
      />
    </div>
  );
}

export default App;