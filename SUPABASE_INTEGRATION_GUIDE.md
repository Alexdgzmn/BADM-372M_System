# Supabase Integration Guide for THE SYSTEM

This guide will help you integrate your app with Supabase to replace localStorage with a real database.

## 📋 Table of Contents
1. [Setup Supabase Project](#1-setup-supabase-project)
2. [Configure Environment Variables](#2-configure-environment-variables)
3. [Run Database Schema](#3-run-database-schema)
4. [Update Services](#4-update-services)
5. [Test Integration](#5-test-integration)

---

## 1. Setup Supabase Project

### Create a Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up
3. Create a new organization (if you don't have one)

### Create a New Project
1. Click "New Project"
2. Fill in:
   - **Name**: `the-system` (or any name you prefer)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your location
3. Click "Create new project"
4. Wait 1-2 minutes for setup to complete

### Get Your API Keys
1. Go to **Project Settings** (gear icon on left sidebar)
2. Click **API** section
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (looks like: `eyJhbGciOi...`)

---

## 2. Configure Environment Variables

### Create .env File
1. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Open `.env` and replace the values:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Important**: Restart your dev server after updating `.env`:
   ```powershell
   # Stop the server (Ctrl+C), then restart
   npm run dev
   ```

---

## 3. Run Database Schema

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `database/schema.sql` from your project
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. Wait for confirmation message

### Option B: Using Supabase CLI

1. Install Supabase CLI:
   ```powershell
   npm install -g supabase
   ```

2. Login to Supabase:
   ```powershell
   supabase login
   ```

3. Link your project:
   ```powershell
   supabase link --project-ref YOUR_PROJECT_ID
   ```

4. Run migrations:
   ```powershell
   supabase db push
   ```

### Verify Schema
1. Go to **Table Editor** in Supabase dashboard
2. You should see tables like:
   - `users`
   - `user_profiles`
   - `user_progress`
   - `user_skills`
   - `missions`
   - `challenges`
   - etc.

---

## 4. Update Services

Your app already has service files, but they need to be updated to use Supabase instead of localStorage. Here's what needs to be changed:

### A. User Service (`src/services/userService.ts`)

**Create this file** to handle user profile operations:

```typescript
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';

export const userService = {
  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        users!inner(
          id,
          email,
          display_name,
          username,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return {
      displayName: data.users.display_name || data.users.email,
      nickname: data.users.username || '',
      avatar: data.users.avatar_url || null
    };
  },

  // Update user profile
  async updateUserProfile(userId: string, profile: Partial<UserProfile>) {
    const { error: userError } = await supabase
      .from('users')
      .update({
        display_name: profile.displayName,
        username: profile.nickname
      })
      .eq('id', userId);

    if (userError) {
      console.error('Error updating user:', userError);
      throw userError;
    }

    return true;
  },

  // Get user progress
  async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }

    return data;
  },

  // Update user progress
  async updateUserProgress(userId: string, progress: any) {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        ...progress,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }

    return true;
  }
};
```

### B. Skills Service (`src/services/skillsService.ts`)

**Update this file** to use Supabase:

```typescript
import { supabase } from '../lib/supabase';
import type { Skill } from '../types';

export const skillsService = {
  // Get all user skills
  async getUserSkills(userId: string): Promise<Skill[]> {
    const { data, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching skills:', error);
      return [];
    }

    return data.map(skill => ({
      id: skill.id,
      name: skill.name,
      level: skill.level,
      experience: skill.experience,
      totalExperience: skill.total_experience,
      experienceToNext: skill.experience_to_next,
      color: skill.color
    }));
  },

  // Add new skill
  async addSkill(userId: string, skill: Omit<Skill, 'id'>): Promise<Skill | null> {
    const { data, error } = await supabase
      .from('user_skills')
      .insert({
        user_id: userId,
        name: skill.name,
        level: skill.level,
        experience: skill.experience,
        total_experience: skill.totalExperience,
        experience_to_next: skill.experienceToNext,
        color: skill.color
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding skill:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      level: data.level,
      experience: data.experience,
      totalExperience: data.total_experience,
      experienceToNext: data.experience_to_next,
      color: data.color
    };
  },

  // Update skill
  async updateSkill(skillId: string, updates: Partial<Skill>) {
    const { error } = await supabase
      .from('user_skills')
      .update({
        level: updates.level,
        experience: updates.experience,
        total_experience: updates.totalExperience,
        experience_to_next: updates.experienceToNext,
        updated_at: new Date().toISOString()
      })
      .eq('id', skillId);

    if (error) {
      console.error('Error updating skill:', error);
      throw error;
    }

    return true;
  },

  // Delete skill
  async deleteSkill(skillId: string) {
    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('id', skillId);

    if (error) {
      console.error('Error deleting skill:', error);
      throw error;
    }

    return true;
  }
};
```

### C. Missions Service (Already exists, needs updates)

The missions service already exists but needs to be updated to use Supabase instead of mocks.

### D. Friends System

**Create friend-related tables** (add to schema.sql):

```sql
-- Friends table (simplified from user_relationships)
CREATE TABLE friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'away')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_user_id)
);

-- Friend requests table
CREATE TABLE friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- Indexes
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friend_requests_receiver_id ON friend_requests(receiver_id);
CREATE INDEX idx_friend_requests_status ON friend_requests(status);
```

---

## 5. Test Integration

### Check Supabase Connection

1. Open your app at `http://localhost:5174`
2. Open browser console (F12)
3. Look for these logs:
   ```
   🔧 Supabase Configuration Check:
   URL: SET ✅
   Key: SET ✅
   ✅ Using real Supabase client
   ```

### Test Authentication

1. Try signing up with a new email
2. Check Supabase dashboard → **Authentication** → **Users**
3. You should see the new user appear

### Test Database Operations

1. Add a skill in the app
2. Check Supabase dashboard → **Table Editor** → `user_skills`
3. You should see the new skill record

### Common Issues

**Problem**: "Supabase not configured - using mock authentication"
- **Solution**: Make sure `.env` file exists and has correct values
- Restart dev server after creating `.env`

**Problem**: "relation 'user_skills' does not exist"
- **Solution**: Run the schema.sql in Supabase SQL Editor

**Problem**: "JWT expired" or auth errors
- **Solution**: Clear browser localStorage and try logging in again:
  ```javascript
  localStorage.clear()
  ```

---

## 6. Migration from localStorage to Supabase

### Export Existing Data (Optional)

If you want to keep your current localStorage data:

1. Open browser console (F12)
2. Run this script:
```javascript
// Export all localStorage data
const data = {
  skills: JSON.parse(localStorage.getItem('system-skills') || '[]'),
  missions: JSON.parse(localStorage.getItem('system-missions') || '[]'),
  progress: JSON.parse(localStorage.getItem('system-progress') || '{}'),
  profile: JSON.parse(localStorage.getItem('system-profile') || '{}')
};
console.log('Export this data:', JSON.stringify(data, null, 2));
```

3. Copy the output and save it as `backup.json`

### Import to Supabase

You can manually add your data through the Supabase dashboard or create a migration script.

---

## 7. Update App.tsx to Use Supabase

### Key Changes Needed:

1. **Replace useLocalStorage with Supabase queries**:
```typescript
// Instead of:
const [skills, setSkills] = useLocalStorage<Skill[]>('system-skills', []);

// Use:
const [skills, setSkills] = useState<Skill[]>([]);

useEffect(() => {
  if (user) {
    skillsService.getUserSkills(user.id).then(setSkills);
  }
}, [user]);
```

2. **Update all CRUD operations to use services**:
```typescript
// Adding a skill
const addSkill = async (skillData: Omit<Skill, 'id'>) => {
  if (!user) return;
  
  const newSkill = await skillsService.addSkill(user.id, skillData);
  if (newSkill) {
    setSkills([...skills, newSkill]);
  }
};
```

3. **Load data on auth state change**:
```typescript
useEffect(() => {
  if (user) {
    // Load all user data
    loadUserData();
  }
}, [user]);

const loadUserData = async () => {
  if (!user) return;
  
  const [skillsData, missionsData, progressData, profileData] = await Promise.all([
    skillsService.getUserSkills(user.id),
    missionsService.getUserMissions(user.id),
    userService.getUserProgress(user.id),
    userService.getUserProfile(user.id)
  ]);
  
  setSkills(skillsData);
  setMissions(missionsData);
  setUserProgress(progressData);
  setUserProfile(profileData);
};
```

---

## 8. Enable Row Level Security (RLS)

**Important for production!** Enable RLS policies:

```sql
-- Enable RLS on all tables
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- User can only see their own skills
CREATE POLICY "Users can view own skills"
  ON user_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills"
  ON user_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
  ON user_skills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills"
  ON user_skills FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for other tables...
```

---

## 9. Next Steps

1. ✅ **Set up Supabase project**
2. ✅ **Configure environment variables**
3. ✅ **Run database schema**
4. ⏳ **Update service files to use Supabase**
5. ⏳ **Update App.tsx to use services instead of localStorage**
6. ⏳ **Test all features**
7. ⏳ **Enable RLS policies**
8. ⏳ **Deploy to production**

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

## 🆘 Need Help?

If you run into issues:
1. Check Supabase project logs (Dashboard → Logs)
2. Check browser console for errors
3. Verify .env values are correct
4. Make sure schema.sql ran successfully
5. Test Supabase connection with DatabaseTestPanel component

Good luck! 🚀
