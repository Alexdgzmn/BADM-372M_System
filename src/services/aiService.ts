import { Skill, Mission, UserProgress, Challenge, ChallengeFormData } from '../types';

export interface MissionGenerationContext {
  skill: Skill;
  userProgress: UserProgress;
  recentMissions: Mission[];
  completedMissionsThisWeek: Mission[];
}

export interface AIGeneratedMission {
  title: string;
  description: string;
  specificTasks: string[];
  personalizedTips: string[];
  resources?: { title: string; url: string; type: 'video' | 'article' | 'tutorial' }[];
  isRecurring: boolean;
}

export interface ChallengeGenerationContext {
  skills: string[];
  challengeType: 'sprint' | 'quest' | 'team' | 'skill';
  duration?: number;
  userLevel: number;
  communityInterests: string[];
  activeSeasons?: string[]; // e.g., "New Year", "Summer", "Back to School"
  trendingtopics?: string[];
}

export interface ChallengeMatchingContext {
  userProfile: {
    level: number;
    skills: string[];
    completedChallenges: string[];
    preferences: string[];
    currentStreak: number;
    timeAvailability: 'low' | 'medium' | 'high';
    learningStyle: 'visual' | 'practical' | 'collaborative' | 'independent';
  };
  availableChallenges: {
    id: string;
    title: string;
    description: string;
    type: 'sprint' | 'quest' | 'team' | 'skill';
    skills: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    duration: number;
    participants: number;
    successRate: number;
    tags: string[];
  }[];
  friendsActivity?: {
    challengeId: string;
    friendsParticipating: number;
  }[];
  communityTrends?: {
    challengeId: string;
    popularityScore: number;
    recentCompletions: number;
  }[];
}

export interface ChallengeRecommendation {
  challengeId: string;
  matchScore: number; // 0-100
  reasons: string[];
  confidence: 'low' | 'medium' | 'high';
  estimatedCompletionProbability: number;
  personalizedMotivation: string;
}

export interface AIGeneratedChallenge {
  title: string;
  description: string;
  type: 'sprint' | 'quest' | 'team' | 'skill';
  duration: number;
  skills: string[];
  rules: string[];
  tags: string[];
  dailyTasks: string[];
  motivationalMessages: string[];
  milestoneRewards: string[];
}

/**
 * Generate a personalized mission using AI based on user context
 */
export const generatePersonalizedMission = async (
  context: MissionGenerationContext
): Promise<AIGeneratedMission | null> => {
  try {
    // Check if API key is available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not configured, falling back to template missions');
      return null;
    }

    const { skill, userProgress, recentMissions, completedMissionsThisWeek } = context;
    
    // Build context prompt
    const contextPrompt = buildContextPrompt(skill, userProgress, recentMissions, completedMissionsThisWeek);
    console.log('📝 Generated prompt:', contextPrompt);
    
    // Call OpenAI API directly using fetch
    console.log('🌐 Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: getSystemPrompt()
          },
          {
            role: "user",
            content: contextPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    console.log('📡 API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📊 API Response data:', data);
    
    const aiResponse = data.choices[0]?.message?.content;
    console.log('🤖 AI Response content:', aiResponse);
    
    if (!aiResponse) {
      console.error('❌ No response content from AI');
      throw new Error('No response from AI');
    }

    // Parse the AI response
    console.log('🔍 Parsing AI response...');
    const result = parseAIResponse(aiResponse);
    console.log('✅ Parsed result:', result);
    
    return result;
    
  } catch (error) {
    console.error('Error generating AI mission:', error);
    return null;
  }
};

/**
 * Generate a personalized challenge using AI based on community context
 */
