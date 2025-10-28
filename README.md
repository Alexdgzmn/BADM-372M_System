# THE SYSTEM - AI-Powered Skill Gamification Platform

A React-based gamification platform that helps users level up their skills through personalized, AI-generated missions. Transform your learning journey into an engaging game-like experience with intelligent mission recommendations tailored to your progress.

## 🌟 Features

### Core Features
- **Skill Tracking**: Create and track multiple skills with XP and leveling system
- **Mission System**: Complete missions to gain experience and level up
- **Progress Analytics**: View detailed stats, streaks, and achievements
- **User Authentication**: Secure login/signup with Supabase
- **Responsive Design**: Beautiful, mobile-friendly interface

### AI-Powered Features ✨
- **Personalized Missions**: AI generates custom missions based on your skill level and progress
- **Contextual Recommendations**: Missions adapt to your recent activity and learning patterns
- **Specific Task Breakdown**: AI provides actionable, step-by-step tasks for each mission
- **Personalized Tips**: Get tailored advice based on your skill level and goals
- **Smart Difficulty Scaling**: Mission difficulty automatically adjusts to your progress

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (for AI features)
- Supabase account (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Alexdgzmn/BADM-372M_System.git
   cd BADM-372M_System
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install AI dependencies**
   ```bash
   npm install openai
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🤖 AI Integration Setup

### Getting OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env` file as `VITE_OPENAI_API_KEY`

### How AI Personalization Works

The AI system analyzes:
- **Your skill level** - Generates appropriate difficulty missions
- **Recent activity** - Avoids repetitive mission types
- **Progress patterns** - Adapts to your learning style
- **Completion history** - Scales difficulty based on success rate

### AI Mission Features

- **Smart Context Awareness**: AI considers your skill level, recent missions, and overall progress
- **Personalized Task Breakdown**: Each mission includes 2-3 specific, actionable tasks
- **Tailored Tips**: Get personalized advice based on your current skill level
- **Adaptive Difficulty**: Missions automatically scale from Easy to Expert based on your progress
- **Fallback System**: If AI is unavailable, the system uses curated template missions

## 🛠️ Technical Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Supabase Auth
- **AI Integration**: OpenAI GPT-3.5-turbo
- **Build Tool**: Vite
- **State Management**: React Hooks + Local Storage

### AI Service Architecture
```
src/services/aiService.ts
├── generatePersonalizedMission() - Main AI generation function
├── buildContextPrompt() - Creates user context for AI
├── parseAIResponse() - Processes AI responses
└── Alternative providers (Claude, Gemini) - Ready for integration
```

### Mission Generation Flow
1. User clicks "Generate Mission"
2. System shows loading state
3. AI service analyzes user context
4. OpenAI generates personalized mission
5. Response is parsed and validated
6. Mission is created with AI content
7. Fallback to templates if AI fails

## 🎮 Usage Guide

### Adding Skills
1. Click "Add Skill" button
2. Enter skill name (e.g., "Programming", "Guitar", "Drawing")
3. Choose a color theme
4. Start generating missions!

### Generating AI Missions
1. Click "Generate Mission" on any skill card
2. Wait for AI to analyze your progress (loading spinner appears)
3. Review your personalized mission with:
   - Custom title and description
   - Specific tasks to complete
   - Personalized tips
   - Appropriate difficulty level

### Completing Missions
1. Start a mission timer
2. Follow the specific tasks provided
3. Use the personalized tips for guidance
4. Complete the mission to earn XP
5. Level up your skill and overall progress

## 🔧 Configuration

### Environment Variables
```env
# Required for AI features
VITE_OPENAI_API_KEY=sk-...

# Required for authentication
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Optional: Alternative AI providers
VITE_ANTHROPIC_API_KEY=your_claude_api_key
VITE_GOOGLE_AI_API_KEY=your_gemini_api_key
```

### Customizing AI Behavior

Edit `src/services/aiService.ts` to modify:
- **System prompts** - Change AI personality and mission style
- **Context building** - Adjust what user data is sent to AI  
- **Response parsing** - Modify how AI responses are processed
- **Fallback logic** - Customize template mission selection

## 🚦 Troubleshooting

### Common Issues

**AI missions not generating:**
- Check your OpenAI API key in `.env`
- Verify you have sufficient API credits
- Check browser console for error messages

**TypeScript errors:**
- Run `npm install` to ensure all dependencies are installed
- Check that `openai` package is properly installed

**Authentication issues:**
- Verify Supabase credentials in `.env`
- Check Supabase project settings

### Development Mode
The app includes comprehensive error handling and fallback systems:
- AI failures automatically fall back to template missions
- Loading states provide user feedback
- Console warnings help debug AI integration issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for powering the intelligent mission generation
- Supabase for authentication and backend services
- Tailwind CSS for the beautiful, responsive design
- Lucide React for the clean, consistent icons

---

**Ready to level up your skills with AI-powered personalization? Start your journey today!** 🚀
