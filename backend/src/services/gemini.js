const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

// Initialize Gemini AI
function initializeGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('⚠️  Gemini API key not configured - using fallback suggestions');
    return false;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✅ Gemini AI initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error.message);
    return false;
  }
}

// Generate AI suggestion
async function generateSuggestion(prompt) {
  if (!model) {
    return 'Next: Continue with next priority task / Who: Team Lead / Time: 2 hours / Why: Maintain project momentum';
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    return 'Next: Review and prioritize remaining tasks / Who: Project Manager / Time: 1 hour / Why: Stay on track';
  }
}

// Generate task suggestion
async function generateTaskSuggestion(task) {
  const prompt = `You are a project management AI assistant. Given this task:
Title: ${task.title}
Description: ${task.description}
Status: ${task.status}
Progress: ${task.progress}%

Provide the next step in this exact format:
Next: [specific action] / Who: [role/person] / Time: [estimate] / Why: [brief reason]

Keep it concise and actionable.`;

  return await generateSuggestion(prompt);
}

// Initialize on module load
initializeGemini();

module.exports = {
  generateTaskSuggestion,
  generateSuggestion
};