export const generatePersonalizedChallenge = async (
  context: ChallengeGenerationContext
): Promise<AIGeneratedChallenge | null> => {
  try {
    // Check if API key is available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not configured, falling back to template challenges');
      return null;
    }

    // Build context prompt for challenge generation
    const contextPrompt = buildChallengeContextPrompt(context);
    console.log('📝 Generated challenge prompt:', contextPrompt);
    
    // Call OpenAI API
    console.log('🌐 Calling OpenAI API for challenge generation...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: getChallengeSystemPrompt()
          },
          {
            role: "user",
            content: contextPrompt
          }
        ],
        temperature: 0.8, // Higher creativity for challenges
        max_tokens: 800
      })
    });

    console.log('📡 Challenge API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📊 Challenge API Response data:', data);
    
    const aiResponse = data.choices[0]?.message?.content;
    console.log('🤖 AI Challenge Response content:', aiResponse);
    
    if (!aiResponse) {
      console.error('❌ No response content from AI');
      throw new Error('No response from AI');
    }

    // Parse the AI response
    console.log('🔍 Parsing AI challenge response...');
    const result = parseAIChallengeResponse(aiResponse);
    console.log('✅ Parsed challenge result:', result);
    
    return result;
    
  } catch (error) {
    console.error('Error generating AI challenge:', error);
    return null;
  }
};

/**
 * Generate smart challenge recommendations using AI based on user profile and available challenges
 */
export const generateChallengeRecommendations = async (
  context: ChallengeMatchingContext
): Promise<ChallengeRecommendation[] | null> => {
  try {
    // Check if API key is available
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not configured, falling back to basic matching');
      return generateBasicRecommendations(context);
    }

    // Build context prompt for recommendation generation
    const contextPrompt = buildRecommendationContextPrompt(context);
    console.log('📝 Generated recommendation prompt:', contextPrompt);
    
    // Call OpenAI API
    console.log('🌐 Calling OpenAI API for challenge recommendations...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: getRecommendationSystemPrompt()
          },
          {
            role: "user",
            content: contextPrompt
          }
        ],
        temperature: 0.7, // Balanced creativity for recommendations
        max_tokens: 1000
      })
    });

    console.log('📡 Recommendation API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📊 Recommendation API Response data:', data);
    
    const aiResponse = data.choices[0]?.message?.content;
    console.log('🤖 AI Recommendation Response content:', aiResponse);
    
    if (!aiResponse) {
      console.error('❌ No response content from AI');
      throw new Error('No response from AI');
    }

    // Parse the AI response
    console.log('🔍 Parsing AI recommendation response...');
    const result = parseAIRecommendationResponse(aiResponse);
    console.log('✅ Parsed recommendation result:', result);
    
    return result;
    
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    // Fallback to basic matching
    return generateBasicRecommendations(context);
  }
};

/**
 * Build the context prompt for the AI
 */
function buildContextPrompt(
  skill: Skill, 
  userProgress: UserProgress, 
  recentMissions: Mission[], 
  completedMissionsThisWeek: Mission[]
): string {
  const difficulty = getDifficultyForLevel(skill.level);
  const recentMissionTitles = recentMissions.slice(0, 3).map(m => m.title).join(', ');
  const completedCount = completedMissionsThisWeek.length;
  
  return `
Generate a personalized mission for this user:

SKILL DETAILS:
- Skill: ${skill.name}
- Current Level: ${skill.level}
- Total Experience: ${skill.totalExperience} XP
- Difficulty Level: ${difficulty}

USER PROGRESS:
- Total Level: ${userProgress.totalLevel}
- Missions Completed: ${userProgress.missionsCompleted}
- Current Streak: ${userProgress.currentStreak} days
- Completed This Week: ${completedCount} missions

RECENT ACTIVITY:
- Recent Mission Types: ${recentMissionTitles || 'None yet'}

REQUIREMENTS:
- Create a ${difficulty.toLowerCase()} difficulty mission
- Make it specific and actionable for ${skill.name}
- Consider their experience level (${skill.level})
- Avoid repeating recent mission types
- Include 2-3 specific tasks
- Add 1-2 personalized tips
- Specify if this should be a recurring mission
`.trim();
}

/**
 * Build the context prompt for AI challenge generation
 */
