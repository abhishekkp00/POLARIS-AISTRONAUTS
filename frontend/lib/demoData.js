/**
 * Demo Data for TaskMuse
 * Pre-loaded realistic data to impress judges instantly
 */

// Calculate timestamps relative to current time
const now = new Date();
const hoursAgo = (hours) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const daysFromNow = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

/**
 * DEMO TASKS - 7 total tasks across 4 columns
 */
export const demoTasks = [
  // PENDING (1 task)
  {
    id: 'task-1',
    title: 'Database Setup',
    description: 'Setup PostgreSQL database with proper indexing',
    status: 'pending',
    progress: 0,
    assigned_to: 'Aditya',
    deadline: daysFromNow(2), // 2 days from now
    created_at: daysAgo(1),
    updated_at: hoursAgo(4),
    priority: 'high',
    tags: ['backend', 'database'],
    aiSuggestion: null,
  },

  // IN PROGRESS (2 tasks)
  {
    id: 'task-2',
    title: 'Frontend Auth',
    description: 'Implement authentication UI with login/signup',
    status: 'in_progress',
    progress: 65,
    assigned_to: 'Priya',
    deadline: daysFromNow(3), // 3 days from now
    created_at: daysAgo(1),
    updated_at: hoursAgo(1),
    priority: 'high',
    tags: ['frontend', 'auth'],
    aiSuggestion: null,
  },
  {
    id: 'task-3',
    title: 'API Integration',
    description: 'Integrate frontend with backend APIs',
    status: 'in_progress',
    progress: 45,
    assigned_to: 'Sarah',
    deadline: daysFromNow(4), // 4 days from now
    created_at: daysAgo(1),
    updated_at: hoursAgo(2),
    priority: 'medium',
    tags: ['frontend', 'api'],
    aiSuggestion: null,
  },

  // SUBMITTED (2 tasks)
  {
    id: 'task-4',
    title: 'API Setup',
    description: 'Create all REST API endpoints',
    status: 'submitted',
    progress: 100,
    assigned_to: 'Rahul',
    deadline: daysFromNow(1), // 1 day from now
    created_at: daysAgo(2),
    updated_at: hoursAgo(3),
    priority: 'high',
    tags: ['backend', 'api'],
    aiSuggestion: {
      text: 'Next: Sarah should start integration testing (2 hours). Unblocks frontend team. Why: Frontend can\'t proceed without API, testing first validates all endpoints.',
      confidence: 0.95,
      suggestedAssignee: 'Sarah',
      estimatedTime: '2 hours',
      priority: 'high',
      reason: 'Frontend blocked without API validation',
    },
  },
  {
    id: 'task-5',
    title: 'Project Planning',
    description: 'Plan sprints and timeline',
    status: 'submitted',
    progress: 100,
    assigned_to: 'Priya',
    deadline: new Date().toISOString(), // Today
    created_at: daysAgo(3),
    updated_at: hoursAgo(4),
    priority: 'critical',
    tags: ['planning', 'management'],
    aiSuggestion: {
      text: 'Next: Team should review roadmap decisions (1 hour). Ensures alignment. Why: All development depends on this plan.',
      confidence: 0.88,
      suggestedAssignee: 'Team',
      estimatedTime: '1 hour',
      priority: 'high',
      reason: 'Strategic alignment needed before proceeding',
    },
  },

  // COMPLETED (3 tasks)
  {
    id: 'task-6',
    title: 'Requirements Gathering',
    description: 'Gather and document all project requirements',
    status: 'completed',
    progress: 100,
    assigned_to: 'Priya',
    deadline: daysAgo(1),
    created_at: daysAgo(5),
    updated_at: daysAgo(2),
    completed_at: daysAgo(2),
    priority: 'critical',
    tags: ['planning', 'requirements'],
    aiSuggestion: null,
  },
  {
    id: 'task-7',
    title: 'Design Mockups',
    description: 'Create UI/UX mockups for all screens',
    status: 'completed',
    progress: 100,
    assigned_to: 'Rahul',
    deadline: daysAgo(0.5),
    created_at: daysAgo(4),
    updated_at: daysAgo(1),
    completed_at: daysAgo(1),
    priority: 'high',
    tags: ['design', 'frontend'],
    aiSuggestion: null,
  },
  {
    id: 'task-8',
    title: 'Tech Stack Setup',
    description: 'Setup Next.js, Node.js, PostgreSQL, and deployment pipeline',
    status: 'completed',
    progress: 100,
    assigned_to: 'Sarah',
    deadline: hoursAgo(12),
    created_at: daysAgo(3),
    updated_at: hoursAgo(6),
    completed_at: hoursAgo(6),
    priority: 'critical',
    tags: ['devops', 'setup'],
    aiSuggestion: null,
  },
];

/**
 * DEMO MESSAGES - 5 pre-loaded chat messages with AI analysis
 */
