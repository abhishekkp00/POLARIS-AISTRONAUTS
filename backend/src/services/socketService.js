const { analyzeMessage, getBadges } = require('./chatAnalysisAdvanced');
const { generateNextStep } = require('./aiNextStep');
const { calculateProjectHealth } = require('./projectHealth');

// In-memory data store (replace with database in production)
let demoData = {
  tasks: [],
  messages: [],
  contributions: []
};

function initializeSocket(io) {
  console.log('🔌 Socket.io service initialized');

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Send initial state
    socket.emit('initial_state', demoData);

    // Handle send message (with advanced analysis)
    socket.on('send_message', async (data) => {
      try {
        const { content, user_id, username } = data;
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

        demoData.messages.push(newMessage);
        io.emit('receive_message', newMessage);

        // Emit specific alerts for blockers
        if (analysis.blockers.length > 0) {
          io.emit('blocker_alert', {
            blocker: analysis.blockers[0],
            message: content,
            user: username,
            severity: analysis.blockers[0].severity,
            timestamp: new Date().toISOString()
          });
        }

        // Emit decision logs
        if (analysis.decisions.length > 0) {
          io.emit('decision_logged', {
            decision: analysis.decisions[0],
            message: content,
            user: username,
            impact: analysis.decisions[0].impact,
            timestamp: new Date().toISOString()
          });
        }

        // Emit action items
        if (analysis.actions.length > 0) {
          io.emit('action_created', {
            action: analysis.actions[0],
            assignee: analysis.actions[0].assignee,
            timestamp: new Date().toISOString()
          });
        }

        console.log(`💬 ${username}: [${analysis.metadata.total_detections} patterns, ${analysis.metadata.processing_time_ms}ms]`);
      } catch (error) {
        console.error('❌ send_message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle task progress change
    socket.on('task_progress_changed', (data) => {
      try {
        const { task_id, progress } = data;
        const task = demoData.tasks.find(t => t.id === task_id);

        if (task) {
          task.progress = progress;
          task.updated_at = new Date().toISOString();
          io.emit('task_progress_updated', task);
          console.log(`📊 Task progress: ${task.title} → ${progress}%`);
        }
      } catch (error) {
        console.error('❌ task_progress_changed error:', error);
      }
    });

    // Handle task status change
    socket.on('task_status_changed', (data) => {
      try {
        const { task_id, status } = data;
        const task = demoData.tasks.find(t => t.id === task_id);

        if (task) {
          task.status = status;
          task.updated_at = new Date().toISOString();
          io.emit('task_updated', task);
          io.emit('heatmap_updated', demoData.contributions);
          console.log(`📋 Task status: ${task.title} → ${status}`);
        }
      } catch (error) {
        console.error('❌ task_status_changed error:', error);
      }
    });

    // Handle task submission (with AI next-step)
    socket.on('task_submitted', async (data) => {
      try {
        const { task_id } = data;
        const task = demoData.tasks.find(t => t.id === task_id);

        if (task) {
          task.status = 'submitted';
          task.progress = 100;
          task.updated_at = new Date().toISOString();

          // Build project context
          const completedCount = demoData.tasks.filter(t => t.status === 'completed').length;
          const projectContext = {
            project_progress: Math.round((completedCount / demoData.tasks.length) * 100),
            team_members: [...new Set(demoData.tasks.map(t => t.assignee_name))],
            active_blockers: demoData.messages
              .filter(m => m.analysis?.blockers?.length > 0)
              .map(m => m.analysis.blockers[0].text),
            completed_tasks: completedCount,
            total_tasks: demoData.tasks.length
          };

          const nextStep = await generateNextStep(task.title, projectContext);
          
          task.ai_next_step = {
            next: nextStep.next,
            who: nextStep.who,
            time: nextStep.time,
            why: nextStep.why,
            confidence: nextStep.confidence
          };

          task.ai_suggestion = `Next: ${nextStep.next} / Who: ${nextStep.who} / Time: ${nextStep.time} / Why: ${nextStep.why}`;

          io.emit('ai_suggestion_ready', {
            task_id,
            next_step: nextStep,
            task
          });

          console.log(`🤖 AI Next-Step: ${nextStep.next} [${nextStep.source}]`);
        }
      } catch (error) {
        console.error('❌ task_submitted error:', error);
      }
    });

    // Handle health score request (comprehensive)
    socket.on('get_health_score', () => {
      try {
        const health = calculateProjectHealth(
          demoData.tasks,
          demoData.messages,
          demoData.contributions || []
        );
        
        socket.emit('health_score_updated', health);
        
        console.log(`💯 Health: ${health.score}/100 (${health.status}) - ${health.message}`);
      } catch (error) {
        console.error('❌ get_health_score error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      console.error(`❌ Socket error from ${socket.id}:`, error);
    });
  });
}

function setDemoData(data) {
  demoData = data;
}

function getDemoData() {
  return demoData;
}

module.exports = {
  initializeSocket,
  setDemoData,
  getDemoData
};