function buildChallengeContextPrompt(context: ChallengeGenerationContext): string {
  const { skills, challengeType, duration, userLevel, communityInterests, activeSeasons, trendingtopics } = context;
  
  const skillsList = skills.join(', ');
  const interestsList = communityInterests.join(', ');
  const seasonsList = activeSeasons?.join(', ') || 'None';
  const trendsList = trendingtopics?.join(', ') || 'None';
  
  return `
Generate an engaging community challenge for this context:

CHALLENGE REQUIREMENTS:
- Type: ${challengeType}
- Target Skills: ${skillsList}
- Duration: ${duration || 'flexible'} days
- Target Audience Level: ${userLevel}

COMMUNITY CONTEXT:
- Popular Interests: ${interestsList}
- Current Seasons/Events: ${seasonsList}
- Trending Topics: ${trendsList}

CHALLENGE TYPE GUIDELINES:
${getTypeGuidelines(challengeType)}

REQUIREMENTS:
- Create an engaging, motivating challenge
- Include specific daily/milestone tasks
- Add community rules that encourage positive interaction
- Include relevant hashtags/tags
- Provide motivational messages for different stages
- Design milestone rewards/recognition
- Make it inclusive for different skill levels
- Focus on growth and learning over competition
`.trim();
}

function getTypeGuidelines(type: 'sprint' | 'quest' | 'team' | 'skill'): string {
  switch (type) {
    case 'sprint':
      return '- Short, intense 1-14 day challenges\n- Daily focused tasks\n- High energy, quick wins\n- Perfect for building momentum';
    case 'quest':
      return '- Longer 2-12 week journeys\n- Weekly milestones\n- Gradual skill building\n- Deeper learning experiences';
    case 'team':
      return '- Collaborative group goals\n- Shared accountability\n- Team building elements\n- Mutual support focus';
    case 'skill':
      return '- Focused skill development\n- Progressive difficulty\n- Skill-specific techniques\n- Measurable improvement';
    default:
      return '- General challenge guidelines\n- Engaging and motivating\n- Clear goals and milestones';
  }
}

/**
 * Build the context prompt for AI recommendation generation
 */
function buildRecommendationContextPrompt(context: ChallengeMatchingContext): string {
  const { userProfile, availableChallenges, friendsActivity, communityTrends } = context;
  
  const userSkills = userProfile.skills.join(', ');
  const completedChallenges = userProfile.completedChallenges.slice(0, 5).join(', ');
  const preferences = userProfile.preferences.join(', ');
  
  const challengesList = availableChallenges.map(c => 
    `- ${c.title} (${c.type}, ${c.difficulty}, ${c.skills.join('/')}, ${c.participants} participants, ${Math.round(c.successRate * 100)}% success rate)`
  ).join('\n');
  
  const friendsActivityInfo = friendsActivity?.map(f => 
    `- Challenge ${f.challengeId}: ${f.friendsParticipating} friends participating`
  ).join('\n') || 'No friends activity data';
  
  const trendsInfo = communityTrends?.map(t => 
    `- Challenge ${t.challengeId}: Popularity ${t.popularityScore}/100, ${t.recentCompletions} recent completions`
  ).join('\n') || 'No community trends data';
  
  return `
Analyze this user profile and recommend the best challenges:

USER PROFILE:
- Level: ${userProfile.level}
- Skills: ${userSkills}
- Completed Challenges: ${completedChallenges || 'None yet'}
- Preferences: ${preferences}
- Current Streak: ${userProfile.currentStreak} days
- Time Availability: ${userProfile.timeAvailability}
- Learning Style: ${userProfile.learningStyle}

AVAILABLE CHALLENGES:
${challengesList}

SOCIAL CONTEXT:
Friends Activity:
${friendsActivityInfo}

Community Trends:
${trendsInfo}

REQUIREMENTS:
- Recommend 3-5 challenges ranked by match score
- Consider skill level compatibility (not too easy/hard)
- Factor in learning style and time availability
- Include social factors (friends, community momentum)
- Provide specific reasons for each recommendation
- Estimate completion probability for each
- Include personalized motivation message
- Prioritize challenges with 60-80% completion probability
`.trim();
}

