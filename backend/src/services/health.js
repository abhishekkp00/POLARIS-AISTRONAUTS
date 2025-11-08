// Health score calculation service

function calculateHealthScore(tasks, messages) {
  const totalTasks = tasks.length;
  if (totalTasks === 0) return 100;

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = tasks.filter(t => 
    new Date(t.deadline) < new Date() && t.status !== 'completed'
  ).length;
  const blockedMessages = messages.filter(m => 
    m.analysis?.blockers && m.analysis.blockers.length > 0
  ).length;

  let score = 100;
  score -= overdueTasks * 15; // -15 per overdue task
  score -= blockedMessages * 10; // -10 per blocker
  score += (completedTasks / totalTasks) * 30; // +30 for completion rate

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getHealthMetrics(tasks, messages) {
  return {
    total_tasks: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    submitted: tasks.filter(t => t.status === 'submitted').length,
    overdue: tasks.filter(t => 
      new Date(t.deadline) < new Date() && t.status !== 'completed'
    ).length,
    blockers: messages.filter(m => 
      m.analysis?.blockers && m.analysis.blockers.length > 0
    ).length
  };
}

module.exports = {
  calculateHealthScore,
  getHealthMetrics
};
