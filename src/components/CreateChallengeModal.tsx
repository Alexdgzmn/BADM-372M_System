import React, { useState } from 'react';
import { X, Users, Calendar, Target, Globe, Lock, Settings, Sparkles, Loader2 } from 'lucide-react';
import { generatePersonalizedChallenge, ChallengeGenerationContext } from '../services/aiService';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChallenge: (challenge: ChallengeFormData) => void;
}

export interface ChallengeFormData {
  title: string;
  description: string;
  type: 'sprint' | 'quest' | 'team' | 'skill';
  duration: number;
  skills: string[];
  privacy: 'public' | 'friends' | 'private';
  maxParticipants?: number;
  startDate: Date;
  rules: string[];
  tags: string[];
}

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  isOpen,
  onClose,
  onCreateChallenge
}) => {
  const [formData, setFormData] = useState<ChallengeFormData>({
    title: '',
    description: '',
    type: 'sprint',
    duration: 7,
    skills: [],
    privacy: 'public',
    maxParticipants: undefined,
    startDate: new Date(),
    rules: [],
    tags: []
  });

  const [newRule, setNewRule] = useState('');
  const [newTag, setNewTag] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const availableSkills = [
    'JavaScript', 'Python', 'Design', 'Fitness', 'Music', 'Languages',
    'Writing', 'Photography', 'Cooking', 'Art', 'Reading', 'Meditation'
  ];

  const challengeTypes = [
    {
      id: 'sprint',
      name: '🏃‍♂️ Sprint',
      description: 'Short, intense 1-14 day challenges',
      defaultDuration: 7
    },
    {
      id: 'quest',
      name: '🗺️ Quest',
      description: 'Medium-term 2-12 week journeys',
      defaultDuration: 30
    },
    {
      id: 'team',
      name: '👥 Team',
      description: 'Collaborative group challenges',
      defaultDuration: 14
    },
    {
      id: 'skill',
      name: '🎯 Skill',
      description: 'Focused skill development',
      defaultDuration: 21
    }
  ];

  if (!isOpen) return null;

  const handleTypeChange = (type: ChallengeFormData['type']) => {
    const typeConfig = challengeTypes.find(t => t.id === type);
    setFormData({
      ...formData,
      type,
      duration: typeConfig?.defaultDuration || 7
    });
  };

  const addRule = () => {
    if (newRule.trim()) {
      setFormData({
        ...formData,
        rules: [...formData.rules, newRule.trim()]
      });
      setNewRule('');
    }
  };

  const removeRule = (index: number) => {
    setFormData({
      ...formData,
      rules: formData.rules.filter((_, i) => i !== index)
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim().toLowerCase()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const toggleSkill = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    
    setSelectedSkills(newSkills);
    setFormData({
      ...formData,
      skills: newSkills
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim() && formData.description.trim() && formData.skills.length > 0) {
      onCreateChallenge(formData);
      onClose();
    }
  };

  const getDurationLabel = () => {
    if (formData.duration === 1) return '1 day';
    if (formData.duration < 7) return `${formData.duration} days`;
    if (formData.duration === 7) return '1 week';
    if (formData.duration < 30) return `${Math.ceil(formData.duration / 7)} weeks`;
    return `${Math.ceil(formData.duration / 30)} months`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-secondary/10">
          <h2 className="text-2xl font-bold text-secondary">Create Challenge</h2>
          <button
            onClick={onClose}
            className="p-2 text-secondary/60 hover:text-secondary rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Challenge Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., 30-Day Coding Sprint"
                className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what participants will do and achieve..."
                rows={3}
                className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Challenge Type */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-3">
              Challenge Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {challengeTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeChange(type.id as ChallengeFormData['type'])}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    formData.type === type.id
                      ? 'border-primary bg-primary/5'
                      : 'border-secondary/20 hover:border-secondary/30'
                  }`}
                >
                  <div className="font-medium text-secondary mb-1">
                    {type.name}
                  </div>
                  <div className="text-sm text-secondary/60">
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Start Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Duration: {getDurationLabel()}
              </label>
              <input
                type="range"
                min="1"
                max={formData.type === 'sprint' ? 14 : formData.type === 'quest' ? 90 : 30}
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-secondary/60 mt-1">
                <span>1 day</span>
                <span>{formData.type === 'sprint' ? '14 days' : formData.type === 'quest' ? '90 days' : '30 days'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-3">
              Related Skills * (Select 1-3)
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {availableSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  disabled={!selectedSkills.includes(skill) && selectedSkills.length >= 3}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSkills.includes(skill)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-secondary hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Privacy
              </label>
              <select
                value={formData.privacy}
                onChange={(e) => setFormData({ ...formData, privacy: e.target.value as ChallengeFormData['privacy'] })}
                className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="public">🌍 Public - Anyone can join</option>
                <option value="friends">👥 Friends Only</option>
                <option value="private">🔒 Private - Invite only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Max Participants (Optional)
              </label>
              <input
                type="number"
                value={formData.maxParticipants || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  maxParticipants: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="No limit"
                min="2"
                max="1000"
                className="w-full px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Challenge Rules (Optional)
            </label>
            <div className="space-y-2">
              {formData.rules.map((rule, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="flex-1 text-sm">{rule}</span>
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="Add a rule..."
                  className="flex-1 px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                />
                <button
                  type="button"
                  onClick={addRule}
                  className="px-4 py-2 bg-gray-100 text-secondary rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Tags (Optional)
            </label>
            <div className="space-y-2">
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-primary/60 hover:text-primary"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-100 text-secondary rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-secondary/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-secondary/20 text-secondary rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || !formData.description.trim() || formData.skills.length === 0}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Challenge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};