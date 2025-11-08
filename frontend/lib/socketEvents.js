/**
 * Socket.IO Event Integration
 * Setup all event listeners and emitters for real-time updates
 */

/**
 * Setup all Socket.IO event listeners
 * Call this function in your main page component (pages/index.js or app/page.tsx)
 * 
 * @param {Object} socket - Socket.IO instance from useSocket hook
 * @param {Object} setters - State setter functions
 */
export function setupSocketListeners(socket, setters) {
  if (!socket || !socket.on) {
    console.warn('⚠️ Socket not available for listener setup');
    return;
  }

  const {
    setChatMessages,
    setTasks,
    setContributions,
    setBlockers,
    setDecisions,
    setHealthScore,
    showNotification,
  } = setters;

  // 1. RECEIVE MESSAGE
  socket.on('receive_message', (data) => {
    const { author, text, timestamp, analysis } = data;
    
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        author,
        text,
        timestamp: timestamp || new Date().toISOString(),
        analysis: analysis || null,
      },
    ]);

    // Show notification
    if (showNotification) {
      showNotification({
        type: 'info',
        message: `New message from ${author}`,
        duration: 3000,
      });
    }

    // Auto-scroll will be handled by useEffect in Chat component
    console.log('💬 Message received:', { author, text });
  });

  // 2. TASK PROGRESS UPDATED
  socket.on('task_progress_updated', (data) => {
    const { taskId, newProgress } = data;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          // Check if completed (100%)
          const isCompleted = newProgress === 100;
          
          // Show celebration if completed
          if (isCompleted && showNotification) {
            showNotification({
              type: 'success',
              message: `🎉 Task "${task.title}" completed!`,
              duration: 4000,
            });
          } else if (showNotification) {
            showNotification({
              type: 'info',
              message: `✅ ${task.title}: ${newProgress}% complete`,
              duration: 3000,
            });
          }

          return {
            ...task,
            progress: newProgress,
            status: isCompleted ? 'completed' : task.status,
          };
        }
        return task;
      })
    );

    console.log('📊 Task progress updated:', { taskId, newProgress });
  });

  // 3. TASK UPDATED (Status change)
  socket.on('task_updated', (data) => {
    const { taskId, newStatus, assignedTo } = data;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          if (showNotification) {
            showNotification({
              type: 'info',
              message: `Task moved to ${newStatus}`,
              duration: 3000,
            });
          }

          return {
            ...task,
            status: newStatus,
            assigned_to: assignedTo || task.assigned_to,
          };
        }
        return task;
      })
    );

    console.log('🔄 Task updated:', { taskId, newStatus });
  });

  // 4. AI SUGGESTION READY
  socket.on('ai_suggestion_ready', (data) => {
    const { taskId, suggestion } = data;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          if (showNotification) {
            showNotification({
              type: 'info',
              message: `🤖 AI suggestion ready for "${task.title}"`,
              duration: 4000,
            });
          }

          return {
            ...task,
            aiSuggestion: suggestion,
          };
        }
        return task;
      })
    );

    console.log('🤖 AI suggestion ready:', { taskId, suggestion });
  });

  // 5. HEATMAP UPDATED
  socket.on('heatmap_updated', (data) => {
    const { contributions } = data;

    setContributions(contributions);

    if (showNotification) {
      showNotification({
        type: 'info',
        message: '📊 Contribution data updated',
        duration: 2000,
      });
    }

    console.log('📊 Heatmap updated:', contributions);
  });

  // 6. BLOCKER ALERT
  socket.on('blocker_alert', (data) => {
    const { blocker, from, severity, timestamp } = data;

    setBlockers((prev) => [
      {
        id: Date.now(),
        title: blocker.title || blocker,
        description: blocker.description || '',
        severity: severity || 'medium',
        from: from,
        timestamp: timestamp || new Date().toISOString(),
        status: 'open',
      },
      ...prev,
    ]);

    // Show urgent notification
    if (showNotification) {
      const severityEmoji = severity === 'high' ? '🚨' : severity === 'medium' ? '⚠️' : '⚡';
      showNotification({
        type: 'error',
        message: `${severityEmoji} ${severity?.toUpperCase() || 'MEDIUM'} BLOCKER: ${blocker.title || blocker}`,
        duration: severity === 'high' ? 6000 : 4000,
        sound: severity === 'high', // Optional: play sound for high severity
      });
    }

    console.log('🚨 Blocker alert:', { blocker, from, severity });
  });

  // 7. DECISION LOGGED
  socket.on('decision_logged', (data) => {
    const { decision, by, timestamp, impact } = data;

    setDecisions((prev) => [
      {
        id: Date.now(),
        title: decision.title || decision,
        description: decision.description || '',
        by: by,
        timestamp: timestamp || new Date().toISOString(),
        impact: impact || 'technical',
        status: 'approved',
      },
      ...prev,
    ]);

    if (showNotification) {
      showNotification({
        type: 'success',
        message: `✅ Decision logged: ${decision.title || decision}`,
        duration: 3000,
      });
    }

    console.log('✅ Decision logged:', { decision, by });
  });

  // 8. HEALTH SCORE UPDATED
  socket.on('health_score_updated', (data) => {
    const { score, status, message, trend } = data;

    setHealthScore({
      score,
      status: status || (score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical'),
      message: message || '',
      trend: trend || 'stable',
      lastUpdated: new Date().toISOString(),
    });

    // Show celebration if improved significantly
    if (trend === 'improving' && showNotification) {
      showNotification({
        type: 'success',
        message: `✨ Health score improved to ${score}%!`,
        duration: 4000,
      });
    }

    console.log('❤️ Health score updated:', { score, status, trend });
  });

  console.log('✅ All Socket.IO event listeners setup complete');
}