/**
 * Get the system prompt for the AI
 */
function getSystemPrompt(): string {
  return `
You are an expert skill development coach who creates personalized learning missions. Your goal is to help users improve their skills through engaging, specific, and achievable tasks.

RESPONSE FORMAT (JSON):
{
  "title": "Engaging mission title (max 50 chars)",
  "description": "Brief mission overview (max 100 chars)", 
  "specificTasks": ["Task 1", "Task 2", "Task 3"],
  "personalizedTips": ["Tip 1", "Tip 2"],
  "resources": [
    {"title": "Resource name", "url": "https://example.com", "type": "video|article|tutorial"},
    {"title": "Another resource", "url": "https://example.com", "type": "video|article|tutorial"}
  ],
  "isRecurring": true/false
}

MISSION GUIDELINES:
- Make missions specific and actionable
- Tailor difficulty to user's current level
- Include measurable outcomes when possible
- Add personal touches based on their progress
- Vary mission types to prevent boredom
- Consider time constraints (30-240 minutes)
- Make it engaging and motivating
- Include 1-3 helpful resources with REAL, WORKING URLs
- For videos: Use actual YouTube searches, format: https://www.youtube.com/results?search_query=TOPIC
- For articles: Use Wikipedia, MDN, or official documentation with real URLs
- For tutorials: Use freeCodeCamp, W3Schools, or official guides with real URLs
- Example resources:
  * Video: {"title": "JavaScript Tutorial", "url": "https://www.youtube.com/results?search_query=javascript+tutorial", "type": "video"}
  * Article: {"title": "JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "type": "article"}
  * Tutorial: {"title": "Learn JavaScript", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "type": "tutorial"}

DIFFICULTY LEVELS:
- Easy (Level 1-2): Basic practice, fundamentals
- Medium (Level 3-5): Intermediate challenges, small projects
- Hard (Level 6-9): Advanced techniques, teaching others
- Expert (Level 10+): Innovation, mastery, mentoring

Always respond with valid JSON only. ENSURE ALL URLs ARE REAL AND ACCESSIBLE.
`.trim();
}

/**
 * Get the system prompt for AI challenge generation
 */
function getChallengeSystemPrompt(): string {
  return `
You are an expert community challenge designer who creates engaging, motivating group learning experiences. Your goal is to design challenges that bring people together around skill development while fostering positive community interaction.

RESPONSE FORMAT (JSON):
{
  "title": "Engaging challenge title (max 60 chars)",
  "description": "Challenge overview and motivation (max 200 chars)",
  "type": "sprint|quest|team|skill",
  "duration": number_of_days,
  "skills": ["skill1", "skill2"],
  "rules": ["Rule 1", "Rule 2", "Rule 3"],
  "tags": ["tag1", "tag2", "tag3"],
  "dailyTasks": ["Day 1 task", "Day 2 task", "etc"],
  "motivationalMessages": ["Week 1 message", "Midpoint message", "Final push message"],
  "milestoneRewards": ["25% reward", "50% reward", "100% reward"]
}

CHALLENGE DESIGN PRINCIPLES:
- Focus on growth and learning over competition
- Encourage community support and collaboration
- Make it inclusive for different skill levels
- Include clear, actionable daily tasks
- Provide motivation for different challenge stages
- Create meaningful milestone celebrations
- Foster positive interactions and encouragement
- Ensure psychological safety and inclusivity

COMMUNITY GUIDELINES:
- Promote helping others and sharing knowledge
- Encourage authentic progress sharing
- Support those who are struggling
- Celebrate small wins and effort
- Create space for questions and learning

Always respond with valid JSON only.
`.trim();
}

/**
 * Get the system prompt for AI recommendation generation
 */
