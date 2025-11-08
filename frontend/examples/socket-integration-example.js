/**
 * EXAMPLE: Socket.IO Integration in Main Dashboard
 * Copy this pattern to your pages/index.js or app/page.tsx
 */

import { useState, useEffect } from 'react';
import useSocket from '@/hooks/useSocket';
import { useNotifications, NotificationContainer } from '@/hooks/useNotifications';
import { setupSocketListeners, cleanupSocketListeners, socketEmitters } from '@/lib/socketEvents';

// Import your components
// import Header from '@/components/Header';
// import TaskBoard from '@/components/TaskBoard';
// import Chat from '@/components/Chat';
// import Heatmap from '@/components/Heatmap';
// import BlockerDashboard from '@/components/BlockerDashboard';
// import DecisionLog from '@/components/DecisionLog';
// import HealthScore from '@/components/HealthScore';

export default function DashboardPage() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  // Socket.IO hook
  const { socket, connectionStatus, statusDisplay, isConnected } = useSocket();

  // Notification system
  const { notifications, showNotification, removeNotification } = useNotifications();

  // Component states
  const [chatMessages, setChatMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [blockers, setBlockers] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [healthScore, setHealthScore] = useState({
    score: 0,
    status: 'unknown',
    message: '',
    trend: 'stable',
  });

  // Setup Socket.IO listeners
  useEffect(() => {
    if (!socket) return;

    const setters = {
      setChatMessages,
      setTasks,
      setContributions,
      setBlockers,
      setDecisions,
      setHealthScore,
      showNotification,
    };

    setupSocketListeners(socket, setters);

    // Cleanup on unmount
    return () => {
      cleanupSocketListeners(socket);
    };
  }, [socket, showNotification]);

  // Request initial health score on mount
  useEffect(() => {
    if (socket && isConnected) {
      socketEmitters.requestHealthScore(socket);
    }
  }, [socket, isConnected]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    
    // Update HTML attribute for CSS
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', darkMode ? 'light' : 'dark');
    }
  };

  // Example: Send a chat message
  const handleSendMessage = (text) => {
    if (!socket || !isConnected) {
      showNotification({
        type: 'error',
        message: '🔴 Cannot send message - not connected',
        duration: 3000,
      });
      return;
    }

    const author = 'Current User'; // Replace with actual user
    socketEmitters.sendMessage(socket, author, text);
  };

  // Example: Update task progress
  const handleTaskProgressChange = (taskId, newProgress) => {
    if (!socket || !isConnected) {
      showNotification({
        type: 'error',
        message: '🔴 Cannot update task - not connected',
        duration: 3000,
      });
      return;
    }

    const task = tasks.find((t) => t.id === taskId);
    socketEmitters.updateTaskProgress(socket, taskId, newProgress, task?.assigned_to);
  };

  // Example: Update task status
  const handleTaskStatusChange = (taskId, newStatus) => {
    if (!socket || !isConnected) {
      showNotification({
        type: 'error',
        message: '🔴 Cannot update task - not connected',
        duration: 3000,
      });
      return;
    }

    const task = tasks.find((t) => t.id === taskId);
    socketEmitters.updateTaskStatus(socket, taskId, newStatus, task?.status);
  };

  // Example: Submit task for AI analysis
  const handleTaskSubmit = (taskId) => {
    if (!socket || !isConnected) {
      showNotification({
        type: 'error',
        message: '🔴 Cannot submit task - not connected',
        duration: 3000,
      });
      return;
    }

    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      socketEmitters.submitTask(socket, task);
    }
  };

  // Example: Report blocker
  const handleReportBlocker = (blocker, severity) => {
    if (!socket || !isConnected) {
      showNotification({
        type: 'error',
        message: '🔴 Cannot report blocker - not connected',
        duration: 3000,
      });
      return;
    }

    socketEmitters.reportBlocker(socket, blocker, severity);
  };

  // Example: Log decision
  const handleLogDecision = (decision, impact) => {
    if (!socket || !isConnected) {
      showNotification({
        type: 'error',
        message: '🔴 Cannot log decision - not connected',
        duration: 3000,
      });
      return;
    }

    socketEmitters.logDecision(socket, decision, impact);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: darkMode ? '#0f172a' : '#f8fafc',
        color: darkMode ? '#f1f5f9' : '#0f172a',
      }}
    >
      {/* Notification Container */}
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
        darkMode={darkMode}
      />

      {/* Connection Status Indicator */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: darkMode ? '#1e293b' : 'white',
          padding: '12px 20px',
          borderRadius: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 500,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isConnected ? '#10b981' : '#ef4444',
            animation: isConnected ? 'pulse 2s infinite' : 'none',
          }}
        />
        {statusDisplay}
      </div>

      {/* Your Components Go Here */}
      <div style={{ padding: '20px' }}>
        {/* Example Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            color: 'white',
          }}
        >
          <h1 style={{ margin: 0 }}>TaskMuse Dashboard</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.9 }}>
            Real-time Collaboration Platform
          </p>
          <button
            onClick={toggleDarkMode}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        {/* Example: Component Integration Points */}
        {/* 
        <Header 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode}
          healthScore={healthScore}
          connectionStatus={connectionStatus}
        />
        
        <TaskBoard
          darkMode={darkMode}
          tasks={tasks}
          onProgressChange={handleTaskProgressChange}
          onStatusChange={handleTaskStatusChange}
          onTaskSubmit={handleTaskSubmit}
        />
        
        <Chat
          darkMode={darkMode}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
        />
        
        <Heatmap
          darkMode={darkMode}
          contributions={contributions}
        />
        
        <BlockerDashboard
          darkMode={darkMode}
          blockers={blockers}
          onReportBlocker={handleReportBlocker}
        />
        
        <DecisionLog
          darkMode={darkMode}
          decisions={decisions}
          onLogDecision={handleLogDecision}
        />
        
        <HealthScore
          darkMode={darkMode}
          score={healthScore.score}
          status={healthScore.status}
          trend={healthScore.trend}
        />
        */}

        {/* Debug Panel (Remove in production) */}
        <div
          style={{
            marginTop: '20px',
            padding: '20px',
            background: darkMode ? '#1e293b' : 'white',
            borderRadius: '12px',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
          }}
        >
          <h3>Socket.IO Debug Info</h3>
          <p>Connection Status: {statusDisplay}</p>
          <p>Chat Messages: {chatMessages.length}</p>
          <p>Tasks: {tasks.length}</p>
          <p>Blockers: {blockers.length}</p>
          <p>Decisions: {decisions.length}</p>
          <p>Health Score: {healthScore.score}%</p>
          
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleSendMessage('Test message from UI')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Test Send Message
            </button>
            
            <button
              onClick={() => socketEmitters.requestHealthScore(socket)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#10b981',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Refresh Health Score
            </button>
            
            <button
              onClick={() => handleReportBlocker({ title: 'Test Blocker' }, 'high')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#ef4444',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Test Report Blocker
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
