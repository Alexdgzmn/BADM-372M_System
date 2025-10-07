import React, { useState } from 'react';
import { Gamepad2, Zap, Target, Trophy } from 'lucide-react';
import { AuthForm } from './AuthForm';

export const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const features = [
    {
      icon: Target,
      title: 'Custom Missions',
      description: 'Get personalized challenges that match your skill level and goals'
    },
    {
      icon: Trophy,
      title: 'Level Up System',
      description: 'Track your progress with an engaging leveling system that grows with you'
    },
    {
      icon: Zap,
      title: 'Daily Challenges',
      description: 'Stay motivated with time-limited missions and streak tracking'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-light to-primary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left side - Branding and features */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-xl">
                  <Gamepad2 className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-secondary">
                  THE SYSTEM
                </h1>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">
                Level up what you love
              </h2>
              <p className="text-xl text-secondary/80 mb-8">
                Turn your habits and interests into missions. Track progress, build streaks, and level up in a playful, game-inspired way.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-secondary/70">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary/10">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full">
                  <Zap className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary">Ready to start?</h3>
                  <p className="text-sm text-secondary/70">
                    Join thousands of users already leveling up their skills
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="flex items-center justify-center">
            <AuthForm 
              mode={authMode} 
              onToggleMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};