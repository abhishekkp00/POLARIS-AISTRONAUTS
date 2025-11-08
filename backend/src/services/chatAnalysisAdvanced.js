/**
 * CHAT ANALYSIS SERVICE - Real-time Intelligence
 * Analyzes chat messages in <50ms without external API calls
 * Detects: Blockers, Decisions, Actions, Risks
 */

const BLOCKER_PATTERNS = [
  { keyword: 'waiting for', severity: 'high', regex: /waiting for\s+(.{1,100})/i },
  { keyword: 'stuck on', severity: 'high', regex: /stuck on\s+(.{1,100})/i },
  { keyword: 'blocked by', severity: 'high', regex: /blocked by\s+(.{1,100})/i },
  { keyword: 'depends on', severity: 'medium', regex: /depends on\s+(.{1,100})/i },
  { keyword: "can't proceed", severity: 'high', regex: /can't proceed\s+(.{0,100})/i },
  { keyword: 'need approval', severity: 'medium', regex: /need approval\s+(.{0,100})/i },
  { keyword: 'pending', severity: 'medium', regex: /pending\s+(.{1,100})/i },
];

const DECISION_PATTERNS = [
  { keyword: 'we decided', impact: 'strategic', regex: /we decided\s+(.{1,100})/i },
  { keyword: 'agreed to', impact: 'team', regex: /agreed to\s+(.{1,100})/i },
  { keyword: 'approved', impact: 'formal', regex: /approved\s+(.{1,100})/i },
  { keyword: "let's use", impact: 'technical', regex: /let's use\s+(.{1,100})/i },
  { keyword: 'settled on', impact: 'team', regex: /settled on\s+(.{1,100})/i },
  { keyword: 'going with', impact: 'technical', regex: /going with\s+(.{1,100})/i },
  { keyword: 'chosen', impact: 'strategic', regex: /chosen\s+(.{1,100})/i },
];

const ACTION_PATTERNS = [
  { keyword: 'should', urgency: 'medium', regex: /(\w+)\s+should\s+(.{1,100})/i },
  { keyword: 'will', urgency: 'high', regex: /(\w+)\s+will\s+(.{1,100})/i },
  { keyword: 'needs to', urgency: 'high', regex: /(\w+)\s+needs to\s+(.{1,100})/i },
  { keyword: 'must', urgency: 'critical', regex: /(\w+)\s+must\s+(.{1,100})/i },
  { keyword: 'todo', urgency: 'medium', regex: /todo:\s*(.{1,100})/i },
  { keyword: '@mention', urgency: 'high', regex: /@(\w+)\s+(.{1,100})/i },
];

const RISK_PATTERNS = [
  { keyword: 'problem', priority: 'high', regex: /problem with\s+(.{1,100})/i },
  { keyword: 'error', priority: 'high', regex: /error\s+(.{1,100})/i },
  { keyword: 'issue', priority: 'medium', regex: /issue with\s+(.{1,100})/i },
  { keyword: 'bug', priority: 'high', regex: /bug\s+(.{1,100})/i },
  { keyword: 'crash', priority: 'critical', regex: /crash\w*\s+(.{0,100})/i },
  { keyword: "won't work", priority: 'high', regex: /won't work\s+(.{0,100})/i },
  { keyword: 'failing', priority: 'high', regex: /failing\s+(.{1,100})/i },
  { keyword: 'concern', priority: 'medium', regex: /concern about\s+(.{1,100})/i },
];

/**
 * Analyzes a chat message for critical patterns
 * @param {string} text - Message content
 * @param {object} metadata - Optional: { username, timestamp }
 * @returns {object} Analysis result with blockers, decisions, actions, risks
 */
function analyzeMessage(text, metadata = {}) {
  const startTime = Date.now();
  
  const analysis = {
    blockers: [],
    decisions: [],
    actions: [],
    risks: [],
    metadata: {
      analyzed_at: new Date().toISOString(),
      processing_time_ms: 0,
      confidence: 0,
      ...metadata
    }
  };

  if (!text || typeof text !== 'string') {
    analysis.metadata.processing_time_ms = Date.now() - startTime;
    return analysis;
  }

  const textLower = text.toLowerCase();
  let matchCount = 0;

  // Detect BLOCKERS
  for (const pattern of BLOCKER_PATTERNS) {
    if (textLower.includes(pattern.keyword)) {
      const match = text.match(pattern.regex);
      const extractedText = match ? match[1]?.trim() || text : text;
      
      analysis.blockers.push({
        text: extractedText.substring(0, 150),
        full_message: text,
        severity: pattern.severity,
        keyword: pattern.keyword,
        detected_at: new Date().toISOString(),
        emoji: '🚨',
        color: '#EF4444'
      });
      matchCount++;
    }
  }

  // Detect DECISIONS
  for (const pattern of DECISION_PATTERNS) {
    if (textLower.includes(pattern.keyword)) {
      const match = text.match(pattern.regex);
      const extractedText = match ? match[1]?.trim() || text : text;
      
      analysis.decisions.push({
        text: extractedText.substring(0, 150),
        full_message: text,
        impact: pattern.impact,
        keyword: pattern.keyword,
        detected_at: new Date().toISOString(),
        emoji: '✅',
        color: '#10B981'
      });
      matchCount++;
    }
  }

  // Detect ACTION ITEMS
  for (const pattern of ACTION_PATTERNS) {
    if (pattern.keyword === '@mention') {
      const matches = text.matchAll(/@(\w+)/g);
      for (const match of matches) {
        const assignee = match[1];
        const context = text.substring(Math.max(0, match.index - 20), match.index + 80);
        
        analysis.actions.push({
          text: context.trim(),
          full_message: text,
          assignee: `@${assignee}`,
          urgency: pattern.urgency,
          keyword: '@mention',
          detected_at: new Date().toISOString(),
          emoji: '📝',
          color: '#3B82F6'
        });
        matchCount++;
      }
    } else if (textLower.includes(pattern.keyword)) {
      const match = text.match(pattern.regex);
      const extractedText = match ? match[2]?.trim() || text : text;
      const assignee = match && match[1] ? match[1] : 'unassigned';
      
      analysis.actions.push({
        text: extractedText.substring(0, 150),
        full_message: text,
        assignee: assignee,
        urgency: pattern.urgency,
        keyword: pattern.keyword,
        detected_at: new Date().toISOString(),
        emoji: '📝',
        color: '#3B82F6'
      });
      matchCount++;
    }
  }

  // Detect RISKS
  for (const pattern of RISK_PATTERNS) {
    if (textLower.includes(pattern.keyword)) {
      const match = text.match(pattern.regex);
      const extractedText = match ? match[1]?.trim() || text : text;
      
      analysis.risks.push({
        text: extractedText.substring(0, 150),
        full_message: text,
        priority: pattern.priority,
        keyword: pattern.keyword,
        detected_at: new Date().toISOString(),
        emoji: '⚠️',
        color: '#F59E0B'
      });
      matchCount++;
    }
  }

  // Calculate confidence score (0-100)
  analysis.metadata.confidence = Math.min(100, matchCount * 25);
  analysis.metadata.processing_time_ms = Date.now() - startTime;
  analysis.metadata.total_detections = matchCount;

  return analysis;
}

/**
 * Get summary badges for UI display
 * @param {object} analysis - Result from analyzeMessage
 * @returns {array} Badge objects for UI
 */
function getBadges(analysis) {
  const badges = [];

  if (analysis.blockers.length > 0) {
    badges.push({
      type: 'blocker',
      count: analysis.blockers.length,
      emoji: '🚨',
      color: '#EF4444',
      label: `${analysis.blockers.length} Blocker${analysis.blockers.length > 1 ? 's' : ''}`
    });
  }

  if (analysis.decisions.length > 0) {
    badges.push({
      type: 'decision',
      count: analysis.decisions.length,
      emoji: '✅',
      color: '#10B981',
      label: `${analysis.decisions.length} Decision${analysis.decisions.length > 1 ? 's' : ''}`
    });
  }

  if (analysis.actions.length > 0) {
    badges.push({
      type: 'action',
      count: analysis.actions.length,
      emoji: '📝',
      color: '#3B82F6',
      label: `${analysis.actions.length} Action${analysis.actions.length > 1 ? 's' : ''}`
    });
  }

  if (analysis.risks.length > 0) {
    badges.push({
      type: 'risk',
      count: analysis.risks.length,
      emoji: '⚠️',
      color: '#F59E0B',
      label: `${analysis.risks.length} Risk${analysis.risks.length > 1 ? 's' : ''}`
    });
  }

  return badges;
}

/**
 * Batch analyze multiple messages
 * @param {array} messages - Array of message objects with .content
 * @returns {array} Analysis results for each message
 */
function analyzeBatch(messages) {
  return messages.map(msg => ({
    message_id: msg.id,
    content: msg.content,
    analysis: analyzeMessage(msg.content, {
      username: msg.username,
      timestamp: msg.created_at
    })
  }));
}

module.exports = {
  analyzeMessage,
  getBadges,
  analyzeBatch
};
