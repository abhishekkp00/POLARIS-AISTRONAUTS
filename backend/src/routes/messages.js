const express = require('express');
const router = express.Router();
const { analyzeMessage, getBadges } = require('../services/chatAnalysisAdvanced');
const { getDemoData, setDemoData } = require('../services/socketService');

// Demo data
let messages = [
  {
    id: '1',
    project_id: 'demo-project',
    user_id: '2',
    username: 'Rahul',
    content: 'Backend API is ready! All endpoints tested and documented.',
    analysis: {
      blockers: [],
      decisions: ['Backend API is ready'],
      actionItems: [],
      risks: [],
      badges: [{ type: 'decision', text: 'Backend API is ready!', emoji: '✅', color: '#10B981' }]
    },
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  }
];

// Initialize demo data
setDemoData({ ...getDemoData(), messages });

// GET all messages
router.get('/', (req, res) => {
  try {
    res.json(getDemoData().messages || messages);
  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST create message
router.post('/', (req, res) => {
  try {
    const { content, user_id, username } = req.body;
    const analysis = analyzeMessage(content, { username, user_id });
    const badges = getBadges(analysis);

    const newMessage = {
      id: String(Date.now()),
      project_id: 'demo-project',
      user_id,
      username,
      content,
      analysis: {
        ...analysis,
        badges
      },
      created_at: new Date().toISOString()
    };

    const currentMessages = getDemoData().messages || messages;
    currentMessages.push(newMessage);
    setDemoData({ ...getDemoData(), messages: currentMessages });

    // Log detected patterns
    if (analysis.blockers.length > 0) {
      console.log(`� BLOCKER detected from ${username}: ${analysis.blockers[0].text.substring(0, 40)}...`);
    }
    if (analysis.decisions.length > 0) {
      console.log(`✅ DECISION detected from ${username}: ${analysis.decisions[0].text.substring(0, 40)}...`);
    }

    console.log(`💬 Message from ${username} [${analysis.metadata.total_detections} patterns, ${analysis.metadata.processing_time_ms}ms]`);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('❌ Create message error:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

module.exports = router;
