const express = require('express');
const router = express.Router();
const { generateNextStep } = require('../services/aiNextStep');
const { getDemoData, setDemoData } = require('../services/socketService');

// Demo data
let tasks = [
  {
    id: '1',
    project_id: 'demo-project',
    title: 'Frontend UI Components',
    description: 'Build React components with Tailwind CSS and smooth animations',
    status: 'in_progress',
    assigned_to: '1',
    assignee_name: 'Priya',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 65,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    project_id: 'demo-project',
    title: 'API Integration',
    description: 'Connect frontend to Express backend with Socket.io real-time updates',
    status: 'completed',
    assigned_to: '2',
    assignee_name: 'Rahul',
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 100,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    ai_suggestion: 'Next: Add authentication / Who: Security Team / Time: 4 hours / Why: Secure endpoints before production'
  },
  {
    id: '3',
    project_id: 'demo-project',
    title: 'Database Setup',
    description: 'Configure PostgreSQL with proper schema and indexes for scalability',
    status: 'pending',
    assigned_to: '3',
    assignee_name: 'Sarah',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Initialize demo data
setDemoData({ ...getDemoData(), tasks });

// GET all tasks
router.get('/', (req, res) => {
  try {
    res.json(getDemoData().tasks || tasks);
  } catch (error) {
    console.error('❌ Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST create task
router.post('/', (req, res) => {
  try {
    const newTask = {
      id: String(Date.now()),
      project_id: 'demo-project',
      ...req.body,
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const currentTasks = getDemoData().tasks || tasks;
    currentTasks.push(newTask);
    setDemoData({ ...getDemoData(), tasks: currentTasks });

    console.log(`✅ Task created: ${newTask.title}`);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('❌ Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH update task
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const currentTasks = getDemoData().tasks || tasks;
    const taskIndex = currentTasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    currentTasks[taskIndex] = {
      ...currentTasks[taskIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };

    setDemoData({ ...getDemoData(), tasks: currentTasks });
    console.log(`✅ Task updated: ${currentTasks[taskIndex].title}`);
    res.json(currentTasks[taskIndex]);
  } catch (error) {
    console.error('❌ Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// POST submit task (with AI next-step suggestion)
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const currentTasks = getDemoData().tasks || tasks;
    const taskIndex = currentTasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = currentTasks[taskIndex];
    task.status = 'submitted';
    task.progress = 100;
    task.updated_at = new Date().toISOString();

    // Build project context for AI
    const completedCount = currentTasks.filter(t => t.status === 'completed').length;
    const projectContext = {
      project_progress: Math.round((completedCount / currentTasks.length) * 100),
      team_members: [...new Set(currentTasks.map(t => t.assignee_name))],
      active_blockers: (getDemoData().messages || [])
        .filter(m => m.analysis?.blockers?.length > 0)
        .map(m => m.analysis.blockers[0].text),
      completed_tasks: completedCount,
      total_tasks: currentTasks.length,
      deadline: task.deadline
    };

    // Generate AI next-step suggestion
    const nextStep = await generateNextStep(task.title, projectContext);
    
    task.ai_next_step = {
      next: nextStep.next,
      who: nextStep.who,
      time: nextStep.time,
      why: nextStep.why,
      confidence: nextStep.confidence,
      source: nextStep.source,
      generated_at: nextStep.generated_at
    };

    // Legacy format for backward compatibility
    task.ai_suggestion = `Next: ${nextStep.next} / Who: ${nextStep.who} / Time: ${nextStep.time} / Why: ${nextStep.why}`;

    setDemoData({ ...getDemoData(), tasks: currentTasks });
    
    console.log(`🤖 AI Next-Step for "${task.title}": ${nextStep.next} [${nextStep.processing_time_ms}ms, ${nextStep.source}]`);
    res.json(task);
  } catch (error) {
    console.error('❌ Submit task error:', error);
    res.status(500).json({ error: 'Failed to submit task' });
  }
});

module.exports = router;
