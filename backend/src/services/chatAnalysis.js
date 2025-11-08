// Message analysis service - extracts blockers, decisions, actions, risks

function analyzeMessage(content) {
  const analysis = {
    blockers: [],
    decisions: [],
    actionItems: [],
    risks: [],
    badges: []
  };

  const text = content.toLowerCase();

  // Detect blockers
  if (text.match(/waiting for|blocked|stuck|depends on|can't proceed|need|require|pending/i)) {
    analysis.blockers.push(content);
    analysis.badges.push({
      type: 'blocker',
      text: content.substring(0, 50) + '...',
      emoji: '🚨',
      color: '#EF4444'
    });
  }

  // Detect decisions
  if (text.match(/decided|agreed|approved|confirmed|going with|chosen|finalized/i)) {
    analysis.decisions.push(content);
    analysis.badges.push({
      type: 'decision',
      text: content.substring(0, 50) + '...',
      emoji: '✅',
      color: '#10B981'
    });
  }

  // Detect action items
  if (text.match(/should|will|needs to|must|action|todo|task|assign/i)) {
    analysis.actionItems.push(content);
    analysis.badges.push({
      type: 'action',
      text: content.substring(0, 50) + '...',
      emoji: '📝',
      color: '#3B82F6'
    });
  }

  // Detect risks
  if (text.match(/problem|issue|error|bug|critical|warning|concern|risk|failure/i)) {
    analysis.risks.push(content);
    analysis.badges.push({
      type: 'risk',
      text: content.substring(0, 50) + '...',
      emoji: '⚠️',
      color: '#F59E0B'
    });
  }

  return analysis;
}

module.exports = {
  analyzeMessage
};
