# 🚀 Social Features Implementation Plan

## Phase 1: Foundation (Week 1-2)

### Database Schema Updates
```sql
-- Add social features to existing user table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_stats JSONB DEFAULT '{
  "weeklyXP": 0,
  "globalRank": 0,
  "friendsRank": 0,
  "activeChallenges": 0,
  "completedChallenges": 0,
  "totalEncouragements": 0,
  "receivedEncouragements": 0
}'::jsonb;

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sprint', 'quest', 'team', 'skill')),
  duration INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  skills TEXT[] NOT NULL,
  max_participants INTEGER,
  privacy TEXT NOT NULL CHECK (privacy IN ('public', 'friends', 'private')),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rules TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create challenge participants table
CREATE TABLE public.challenge_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  progress DECIMAL(5,2) DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100),
  tasks_completed INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(challenge_id, user_id)
);

-- Create social posts table
CREATE TABLE public.social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('progress', 'achievement', 'struggle', 'tip', 'challenge_update')),
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  is_liked BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
  skill_id UUID,
  mission_id UUID,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'challenge_members')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create social comments table
CREATE TABLE public.social_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_liked BOOLEAN DEFAULT false,
  parent_comment_id UUID REFERENCES public.social_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create friendships table
CREATE TABLE public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id_1 UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  initiated_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 != user_id_2)
);

-- Create social activities table
CREATE TABLE public.social_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('friend_achievement', 'challenge_invite', 'new_follower', 'challenge_complete', 'streak_milestone', 'level_up', 'challenge_join')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges
CREATE POLICY "Challenges are viewable by everyone" ON public.challenges
  FOR SELECT USING (privacy = 'public' OR auth.uid() = creator_id);

CREATE POLICY "Users can create challenges" ON public.challenges
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own challenges" ON public.challenges
  FOR UPDATE USING (auth.uid() = creator_id);

-- RLS Policies for challenge participants
CREATE POLICY "Challenge participants are viewable by all" ON public.challenge_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join challenges" ON public.challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON public.challenge_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for social posts
CREATE POLICY "Social posts are viewable based on visibility" ON public.social_posts
  FOR SELECT USING (
    visibility = 'public' OR 
    auth.uid() = user_id OR
    (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE (user_id_1 = auth.uid() AND user_id_2 = user_id AND status = 'accepted')
         OR (user_id_2 = auth.uid() AND user_id_1 = user_id AND status = 'accepted')
    ))
  );

CREATE POLICY "Users can create their own posts" ON public.social_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.social_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for social comments
CREATE POLICY "Comments are viewable if post is viewable" ON public.social_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.social_posts 
      WHERE id = post_id AND (
        visibility = 'public' OR 
        user_id = auth.uid() OR
        (visibility = 'friends' AND EXISTS (
          SELECT 1 FROM public.friendships 
          WHERE (user_id_1 = auth.uid() AND user_id_2 = user_id AND status = 'accepted')
             OR (user_id_2 = auth.uid() AND user_id_1 = user_id AND status = 'accepted')
        ))
      )
    )
  );

CREATE POLICY "Users can comment on visible posts" ON public.social_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.social_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for friendships
CREATE POLICY "Users can view their own friendships" ON public.friendships
  FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can create friendship requests" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = initiated_by);

CREATE POLICY "Users can update friendships they're part of" ON public.friendships
  FOR UPDATE USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- RLS Policies for social activities
CREATE POLICY "Users can view their own activities" ON public.social_activities
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = target_user_id);

CREATE POLICY "System can create activities" ON public.social_activities
  FOR INSERT WITH CHECK (true);
```

### Core Services Implementation

#### Challenge Service
```typescript
// src/services/challengeService.ts
export class ChallengeService {
  async createChallenge(challengeData: ChallengeFormData): Promise<Challenge>
  async joinChallenge(challengeId: string): Promise<void>
  async leaveChallenge(challengeId: string): Promise<void>
  async getChallenges(filter?: ChallengeFilter): Promise<Challenge[]>
  async getChallengeById(id: string): Promise<Challenge>
  async updateChallengeProgress(challengeId: string, progress: number): Promise<void>
  async getChallengeLeaderboard(challengeId: string): Promise<LeaderboardEntry[]>
}
```

#### Social Service
```typescript
// src/services/socialService.ts
export class SocialService {
  async createPost(postData: Partial<SocialPost>): Promise<SocialPost>
  async getPosts(filter?: PostFilter): Promise<SocialPost[]>
  async likePost(postId: string): Promise<void>
  async addComment(postId: string, content: string): Promise<SocialComment>
  async reportContent(contentId: string, type: 'post' | 'comment', reason: string): Promise<void>
  async getActivities(userId?: string): Promise<SocialActivity[]>
  async markActivitiesAsRead(activityIds: string[]): Promise<void>
}
```

