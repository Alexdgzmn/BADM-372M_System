import { Skill, Mission, UserProgress } from '../types';

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
  isRecurring: boolean;
}

/**
 * Generate a personalized mission using AI based on user context
 */
export const generatePersonalizedMission = async (
  context: MissionGenerationContext
): Promise<AIGeneratedMission | null> => {
  try {
    // Check if API key is available
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, falling back to template missions');
      return null;
    }

    const { skill, userProgress, recentMissions, completedMissionsThisWeek } = context;
    
    // Build context prompt
    const contextPrompt = buildContextPrompt(skill, userProgress, recentMissions, completedMissionsThisWeek);
    
    // Call OpenAI API directly using fetch
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

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse the AI response
    return parseAIResponse(aiResponse);
    
  } catch (error) {
    console.error('Error generating AI mission:', error);
    return null;
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

DIFFICULTY LEVELS:
- Easy (Level 1-2): Basic practice, fundamentals
- Medium (Level 3-5): Intermediate challenges, small projects
- Hard (Level 6-9): Advanced techniques, teaching others
- Expert (Level 10+): Innovation, mastery, mentoring

Always respond with valid JSON only.
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
    
    return {
      title: parsed.title.slice(0, 50), // Ensure title length limit
      description: parsed.description.slice(0, 100), // Ensure description length limit
      specificTasks: parsed.specificTasks.slice(0, 3), // Max 3 tasks
      personalizedTips: parsed.personalizedTips ? parsed.personalizedTips.slice(0, 2) : [],
      isRecurring: Boolean(parsed.isRecurring)
    };
    
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return null;
  }
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