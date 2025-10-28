# Local Setup Instructions

## Prerequisites Check
After installing Node.js, verify installation:
```bash
node --version
npm --version
```

## Step-by-Step Setup

### 1. Install Project Dependencies
```bash
cd "c:\Users\alexa\Downloads\BADM-372M_System-1"
npm install
```

### 2. Install AI Dependencies
```bash
npm install openai
```

### 3. Set Up Environment Variables
```bash
# Copy the environment template
copy .env.example .env
```

Then edit `.env` file and add your API keys:
```env
# Required for AI features (get from https://platform.openai.com/)
VITE_OPENAI_API_KEY=sk-your-openai-key-here

# Required for authentication (get from https://supabase.com/)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start Development Server
```bash
npm run dev
```

The app will be available at: http://localhost:5173

## Testing AI Features Without API Key

If you want to test the app without setting up OpenAI:
- The app will automatically fall back to template missions
- You'll see a console warning about missing API key
- All other features work normally

## What You'll See

### New AI Features:
1. **Loading States** - Spinner appears when generating missions
2. **AI Mission Indicators** - Sparkle icons on AI-generated missions  
3. **Personalized Content** - Specific tasks and tips in mission cards
4. **Smart Generation** - Context-aware mission recommendations

### UI Enhancements:
- Enhanced mission cards with AI content sections
- Loading buttons during generation
- Rich display of tasks and personalized tips
- Visual distinction between AI and template missions

## Troubleshooting

**If npm commands fail:**
- Restart terminal after Node.js installation
- Try running PowerShell as Administrator
- Verify Node.js is in PATH: `$env:PATH -split ';' | Where-Object { $_ -like '*node*' }`

**If AI features don't work:**
- Check `.env` file has correct OpenAI API key
- Verify API key has sufficient credits
- Check browser console for error messages