function getRecommendationSystemPrompt(): string {
  return `
You are an expert challenge recommendation engine that analyzes user profiles and matches them with the most suitable learning challenges. Your goal is to maximize engagement, completion rates, and learning outcomes while considering personal preferences and social dynamics.

RESPONSE FORMAT (JSON):
{
  "recommendations": [
    {
      "challengeId": "challenge_id",
      "matchScore": 85,
      "reasons": ["Reason 1", "Reason 2", "Reason 3"],
      "confidence": "high|medium|low",
      "estimatedCompletionProbability": 0.75,
      "personalizedMotivation": "Personalized encouragement message"
    }
  ]
}

MATCHING CRITERIA:
- Skill level alignment (avoid too easy or too hard)
- Interest and preference matching
- Learning style compatibility
- Time availability consideration
- Social factors (friends participating)
- Past success patterns
- Challenge type preference
- Community trends and momentum

RECOMMENDATION PRINCIPLES:
- Prioritize user's growth and success
- Consider completion probability (aim for 60-80%)
- Factor in social connections and community
- Balance challenge with achievability
- Provide clear, motivating reasons
- Consider user's current streak and momentum
- Suggest variety to prevent burnout

CONFIDENCE LEVELS:
- High (90%+): Perfect skill match, strong interest alignment, friends participating
- Medium (70-89%): Good skill match, some interest alignment, moderate social factors
- Low (50-69%): Partial match, limited data, experimental recommendation

Always respond with valid JSON containing 3-5 recommendations ranked by match score.
`.trim();
}

/**
 * Parse the AI response into structured data
 */
