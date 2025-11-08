const express = require('express');
const router = express.Router();
const { calculateProjectHealth, getHistoricalTrend } = require('../services/projectHealth');
const { getDemoData, setDemoData } = require('../services/socketService');

// Demo data
let contributions = [
  { user_id: '1', username: 'Priya', tasks_completed: 12, impact_score: 87, total_hours: 45 },
  { user_id: '2', username: 'Rahul', tasks_completed: 15, impact_score: 92, total_hours: 52 },
  { user_id: '3', username: 'Sarah', tasks_completed: 8, impact_score: 71, total_hours: 32 },
  { user_id: '4', username: 'Aditya', tasks_completed: 10, impact_score: 78, total_hours: 38 }
];

// Initialize demo data
setDemoData({ ...getDemoData(), contributions });

// GET contributions
router.get('/contributions', (req, res) => {
  try {
    res.json(getDemoData().contributions || contributions);
  } catch (error) {
    console.error('❌ Get contributions error:', error);
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
});

// GET health score (comprehensive)
router.get('/health-score', (req, res) => {
  try {
    const data = getDemoData();
    const health = calculateProjectHealth(
      data.tasks || [],
      data.messages || [],
      data.contributions || []
    );

    console.log(`💯 Health score: ${health.score}/100 (${health.status}) [${health.processing_time_ms}ms]`);
    res.json(health);
  } catch (error) {
    console.error('❌ Health score error:', error);
    res.status(500).json({ error: 'Failed to calculate health score' });
  }
});

// GET health trend (historical data)
router.get('/health-trend', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const trend = getHistoricalTrend('demo-project', days);
    
    res.json(trend);
  } catch (error) {
    console.error('❌ Health trend error:', error);
    res.status(500).json({ error: 'Failed to get health trend' });
  }
});

module.exports = router;
