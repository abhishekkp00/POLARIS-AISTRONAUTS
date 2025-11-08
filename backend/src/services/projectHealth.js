/**
 * PROJECT HEALTH SERVICE - Real-time Health Scoring
 * Calculates comprehensive project health (0-100)
 * Updates on every task change, chat message, or contribution
 */

/**
 * Calculate project health score with detailed breakdown
 * @param {array} allTasks - All project tasks
 * @param {array} allMessages - All chat messages
 * @param {array} contributions - Team contribution data
 * @returns {object} Health score with details and recommendations
 */
function calculateProjectHealth(allTasks = [], allMessages = [], contributions = []) {
  const startTime = Date.now();

  // Initialize scores
  const scores = {
    completion: 0,
    on_time: 0,
    team_balance: 0,
    blocker_impact: 0
  };

  const details = {
    total_tasks: allTasks.length,
    completed_tasks: 0,
    in_progress_tasks: 0,
    pending_tasks: 0,
    overdue_tasks: 0,
    active_blockers: 0,
    total_messages: allMessages.length,
    team_size: contributions.length
  };

  // CALCULATION 1: COMPLETION RATE (40% weight)
  if (allTasks.length > 0) {
    const completedTasks = allTasks.filter(t => t.status === 'completed');
    details.completed_tasks = completedTasks.length;
    details.in_progress_tasks = allTasks.filter(t => t.status === 'in_progress').length;
    details.pending_tasks = allTasks.filter(t => t.status === 'pending').length;

    scores.completion = (completedTasks.length / allTasks.length) * 100;

    // CALCULATION 2: ON-TIME RATE (25% weight)
    const completedOnTime = completedTasks.filter(task => {
      if (!task.deadline || !task.updated_at) return true;
      return new Date(task.updated_at) <= new Date(task.deadline);
    });

    if (completedTasks.length > 0) {
      scores.on_time = (completedOnTime.length / completedTasks.length) * 100;
    } else {
      scores.on_time = 100; // No completed tasks yet, neutral score
    }

    // Check for overdue tasks
    const now = new Date();
    details.overdue_tasks = allTasks.filter(task => 
      task.status !== 'completed' && 
      task.deadline && 
      new Date(task.deadline) < now
    ).length;

  } else {
    scores.completion = 100; // No tasks = neutral
    scores.on_time = 100;
  }

  // CALCULATION 3: TEAM BALANCE (20% weight)
  if (contributions.length >= 2) {
    const taskCounts = contributions.map(c => c.tasks_completed || 0);
    const mean = taskCounts.reduce((sum, val) => sum + val, 0) / taskCounts.length;
    
    // Calculate standard deviation
    const variance = taskCounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / taskCounts.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower variance = higher balance score
    // Normalize: if stdDev = 0 (perfect balance) = 100, if stdDev >= mean = 0
    const maxStdDev = mean > 0 ? mean : 10; // Avoid division by zero
    scores.team_balance = Math.max(0, 100 - ((stdDev / maxStdDev) * 100));
    
  } else if (contributions.length === 1) {
    scores.team_balance = 100; // Single person = balanced by default
  } else {
    scores.team_balance = 50; // No data = neutral
  }

  // CALCULATION 4: BLOCKER IMPACT (15% weight)
  const blockerMessages = allMessages.filter(msg => 
    msg.analysis?.blockers && msg.analysis.blockers.length > 0
  );
  details.active_blockers = blockerMessages.length;

  // Each blocker reduces score by 5 points, max 100 reduction
  scores.blocker_impact = Math.max(0, 100 - (details.active_blockers * 5));

  // FINAL HEALTH SCORE (weighted average)
  const healthScore = Math.round(
    (scores.completion * 0.40) +
    (scores.on_time * 0.25) +
    (scores.team_balance * 0.20) +
    (scores.blocker_impact * 0.15)
  );

  // Determine health status
  const { status, message, emoji, color } = getHealthStatus(healthScore);

  // Calculate trend (requires historical data - simplified)
  const trend = calculateTrend(healthScore, allTasks, allMessages);

  // Generate recommendations
  const recommendations = generateRecommendations(scores, details, healthScore);

  return {
    score: Math.max(0, Math.min(100, healthScore)),
    status,
    message,
    emoji,
    color,
    trend,
    details: {
      ...details,
      completion_rate: Math.round(scores.completion),
      on_time_rate: Math.round(scores.on_time),
      team_balance_score: Math.round(scores.team_balance),
      blocker_impact_score: Math.round(scores.blocker_impact)
    },
    components: {
      completion: { score: Math.round(scores.completion), weight: '40%' },
      on_time: { score: Math.round(scores.on_time), weight: '25%' },
      team_balance: { score: Math.round(scores.team_balance), weight: '20%' },
      blocker_impact: { score: Math.round(scores.blocker_impact), weight: '15%' }
    },
    recommendations,
    calculated_at: new Date().toISOString(),
    processing_time_ms: Date.now() - startTime
  };
}