export const demoMessages = [
  {
    id: 'msg-1',
    author: 'Rahul',
    text: 'Backend API is fully ready! All endpoints tested and working perfectly 🚀',
    timestamp: hoursAgo(4),
    analysis: {
      type: 'decision',
      decisions: ['API approved and ready to use'],
      blockers: [],
      actions: [],
      risks: [],
      severity: null,
    },
  },
  {
    id: 'msg-2',
    author: 'Priya',
    text: 'Waiting for API documentation so we can start the frontend integration',
    timestamp: hoursAgo(3.5),
    analysis: {
      type: 'blocker',
      blockers: ['Waiting for API documentation'],
      decisions: [],
      actions: ['Rahul should share API docs'],
      risks: [],
      severity: 'high',
    },
  },
  {
    id: 'msg-3',
    author: 'Sarah',
    text: 'We decided to use PostgreSQL instead of MongoDB - much better performance',
    timestamp: hoursAgo(3),
    analysis: {
      type: 'decision',
      decisions: ['Use PostgreSQL instead of MongoDB'],
      blockers: [],
      actions: [],
      risks: [],
      severity: null,
    },
  },
  {
    id: 'msg-4',
    author: 'Aditya',
    text: 'Running into an issue with database migration timing constraints',
    timestamp: hoursAgo(2.5),
    analysis: {
      type: 'risk',
      blockers: [],
      decisions: [],
      actions: [],
      risks: ['Database migration timing issues'],
      severity: 'medium',
    },
  },
  {
    id: 'msg-5',
    author: 'Rahul',
    text: 'Sarah should start integration testing of the API when ready',
    timestamp: hoursAgo(2),
    analysis: {
      type: 'action',
      blockers: [],
      decisions: [],
      actions: ['Sarah → Start API integration testing'],
      risks: [],
      severity: null,
    },
  },
];

/**
 * DEMO CONTRIBUTIONS - Team performance data
 */
export const demoContributions = [
  {
    name: 'Priya',
    completed: 8,
    in_progress: 1,
    pending: 0,
    total: 9,
    percentage: 95,
    impact: 'high',
    color: '#10b981', // Green
    trend: 'improving',
  },
  {
    name: 'Sarah',
    completed: 7,
    in_progress: 1,
    pending: 0,
    total: 8,
    percentage: 88,
    impact: 'high',
    color: '#10b981', // Green
    trend: 'stable',
  },
  {
    name: 'Rahul',
    completed: 5,
    in_progress: 2,
    pending: 1,
    total: 8,
    percentage: 65,
    impact: 'medium',
    color: '#3b82f6', // Blue
    trend: 'stable',
  },
  {
    name: 'Aditya',
    completed: 2,
    in_progress: 1,
    pending: 2,
    total: 5,
    percentage: 45,
    impact: 'medium',
    color: '#f59e0b', // Yellow
    trend: 'declining',
  },
];

/**
 * DEMO OVERALL STATS
 */
export const demoOverallStats = {
  totalTasks: 23,
  completed: 22,
  inProgress: 1,
  pending: 0,
  projectCompletion: 96,
  onTime: 91,
  teamMembers: 4,
  activeSprints: 2,
};

/**
 * DEMO BLOCKERS - Current blockers
 */
export const demoBlockers = [
  {
    id: 'blocker-1',
    title: 'Waiting for API documentation',
    description: 'Frontend team blocked until API docs are shared',
    from: 'Priya',
    severity: 'high',
    status: 'open',
    timestamp: hoursAgo(2),
    impact: 'blocks frontend integration',
    affectedTasks: ['task-2', 'task-3'],
    estimatedDelay: '4 hours',
  },
  {
    id: 'blocker-2',
    title: 'Database migration timing issues',
    description: 'Migration scripts running slower than expected',
    from: 'Aditya',
    severity: 'medium',
    status: 'open',
    timestamp: hoursAgo(1.5),
    impact: 'delays database setup',
    affectedTasks: ['task-1'],
    estimatedDelay: '2 hours',
  },
];

/**
 * DEMO DECISIONS - Key decisions logged
 */
export const demoDecisions = [
  {
    id: 'decision-1',
    title: 'Use PostgreSQL instead of MongoDB',
    description: 'After benchmarking, PostgreSQL offers 40% better performance for our use case',
    by: 'Sarah',
    timestamp: hoursAgo(3),
    impact: 'technical',
    status: 'implemented',
    rationale: 'Better performance, stronger ACID guarantees, team expertise',
    affectedAreas: ['database', 'backend'],
    implementedAt: hoursAgo(2.5),
  },
  {
    id: 'decision-2',
    title: 'Switch to Redis for caching',
    description: 'Implement Redis caching layer to improve API response times',
    by: 'Rahul',
    timestamp: hoursAgo(1),
    impact: 'technical',
    status: 'pending',
    rationale: 'Reduce database load, faster API responses',
    affectedAreas: ['backend', 'api'],
    implementedAt: null,
  },
  {
    id: 'decision-3',
    title: 'Frontend first, then backend deployment',
    description: 'Deploy frontend to Vercel first, backend to AWS afterwards',
    by: 'Priya',
    timestamp: hoursAgo(0.75),
    impact: 'process',
    status: 'in_progress',
    rationale: 'Frontend ready now, backend needs more testing',
    affectedAreas: ['deployment', 'devops'],
    implementedAt: null,
  },
];

