import React, { useState, useEffect } from 'react';
import { Mission, Skill } from '../types';
import { Clock, Award, RefreshCw, CheckCircle2, AlertTriangle, Sparkles, Lightbulb, ExternalLink, Youtube, FileText, BookOpen } from 'lucide-react';

interface MissionCardProps {
  mission: Mission;
  skill: Skill;
  onComplete: (missionId: string) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({ mission, skill, onComplete }) => {
  const [timeRemaining, setTimeRemaining] = useState(mission.timeLimit * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0 && !mission.isCompleted) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, mission.isCompleted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: Mission['difficulty']) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Hard': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Expert': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 transition-all duration-200 ${
      mission.isCompleted ? 'bg-secondary/5 border-secondary/20' : 'border-secondary/10 hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: skill.color }}
            />
            <h3 className={`text-lg font-semibold ${
              mission.isCompleted ? 'text-gray-500' : 'text-primary'
            }`}>
              {mission.title}
            </h3>
            {mission.isRecurring && (
              <RefreshCw className="w-4 h-4 text-primary" />
            )}
          </div>
          <p className={`text-sm ${
            mission.isCompleted ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {mission.description}
          </p>
          
          {/* AI-generated content */}
          {mission.isAIGenerated && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-1 text-xs text-primary">
                <Sparkles className="w-3 h-3" />
                <span>AI-Personalized Mission</span>
              </div>
              
              {mission.specificTasks && mission.specificTasks.length > 0 && (
                <div className="bg-primary/5 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-primary mb-2">Specific Tasks:</h4>
                  <ul className="space-y-1">
                    {mission.specificTasks.map((task, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {mission.personalizedTips && mission.personalizedTips.length > 0 && (
                <div className="bg-accent-purple/5 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    Personalized Tips:
                  </h4>
                  <ul className="space-y-1">
                    {mission.personalizedTips.map((tip, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                        <span className="text-accent-purple">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {mission.resources && mission.resources.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Helpful Resources:
                  </h4>
                  <div className="space-y-2">
                    {mission.resources.map((resource, index) => {
                      const Icon = resource.type === 'video' ? Youtube : resource.type === 'tutorial' ? BookOpen : FileText;
                      return (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:underline group"
                        >
                          <Icon className="w-3 h-3 flex-shrink-0" />
                          <span className="flex-1">{resource.title}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {mission.isCompleted && (
          <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(mission.difficulty)}`}>
          {mission.difficulty}
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Award className="w-4 h-4" />
          <span>{mission.experience} XP</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{mission.timeLimit}m limit</span>
        </div>
      </div>

      {!mission.isCompleted && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Time Remaining:</span>
            <div className={`text-sm font-medium ${
              timeRemaining === 0 ? 'text-red-600' : timeRemaining < 300 ? 'text-orange-600' : 'text-primary'
            }`}>
              {formatTime(timeRemaining)}
              {timeRemaining === 0 && (
                <AlertTriangle className="w-4 h-4 inline ml-1 text-red-600" />
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isActive && timeRemaining > 0 && (
              <button
                onClick={() => setIsActive(true)}
                className="flex-1 bg-secondary text-white py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-colors duration-200"
              >
                Start Mission
              </button>
            )}
            
            {isActive && (
              <button
                onClick={() => setIsActive(false)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
              >
                Pause
              </button>
            )}
            
            <button
              onClick={() => onComplete(mission.id)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
            >
              Complete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};