/**
 * Get health status based on score
 */
function getHealthStatus(score) {
  if (score >= 80) {
    return {
      status: 'green',
      message: 'All systems go! Project on track.',
      emoji: '🟢',
      color: '#10B981'
    };
  } else if (score >= 60) {
    return {
      status: 'yellow',
      message: 'At Risk - Team needs support.',
      emoji: '🟡',
      color: '#F59E0B'
    };
  } else if (score >= 40) {
    return {
      status: 'orange',
      message: 'Critical - Intervention needed.',
      emoji: '🟠',
      color: '#F97316'
    };
  } else {
    return {
      status: 'red',
      message: 'Emergency Mode - Immediate action required.',
      emoji: '🔴',
      color: '#EF4444'
    };
  }
}

/**
 * Calculate health trend
 */
function calculateTrend(currentScore, allTasks, allMessages) {
  // Simplified trend: based on recent activity
  const recentMessages = allMessages.filter(msg => {
    const msgTime = new Date(msg.created_at);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return msgTime > hourAgo;
  });

  const recentTasks = allTasks.filter(task => {
    const taskTime = new Date(task.updated_at || task.created_at);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return taskTime > hourAgo;
  });

  // More activity = potentially improving
  if (recentMessages.length > 5 || recentTasks.length > 2) {
    return currentScore >= 70 ? 'improving' : 'stable';
  } else if (recentMessages.length === 0 && recentTasks.length === 0) {
    return 'declining'; // No activity = concerning
  } else {
    return 'stable';
  }
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(scores, details, healthScore) {
  const recommendations = [];

  // Completion rate recommendations
  if (scores.completion < 50) {
    recommendations.push({
      priority: 'high',
      category: 'completion',
      action: 'Focus team on completing in-progress tasks before starting new ones',
      impact: 'Improves completion rate by 15-20%',
      emoji: '🎯'
    });
  }

  // On-time delivery recommendations
  if (scores.on_time < 60) {
    recommendations.push({
      priority: 'high',
      category: 'deadlines',
      action: 'Review task estimates and adjust deadlines to be more realistic',
      impact: 'Reduces deadline pressure and improves quality',
      emoji: '⏰'
    });
  }

  // Team balance recommendations
  if (scores.team_balance < 60) {
    recommendations.push({
      priority: 'medium',
      category: 'team_balance',
      action: 'Redistribute tasks to balance workload across team members',
      impact: 'Prevents burnout and improves team morale',
      emoji: '⚖️'
    });
  }

  // Blocker recommendations
  if (details.active_blockers > 3) {
    recommendations.push({
      priority: 'critical',
      category: 'blockers',
      action: `Address ${details.active_blockers} active blockers immediately`,
      impact: 'Unblocks team and restores velocity',
      emoji: '🚨'
    });
  } else if (details.active_blockers > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'blockers',
      action: `Resolve ${details.active_blockers} blocker(s) to maintain momentum`,
      impact: 'Prevents blockers from accumulating',
      emoji: '⚠️'
    });
  }

  // Overdue tasks
  if (details.overdue_tasks > 0) {
    recommendations.push({
      priority: 'high',
      category: 'overdue',
      action: `Prioritize ${details.overdue_tasks} overdue task(s) for immediate completion`,
      impact: 'Improves on-time delivery rate',
      emoji: '📅'
    });
  }

  // Positive reinforcement
  if (healthScore >= 80 && recommendations.length === 0) {
    recommendations.push({
      priority: 'low',
      category: 'momentum',
      action: 'Maintain current pace and celebrate team wins',
      impact: 'Sustains high performance and morale',
      emoji: '🎉'
    });
  }

  return recommendations;
}

/**
 * Get historical health trends (requires stored data)
 */
function getHistoricalTrend(projectId, days = 7) {
  // In production, query database for historical scores
  // For demo, return mock trend
  return {
    project_id: projectId,
    period_days: days,
    data_points: [
      { date: '2025-11-01', score: 75 },
      { date: '2025-11-03', score: 78 },
      { date: '2025-11-05', score: 82 },
      { date: '2025-11-07', score: 85 },
      { date: '2025-11-08', score: 85 }
    ],
    average: 81,
    trend: 'improving'
  };
}

/**
 * Compare project health across multiple projects
 */
function compareProjects(projects) {
  return projects.map(project => {
    const health = calculateProjectHealth(
      project.tasks || [],
      project.messages || [],
      project.contributions || []
    );

    return {
      project_id: project.id,
      project_name: project.name,
      health_score: health.score,
      status: health.status,
      rank: 0 // Will be calculated after sorting
    };
  }).sort((a, b) => b.health_score - a.health_score)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

module.exports = {
  calculateProjectHealth,
  getHealthStatus,
  getHistoricalTrend,
  compareProjects
};