/**
 * DEMO HEALTH SCORE
 */
export const demoHealthScore = {
  score: 85,
  status: 'healthy',
  message: 'All systems go! Project on track.',
  trend: 'improving',
  lastUpdated: hoursAgo(0.5),
  breakdown: {
    completion: { score: 96, weight: 0.4, label: 'Task Completion' },
    onTime: { score: 91, weight: 0.3, label: 'On-time Delivery' },
    teamBalance: { score: 75, weight: 0.2, label: 'Team Balance' },
    blockerImpact: { score: 88, weight: 0.1, label: 'Blocker Impact' },
  },
  details: {
    completedTasks: 22,
    totalTasks: 23,
    onTimePercentage: 91,
    activeBlockers: 2,
    teamUtilization: 'balanced',
  },
  recommendations: [
    'Resolve API documentation blocker (HIGH priority)',
    'Monitor Aditya\'s workload - may need support',
    'Great progress! Keep momentum going',
  ],
};

/**
 * Helper function to get demo data
 */
export const getDemoData = () => ({
  tasks: demoTasks,
  messages: demoMessages,
  contributions: demoContributions,
  overallStats: demoOverallStats,
  blockers: demoBlockers,
  decisions: demoDecisions,
  healthScore: demoHealthScore,
});

/**
 * Initialize demo data in localStorage (for persistence)
 */
export const initializeDemoData = () => {
  if (typeof window === 'undefined') return;

  const demoData = getDemoData();

  // Store in localStorage for persistence across page reloads
  try {
    localStorage.setItem('taskmuse_demo_tasks', JSON.stringify(demoData.tasks));
    localStorage.setItem('taskmuse_demo_messages', JSON.stringify(demoData.messages));
    localStorage.setItem('taskmuse_demo_contributions', JSON.stringify(demoData.contributions));
    localStorage.setItem('taskmuse_demo_blockers', JSON.stringify(demoData.blockers));
    localStorage.setItem('taskmuse_demo_decisions', JSON.stringify(demoData.decisions));
    localStorage.setItem('taskmuse_demo_health', JSON.stringify(demoData.healthScore));
    localStorage.setItem('taskmuse_demo_stats', JSON.stringify(demoData.overallStats));
    localStorage.setItem('taskmuse_demo_initialized', 'true');

    console.log('✅ Demo data initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing demo data:', error);
  }

  return demoData;
};

/**
 * Load demo data from localStorage or initialize if not present
 */
export const loadDemoData = () => {
  if (typeof window === 'undefined') return getDemoData();

  try {
    const isInitialized = localStorage.getItem('taskmuse_demo_initialized');

    if (!isInitialized) {
      return initializeDemoData();
    }

    // Load from localStorage
    const tasks = JSON.parse(localStorage.getItem('taskmuse_demo_tasks') || '[]');
    const messages = JSON.parse(localStorage.getItem('taskmuse_demo_messages') || '[]');
    const contributions = JSON.parse(localStorage.getItem('taskmuse_demo_contributions') || '[]');
    const blockers = JSON.parse(localStorage.getItem('taskmuse_demo_blockers') || '[]');
    const decisions = JSON.parse(localStorage.getItem('taskmuse_demo_decisions') || '[]');
    const healthScore = JSON.parse(localStorage.getItem('taskmuse_demo_health') || '{}');
    const overallStats = JSON.parse(localStorage.getItem('taskmuse_demo_stats') || '{}');

    console.log('✅ Demo data loaded from localStorage');

    return {
      tasks,
      messages,
      contributions,
      overallStats,
      blockers,
      decisions,
      healthScore,
    };
  } catch (error) {
    console.error('❌ Error loading demo data:', error);
    return initializeDemoData();
  }
};

/**
 * Reset demo data to initial state
 */
export const resetDemoData = () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('taskmuse_demo_initialized');
    console.log('✅ Demo data reset. Refresh to see initial state.');
  } catch (error) {
    console.error('❌ Error resetting demo data:', error);
  }
};

const demoDataExports = {
  getDemoData,
  initializeDemoData,
  loadDemoData,
  resetDemoData,
  demoTasks,
  demoMessages,
  demoContributions,
  demoBlockers,
  demoDecisions,
  demoHealthScore,
  demoOverallStats,
};

export default demoDataExports;
