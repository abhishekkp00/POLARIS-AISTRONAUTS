/**
 * AI NEXT-STEP SERVICE - Strategic Task Suggestions
 * Generates intelligent next steps using Gemini AI
 * Features: Real-time suggestions, caching, fallback
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// In-memory cache for suggestions (production: use Redis)
const suggestionCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const TIMEOUT_MS = 5000; // 5 seconds

let genAI = null;
let model = null;

// Initialize Gemini AI
function initializeAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('⚠️  Gemini API key not configured - using fallback mode');
    return false;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    });
    console.log('✅ AI Next-Step Service initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error.message);
    return false;
  }
}

/**
 * Generate strategic next step for a task
 * @param {string} taskTitle - Title of completed task
 * @param {object} projectContext - Project metadata
 * @returns {Promise<object>} Next step suggestion
 */
async function generateNextStep(taskTitle, projectContext = {}) {
  const startTime = Date.now();

  // Build cache key
  const cacheKey = `${taskTitle}_${projectContext.project_progress || 0}_${projectContext.active_blockers?.length || 0}`;
  
  // Check cache first
  const cached = suggestionCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    console.log(`📦 Cache hit for: ${taskTitle.substring(0, 30)}...`);
    return {
      ...cached.suggestion,
      cached: true,
      processing_time_ms: Date.now() - startTime
    };
  }

  // If no AI model, use fallback
  if (!model) {
    return generateFallbackSuggestion(taskTitle, projectContext, startTime);
  }

  try {
    // Build context-aware prompt
    const prompt = buildPrompt(taskTitle, projectContext);

    // Call Gemini with timeout
    const suggestionText = await callGeminiWithTimeout(prompt, TIMEOUT_MS);

    // Parse AI response
    const parsed = parseAISuggestion(suggestionText);

    const result = {
      next: parsed.next || 'Continue with next priority task',
      who: parsed.who || 'Team Lead',
      time: parsed.time || '2-4 hours',
      why: parsed.why || 'Maintain project momentum',
      confidence: parsed.confidence || 85,
      source: 'gemini_ai',
      cached: false,
      processing_time_ms: Date.now() - startTime,
      generated_at: new Date().toISOString()
    };

    // Cache the result
    suggestionCache.set(cacheKey, {
      suggestion: result,
      timestamp: Date.now()
    });

    // Cleanup old cache entries (keep last 50)
    if (suggestionCache.size > 50) {
      const firstKey = suggestionCache.keys().next().value;
      suggestionCache.delete(firstKey);
    }

    return result;

  } catch (error) {
    console.error('❌ AI suggestion error:', error.message);
    return generateFallbackSuggestion(taskTitle, projectContext, startTime, error.message);
  }
}

/**
 * Build context-aware prompt for Gemini
 */
function buildPrompt(taskTitle, context) {
  const {
    project_progress = 50,
    team_members = ['Team Member'],
    active_blockers = [],
    deadline = 'Next week',
    completed_tasks = 0,
    total_tasks = 10
  } = context;

  return `You are a strategic project manager AI assistant.

TASK JUST COMPLETED: "${taskTitle}"

PROJECT CONTEXT:
- Progress: ${project_progress}% (${completed_tasks}/${total_tasks} tasks done)
- Team: ${team_members.join(', ')}
- Active Blockers: ${active_blockers.length > 0 ? active_blockers.join(', ') : 'None'}
- Deadline: ${deadline}

Generate ONE strategic next step that unblocks the team and maintains momentum.

RESPONSE FORMAT (EXACTLY):
Next: [specific task name - be concrete and actionable]
Who: [specific person name from team, or role]
Time: [realistic estimate: e.g., "2 hours", "1 day"]
Why: [one sentence explaining strategic value]

Be specific, actionable, and strategic. Focus on unblocking progress.`;
}

/**
 * Call Gemini AI with timeout protection
 */
async function callGeminiWithTimeout(prompt, timeoutMs) {
  return Promise.race([
    (async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    })(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI timeout')), timeoutMs)
    )
  ]);
}

/**
 * Parse AI response into structured format
 */
function parseAISuggestion(text) {
  const lines = text.split('\n').filter(line => line.trim());
  const parsed = {};

  for (const line of lines) {
    if (line.startsWith('Next:')) {
      parsed.next = line.replace('Next:', '').trim();
    } else if (line.startsWith('Who:')) {
      parsed.who = line.replace('Who:', '').trim();
    } else if (line.startsWith('Time:')) {
      parsed.time = line.replace('Time:', '').trim();
    } else if (line.startsWith('Why:')) {
      parsed.why = line.replace('Why:', '').trim();
    }
  }

  // Calculate confidence based on completeness
  const fields = [parsed.next, parsed.who, parsed.time, parsed.why].filter(Boolean).length;
  parsed.confidence = (fields / 4) * 100;

  return parsed;
}

/**
 * Generate intelligent fallback suggestion
 */
function generateFallbackSuggestion(taskTitle, context, startTime, errorMsg = null) {
  const suggestions = [
    {
      next: 'Review and prioritize remaining tasks',
      who: 'Project Manager',
      time: '1 hour',
      why: 'Ensure team alignment on priorities'
    },
    {
      next: 'Address any blockers from team chat',
      who: 'Team Lead',
      time: '2 hours',
      why: 'Unblock team and maintain velocity'
    },
    {
      next: 'Update stakeholders on progress',
      who: 'Product Owner',
      time: '30 minutes',
      why: 'Maintain transparency and alignment'
    },
    {
      next: 'Plan next sprint or iteration',
      who: 'Scrum Master',
      time: '1-2 hours',
      why: 'Prepare for continued momentum'
    }
  ];

  // Pick suggestion based on context
  let suggestion;
  if (context.active_blockers?.length > 0) {
    suggestion = suggestions[1]; // Address blockers
  } else if (context.project_progress > 80) {
    suggestion = suggestions[2]; // Update stakeholders
  } else {
    suggestion = suggestions[0]; // Review priorities
  }

  return {
    ...suggestion,
    confidence: 70,
    source: 'fallback',
    cached: false,
    processing_time_ms: Date.now() - startTime,
    generated_at: new Date().toISOString(),
    error: errorMsg || undefined
  };
}

/**
 * Generate batch suggestions for multiple tasks
 */
async function generateBatchSuggestions(tasks, projectContext) {
  const results = await Promise.all(
    tasks.map(task => 
      generateNextStep(task.title, {
        ...projectContext,
        task_id: task.id,
        task_status: task.status
      })
    )
  );

  return results;
}

/**
 * Clear suggestion cache (for testing or manual refresh)
 */
function clearCache() {
  const size = suggestionCache.size;
  suggestionCache.clear();
  console.log(`🗑️  Cleared ${size} cached suggestions`);
  return { cleared: size };
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  return {
    size: suggestionCache.size,
    max_size: 50,
    ttl_minutes: 10,
    entries: Array.from(suggestionCache.keys()).map(key => ({
      key: key.substring(0, 50),
      age_seconds: Math.round((Date.now() - suggestionCache.get(key).timestamp) / 1000)
    }))
  };
}

// Initialize on module load
initializeAI();

module.exports = {
  generateNextStep,
  generateBatchSuggestions,
  clearCache,
  getCacheStats
};
