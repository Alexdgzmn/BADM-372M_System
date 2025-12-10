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
    <div className="min-h-screen bg-gradient-to-br from-game-bg via-primary to-game-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left side - Branding and features */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <img 
                  src="/logo.png" 
                  alt="The System Logo" 
                  className="w-12 h-12 object-cover rounded-xl"
                />
                <h1 className="text-4xl font-bold text-white font-headline">
                  THE SYSTEM
                </h1>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 font-headline">
                Level up what you love
              </h2>
              <p className="text-xl text-white/90 mb-8 font-body">
                Turn your habits and interests into missions. Track progress, build streaks, and level up in a playful, game-inspired way.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200 hover:shadow-glow">
                    <div className="bg-gradient-to-br from-secondary to-accent-purple p-3 rounded-lg flex-shrink-0 shadow-glow">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1 font-headline">
                        {feature.title}
                      </h3>
                      <p className="text-white/80 font-body">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-accent-purple/20 to-secondary/20 backdrop-blur-sm border border-secondary/30 rounded-xl p-6 shadow-glow">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-accent-gold to-accent-orange p-3 rounded-full shadow-glow animate-pulse-slow">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary">Ready to start?</h3>
                  <p className="text-sm text-white/80">
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