#### Friend Service
```typescript
// src/services/friendService.ts
export class FriendService {
  async sendFriendRequest(userId: string): Promise<void>
  async acceptFriendRequest(friendshipId: string): Promise<void>
  async getFriends(userId?: string): Promise<User[]>
  async getFriendRequests(): Promise<Friendship[]>
  async searchUsers(query: string): Promise<User[]>
  async removeFriend(userId: string): Promise<void>
}
```

## Phase 2: UI Components (Week 3-4)

### Component Integration Priority
1. **SocialDashboard** - Add to main App.tsx
2. **ChallengesHub** - New navigation tab
3. **CommunityBoard** - Social feed
4. **Leaderboards** - Competition view
5. **CreateChallengeModal** - Challenge creation

### Enhanced Navigation
```typescript
// Update App.tsx navigation
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'challenges', label: 'Challenges', icon: Trophy }, // NEW
  { id: 'community', label: 'Community', icon: Users }, // NEW
  { id: 'leaderboards', label: 'Rankings', icon: Medal }, // NEW
  { id: 'profile', label: 'Profile', icon: User }
];
```

## Phase 3: Gamification & Engagement (Week 5-6)

### Badge System
```typescript
const socialBadges = [
  {
    id: 'team_player',
    name: 'Team Player',
    description: 'Complete 5 team challenges',
    icon: '🤝',
    requirement: { type: 'team_challenges', count: 5 }
  },
  {
    id: 'motivator',
    name: 'Motivator',
    description: 'Give 100 encouraging comments',
    icon: '💪',
    requirement: { type: 'encouragements', count: 100 }
  },
  {
    id: 'streak_legend',
    name: 'Streak Legend',
    description: 'Maintain a 30-day streak',
    icon: '🔥',
    requirement: { type: 'streak', count: 30 }
  }
];
```

### Notification System
```typescript
// Push notifications for:
// - Friend achievements
// - Challenge invitations
// - Comments on posts
// - Challenge deadlines
// - Streak reminders
```

## Phase 4: Advanced Features (Week 7-8)

### AI-Powered Features
1. **Smart Challenge Recommendations** - Based on skills and progress
2. **Sentiment Analysis** - For community moderation
3. **Personalized Feed** - Show most relevant content
4. **Auto-moderation** - Flag inappropriate content

### Analytics Dashboard
```typescript
interface CommunityAnalytics {
  engagement: {
    dailyActiveUsers: number;
    postsPerDay: number;
    challengeCompletionRate: number;
    averageSessionTime: number;
  };
  health: {
    sentimentScore: number;
    reportedContentRatio: number;
    userRetentionRate: number;
    friendConnectionRate: number;
  };
  growth: {
    newUsersDaily: number;
    challengeCreationRate: number;
    communityInteractions: number;
  };
}
```

## Success Metrics & KPIs

### Engagement Metrics
- **Daily Active Users**: Target 70%+ of registered users
- **Session Duration**: Average 15+ minutes per session
- **Return Rate**: 80%+ users return within 7 days
- **Challenge Completion**: 60%+ completion rate

### Community Health
- **Positive Sentiment**: 80%+ positive interactions
- **User Reports**: <2% of content reported
- **Response Time**: <4 hours for community support
- **Conflict Resolution**: <48 hours average

### Growth Indicators
- **Friend Connections**: Average 5+ friends per user
- **Challenge Participation**: 40%+ users in active challenges
- **Content Creation**: 30%+ users post weekly
- **Cross-Skill Engagement**: Users engaging across multiple skills

## Technical Considerations

### Performance Optimization
- **Pagination**: For feeds and leaderboards
- **Caching**: Challenge data and user stats
- **Image Optimization**: For user uploads
- **Real-time Updates**: WebSocket for live interactions

### Security & Privacy
- **Content Moderation**: AI + human review
- **Privacy Controls**: Granular visibility settings
- **Data Protection**: GDPR compliant user data handling
- **Anti-Spam**: Rate limiting and pattern detection

### Scalability Planning
- **Database Indexing**: Optimize for social queries
- **CDN Integration**: For media content
- **Microservices**: Separate social features if needed
- **Load Balancing**: Handle peak usage periods

---

*This implementation plan transforms your skill gamification app into a thriving social learning community while maintaining the core mission-driven focus and psychological safety principles.*