import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { getSkillColors } from '../utils/gameLogic';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSkill: (name: string, color: string) => void;
}

export const AddSkillModal: React.FC<AddSkillModalProps> = ({ isOpen, onClose, onAddSkill }) => {
  const [skillName, setSkillName] = useState('');
  const [selectedColor, setSelectedColor] = useState(getSkillColors()[0]);
  const colors = getSkillColors();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillName.trim()) {
      onAddSkill(skillName.trim(), selectedColor);
      setSkillName('');
      setSelectedColor(colors[0]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary">Add New Skill</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="skillName" className="block text-sm font-medium text-secondary mb-2">
              Skill Name
            </label>
            <input
              type="text"
              id="skillName"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g., Programming, Guitar, Drawing..."
              className="w-full px-4 py-2 border border-secondary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Choose Color
            </label>
            <div className="grid grid-cols-5 gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    selectedColor === color
                      ? 'border-secondary scale-110'
                      : 'border-secondary/30 hover:border-secondary/50'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-secondary bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!skillName.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};