function parseAIResponse(response: string): AIGeneratedMission | null {
  try {
    // Clean up the response (remove markdown formatting if present)
    const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(cleanResponse);
    
    // Validate required fields
    if (!parsed.title || !parsed.description || !Array.isArray(parsed.specificTasks)) {
      throw new Error('Invalid response format');
    }
    
    // Process resources and ensure they have real, working URLs
    let resources = parsed.resources || [];
    
    // Validate and fix resource URLs
    resources = resources.map((r: any) => {
      let url = r.url || '';
      
      // If URL is fake or empty, generate a real one based on the resource title and type
      if (!url || url.includes('example.com') || !url.startsWith('http')) {
        const searchTerm = (r.title || parsed.title.split(' ')[0]).toLowerCase();
        
        if (r.type === 'video') {
          // Always use YouTube search - guaranteed to work
          url = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;
        } else if (r.type === 'tutorial') {
          // Use FreeCodeCamp or W3Schools - both always accessible
          if (searchTerm.includes('javascript') || searchTerm.includes('js')) {
            url = 'https://www.w3schools.com/js/';
          } else if (searchTerm.includes('python')) {
            url = 'https://www.w3schools.com/python/';
          } else if (searchTerm.includes('html')) {
            url = 'https://www.w3schools.com/html/';
          } else if (searchTerm.includes('css')) {
            url = 'https://www.w3schools.com/css/';
          } else if (searchTerm.includes('sql')) {
            url = 'https://www.w3schools.com/sql/';
          } else if (searchTerm.includes('react')) {
            url = 'https://react.dev/learn';
          } else {
            url = 'https://www.w3schools.com/';
          }
        } else {
          // article type - use reliable documentation sites
          if (searchTerm.includes('javascript') || searchTerm.includes('js')) {
            url = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide';
          } else if (searchTerm.includes('python')) {
            url = 'https://docs.python.org/3/tutorial/';
          } else if (searchTerm.includes('html')) {
            url = 'https://developer.mozilla.org/en-US/docs/Web/HTML';
          } else if (searchTerm.includes('css')) {
            url = 'https://developer.mozilla.org/en-US/docs/Web/CSS';
          } else if (searchTerm.includes('react')) {
            url = 'https://react.dev/';
          } else {
            // Generic search on Google
            url = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
          }
        }
      }
      
      return {
        title: r.title || 'Resource',
        url: url,
        type: ['video', 'article', 'tutorial'].includes(r.type) ? r.type : 'article'
      };
    });
    
    // If still no resources, add skill-appropriate defaults
    if (resources.length === 0) {
      const skillName = parsed.title.split(' ')[0].toLowerCase();
      resources = [
        {
          title: `${skillName} tutorials`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skillName + ' tutorial')}`,
          type: 'video'
        },
        {
          title: `Learn ${skillName}`,
          url: 'https://www.w3schools.com/',
          type: 'tutorial'
        }
      ];
    }
    
    return {
      title: parsed.title.slice(0, 50), // Ensure title length limit
      description: parsed.description.slice(0, 100), // Ensure description length limit
      specificTasks: parsed.specificTasks.slice(0, 3), // Max 3 tasks
      personalizedTips: parsed.personalizedTips ? parsed.personalizedTips.slice(0, 2) : [],
      resources: resources.slice(0, 3).map((r: any) => ({
        title: r.title || 'Resource',
        url: r.url || '',
        type: ['video', 'article', 'tutorial'].includes(r.type) ? r.type : 'article'
      })),
      isRecurring: Boolean(parsed.isRecurring)
    };
    
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return null;
  }
}

/**
 * Parse the AI challenge response into structured data
 */
function parseAIChallengeResponse(response: string): AIGeneratedChallenge | null {
  try {
    // Clean up the response (remove markdown formatting if present)
    const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(cleanResponse);
    
    // Validate required fields
    if (!parsed.title || !parsed.description || !parsed.type || !Array.isArray(parsed.skills)) {
      throw new Error('Invalid challenge response format');
    }
    
    return {
      title: parsed.title.slice(0, 60), // Ensure title length limit
      description: parsed.description.slice(0, 200), // Ensure description length limit
      type: parsed.type,
      duration: parsed.duration || 7, // Default to 7 days if not specified
      skills: parsed.skills.slice(0, 3), // Max 3 skills
      rules: parsed.rules ? parsed.rules.slice(0, 5) : [], // Max 5 rules
      tags: parsed.tags ? parsed.tags.slice(0, 5) : [], // Max 5 tags
      dailyTasks: parsed.dailyTasks ? parsed.dailyTasks.slice(0, parsed.duration || 7) : [],
      motivationalMessages: parsed.motivationalMessages ? parsed.motivationalMessages.slice(0, 3) : [],
      milestoneRewards: parsed.milestoneRewards ? parsed.milestoneRewards.slice(0, 3) : []
    };
    
  } catch (error) {
    console.error('Error parsing AI challenge response:', error);
    return null;
  }
}

/**
 * Parse the AI recommendation response into structured data
 */
function parseAIRecommendationResponse(response: string): ChallengeRecommendation[] | null {
  try {
    // Clean up the response (remove markdown formatting if present)
    const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(cleanResponse);
    
    // Validate response structure
    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new Error('Invalid recommendation response format');
    }
    
    return parsed.recommendations.map((rec: any): ChallengeRecommendation => ({
      challengeId: rec.challengeId || '',
      matchScore: Math.min(100, Math.max(0, rec.matchScore || 50)), // Ensure 0-100 range
      reasons: Array.isArray(rec.reasons) ? rec.reasons.slice(0, 3) : [],
      confidence: ['low', 'medium', 'high'].includes(rec.confidence) ? rec.confidence : 'medium',
      estimatedCompletionProbability: Math.min(1, Math.max(0, rec.estimatedCompletionProbability || 0.5)),
      personalizedMotivation: rec.personalizedMotivation || 'This challenge looks perfect for your current goals!'
    })).slice(0, 5); // Max 5 recommendations
    
  } catch (error) {
    console.error('Error parsing AI recommendation response:', error);
    return null;
  }
}

/**
 * Generate basic recommendations without AI (fallback)
 */
function generateBasicRecommendations(context: ChallengeMatchingContext): ChallengeRecommendation[] {
  const { userProfile, availableChallenges, friendsActivity } = context;
  
  const recommendations: ChallengeRecommendation[] = [];
  
  // Simple scoring algorithm
  for (const challenge of availableChallenges) {
    let score = 0;
    const reasons: string[] = [];
    
    // Skill matching (40% of score)
    const skillMatch = challenge.skills.some(skill => userProfile.skills.includes(skill));
    if (skillMatch) {
      score += 40;
      reasons.push('Matches your skills');
    }
    
    // Difficulty matching (30% of score)
    const difficultyScore = getDifficultyScore(challenge.difficulty, userProfile.level);
    score += difficultyScore;
    if (difficultyScore > 20) {
      reasons.push('Appropriate difficulty level');
    }
    
    // Social factors (20% of score)
    const friendsInChallenge = friendsActivity?.find(f => f.challengeId === challenge.id);
    if (friendsInChallenge && friendsInChallenge.friendsParticipating > 0) {
      score += 20;
      reasons.push(`${friendsInChallenge.friendsParticipating} friends participating`);
    }
    
    // Success rate (10% of score)
    score += challenge.successRate * 10;
    if (challenge.successRate > 0.7) {
      reasons.push('High success rate');
    }
    
    // Time availability matching
    if (matchesTimeAvailability(challenge, userProfile.timeAvailability)) {
      score += 10;
      reasons.push('Fits your schedule');
    }
    
    // Avoid completed challenges
    if (userProfile.completedChallenges.includes(challenge.id)) {
      score -= 50;
    }
    
    recommendations.push({
      challengeId: challenge.id,
      matchScore: Math.min(100, Math.max(0, score)),
      reasons: reasons.slice(0, 3),
      confidence: score > 70 ? 'high' : score > 50 ? 'medium' : 'low',
      estimatedCompletionProbability: Math.min(0.9, Math.max(0.2, challenge.successRate)),
      personalizedMotivation: generateBasicMotivation(challenge, userProfile)
    });
  }
  
  // Sort by score and return top 5
  return recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

function getDifficultyScore(challengeDifficulty: string, userLevel: number): number {
  const difficultyMap = { easy: 1, medium: 2, hard: 3 };
  const challengeLevel = difficultyMap[challengeDifficulty as keyof typeof difficultyMap] || 2;
  const userDifficultyLevel = userLevel <= 3 ? 1 : userLevel <= 7 ? 2 : 3;
  
  // Perfect match = 30 points, off by 1 = 20 points, off by 2 = 10 points
  const diff = Math.abs(challengeLevel - userDifficultyLevel);
  return Math.max(0, 30 - (diff * 10));
}

function matchesTimeAvailability(challenge: any, availability: string): boolean {
  if (availability === 'low') return challenge.duration <= 7;
  if (availability === 'medium') return challenge.duration <= 21;
  return true; // High availability matches any duration
}

function generateBasicMotivation(challenge: any, userProfile: any): string {
  const motivations = [
    `Perfect for building your ${challenge.skills[0]} skills!`,
    `This ${challenge.type} challenge will boost your ${userProfile.currentStreak}-day streak!`,
    `Great opportunity to level up your expertise!`,
    `Join ${challenge.participants} others on this learning journey!`,
    `This challenge has a ${Math.round(challenge.successRate * 100)}% success rate!`
  ];
  
  return motivations[Math.floor(Math.random() * motivations.length)];
}

/**
 * Get difficulty level based on skill level
 */
function getDifficultyForLevel(level: number): Mission['difficulty'] {
  if (level < 3) return 'Easy';
  if (level < 6) return 'Medium';
  if (level < 10) return 'Hard';
  return 'Expert';
}

/**
 * Alternative AI providers can be added here
 */
export const generateWithClaude = async (_context: MissionGenerationContext): Promise<AIGeneratedMission | null> => {
  // Placeholder for Claude AI integration
  // You can implement Anthropic's Claude API here
  console.log('Claude integration not implemented yet');
  return null;
};

export const generateWithGemini = async (_context: MissionGenerationContext): Promise<AIGeneratedMission | null> => {
  // Placeholder for Google Gemini integration
  // You can implement Google's Gemini API here
  console.log('Gemini integration not implemented yet');
  return null;
};