/**
 * Socket.IO Event Emitters
 * Helper functions to emit events to server
 */
export const socketEmitters = {
  // 1. Send chat message
  sendMessage: (socket, author, text) => {
    if (!socket || !socket.emit) return false;
    
    socket.emit('send_message', {
      author,
      text,
      timestamp: new Date().toISOString(),
    });
    
    console.log('📤 Sent message:', { author, text });
    return true;
  },

  // 2. Update task progress
  updateTaskProgress: (socket, taskId, newProgress, assignedTo) => {
    if (!socket || !socket.emit) return false;
    
    socket.emit('task_progress_changed', {
      taskId,
      newProgress,
      assignedTo,
      timestamp: new Date().toISOString(),
    });
    
    console.log('📤 Task progress changed:', { taskId, newProgress });
    return true;
  },

  // 3. Update task status
  updateTaskStatus: (socket, taskId, newStatus, oldStatus) => {
    if (!socket || !socket.emit) return false;
    
    socket.emit('task_status_changed', {
      taskId,
      newStatus,
      oldStatus,
      timestamp: new Date().toISOString(),
    });
    
    console.log('📤 Task status changed:', { taskId, newStatus });
    return true;
  },

  // 4. Submit task for AI analysis
  submitTask: (socket, task) => {
    if (!socket || !socket.emit) return false;
    
    socket.emit('task_submitted', {
      taskId: task.id,
      title: task.title,
      description: task.description,
      progress: task.progress || 100,
      timestamp: new Date().toISOString(),
    });
    
    console.log('📤 Task submitted for AI:', task.title);
    return true;
  },

  // 5. Request health score
  requestHealthScore: (socket) => {
    if (!socket || !socket.emit) return false;
    
    socket.emit('get_health_score', {
      timestamp: new Date().toISOString(),
    });
    
    console.log('📤 Requested health score');
    return true;
  },

  // 6. Report blocker
  reportBlocker: (socket, blocker, severity) => {
    if (!socket || !socket.emit) return false;
    
    socket.emit('blocker_reported', {
      blocker,
      severity: severity || 'medium',
      timestamp: new Date().toISOString(),
    });
    
    console.log('📤 Blocker reported:', blocker);
    return true;
  },

  // 7. Log decision
  logDecision: (socket, decision, impact) => {
    if (!socket || !socket.emit) return false;
    
    socket.emit('decision_made', {
      decision,
      impact: impact || 'technical',
      timestamp: new Date().toISOString(),
    });
    
    console.log('📤 Decision logged:', decision);
    return true;
  },
};

/**
 * Cleanup Socket.IO listeners
 * Call this in useEffect cleanup or component unmount
 */
export function cleanupSocketListeners(socket) {
  if (!socket || !socket.off) {
    console.warn('⚠️ Socket not available for cleanup');
    return;
  }

  const events = [
    'receive_message',
    'task_progress_updated',
    'task_updated',
    'ai_suggestion_ready',
    'heatmap_updated',
    'blocker_alert',
    'decision_logged',
    'health_score_updated',
  ];

  events.forEach((event) => {
    socket.off(event);
  });

  console.log('🔇 All Socket.IO listeners cleaned up');
}

const socketEventHelpers = {
  setupSocketListeners,
  cleanupSocketListeners,
  socketEmitters,
};

export default socketEventHelpers;
