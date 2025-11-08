# Socket.IO Client Integration Guide

Perfect real-time updates for TaskMuse - Impress the judges! 🚀

## 📦 Installation

Socket.IO client is already installed in the project:

```bash
npm install socket.io-client
```

## 🎯 Quick Start

### 1. Import the Hook

```javascript
import useSocket from '@/hooks/useSocket';
```

### 2. Use in Your Component

```javascript
function MyComponent() {
  const { socket, statusDisplay, isConnected, emit, on } = useSocket();
  
  useEffect(() => {
    if (socket && isConnected) {
      // Listen for events
      on('receive_message', (data) => {
        console.log('New message:', data);
      });
    }
  }, [socket, isConnected, on]);
  
  return <div>{statusDisplay}</div>;
}
```

## 🔌 Connection States

The hook provides real-time connection status:

```javascript
const { connectionStatus, statusDisplay, isConnected } = useSocket();

// connectionStatus values:
// - 'connecting': Initial connection or reconnecting
// - 'connected': Successfully connected
// - 'disconnected': Connection lost

// statusDisplay examples:
// - "🟢 Connected"
// - "⏳ Connecting..."
// - "⏳ Reconnecting... (attempt #3)"
// - "🔴 Disconnected"

// isConnected: boolean (true/false)
```

## 📡 Event Listeners (Receiving Events)

### Setup Event Listeners

Use the `setupSocketListeners` helper for automatic event handling:

```javascript
import { setupSocketListeners, cleanupSocketListeners } from '@/lib/socketEvents';

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

  return () => {
    cleanupSocketListeners(socket);
  };
}, [socket]);
```

### Available Events

#### 1. **receive_message**
Triggered when a new chat message is received.

```javascript
// Server sends:
{
  author: "Priya",
  text: "API integration complete!",
  timestamp: "2025-11-08T12:30:00Z",
  analysis: { type: "decision", severity: "medium" }
}

// Your handler:
socket.on('receive_message', (data) => {
  setChatMessages(prev => [...prev, data]);
  showNotification({
    type: 'info',
    message: `New message from ${data.author}`,
  });
});
```

#### 2. **task_progress_updated**
Triggered when task progress changes.

```javascript
// Server sends:
{
  taskId: "task-123",
  newProgress: 75
}

// Your handler:
socket.on('task_progress_updated', (data) => {
  setTasks(prev =>
    prev.map(task =>
      task.id === data.taskId
        ? { ...task, progress: data.newProgress }
        : task
    )
  );
  
  if (data.newProgress === 100) {
    showNotification({
      type: 'success',
      message: '🎉 Task completed!',
    });
  }
});
```

#### 3. **task_updated**
Triggered when task status changes.

```javascript
// Server sends:
{
  taskId: "task-123",
  newStatus: "in_progress",
  assignedTo: "Priya"
}

// Your handler:
socket.on('task_updated', (data) => {
  setTasks(prev =>
    prev.map(task =>
      task.id === data.taskId
        ? { ...task, status: data.newStatus }
        : task
    )
  );
});
```

#### 4. **ai_suggestion_ready**
Triggered when AI generates a suggestion for a task.

```javascript
// Server sends:
{
  taskId: "task-123",
  suggestion: "Consider breaking this into smaller subtasks..."
}

// Your handler:
socket.on('ai_suggestion_ready', (data) => {
  setTasks(prev =>
    prev.map(task =>
      task.id === data.taskId
        ? { ...task, aiSuggestion: data.suggestion }
        : task
    )
  );
  
  showNotification({
    type: 'info',
    message: '🤖 AI suggestion ready!',
  });
});
```

#### 5. **heatmap_updated**
Triggered when contribution data changes.

```javascript
// Server sends:
{
  contributions: [
    { name: "Priya", completed: 8, in_progress: 1, pending: 0, percentage: 95 },
    // ...more contributors
  ]
}

// Your handler:
socket.on('heatmap_updated', (data) => {
  setContributions(data.contributions);
});
```

#### 6. **blocker_alert**
Triggered when a blocker is reported.

```javascript
// Server sends:
{
  blocker: {
    title: "API authentication failing",
    description: "OAuth tokens expired"
  },
  from: "Priya",
  severity: "high", // 'high', 'medium', 'low'
  timestamp: "2025-11-08T12:30:00Z"
}

// Your handler:
socket.on('blocker_alert', (data) => {
  setBlockers(prev => [data, ...prev]);
  
  showNotification({
    type: 'error',
    message: `🚨 ${data.severity.toUpperCase()} BLOCKER: ${data.blocker.title}`,
    duration: 6000,
    sound: data.severity === 'high',
  });
});
```

#### 7. **decision_logged**
Triggered when a decision is logged.

```javascript
// Server sends:
{
  decision: {
    title: "Use PostgreSQL database",
    description: "Better performance for our use case"
  },
  by: "Rahul",
  timestamp: "2025-11-08T12:30:00Z",
  impact: "technical" // 'strategic', 'technical', 'process', 'resource'
}

// Your handler:
socket.on('decision_logged', (data) => {
  setDecisions(prev => [data, ...prev]);
  
  showNotification({
    type: 'success',
    message: `✅ Decision logged: ${data.decision.title}`,
  });
});
```

#### 8. **health_score_updated**
Triggered when project health score changes.

```javascript
// Server sends:
{
  score: 85,
  status: "healthy", // 'healthy', 'warning', 'critical'
  message: "All systems operating normally",
  trend: "improving" // 'improving', 'stable', 'declining'
}

// Your handler:
socket.on('health_score_updated', (data) => {
  setHealthScore(data);
  
  if (data.trend === 'improving') {
    showNotification({
      type: 'success',
      message: `✨ Health score improved to ${data.score}%!`,
    });
  }
});
```

## 📤 Event Emitters (Sending Events)

Use the `socketEmitters` helper for sending events:

```javascript
import { socketEmitters } from '@/lib/socketEvents';
```

### Available Emitters

#### 1. **Send Message**

```javascript
socketEmitters.sendMessage(socket, 'Priya', 'Hello everyone!');

// Sends to server:
{
  author: "Priya",
  text: "Hello everyone!",
  timestamp: "2025-11-08T12:30:00Z"
}
```

#### 2. **Update Task Progress**

```javascript
socketEmitters.updateTaskProgress(socket, 'task-123', 75, 'Priya');

// Sends to server:
{
  taskId: "task-123",
  newProgress: 75,
  assignedTo: "Priya",
  timestamp: "2025-11-08T12:30:00Z"
}
```

#### 3. **Update Task Status**

```javascript
socketEmitters.updateTaskStatus(socket, 'task-123', 'in_progress', 'pending');

// Sends to server:
{
  taskId: "task-123",
  newStatus: "in_progress",
  oldStatus: "pending",
  timestamp: "2025-11-08T12:30:00Z"
}
```

#### 4. **Submit Task for AI Analysis**

```javascript
const task = {
  id: 'task-123',
  title: 'API Integration',
  description: 'Integrate third-party API',
  progress: 100,
};

socketEmitters.submitTask(socket, task);

// Sends to server:
{
  taskId: "task-123",
  title: "API Integration",
  description: "Integrate third-party API",
  progress: 100,
  timestamp: "2025-11-08T12:30:00Z"
}
```

#### 5. **Request Health Score**

```javascript
socketEmitters.requestHealthScore(socket);

// Sends to server:
{
  timestamp: "2025-11-08T12:30:00Z"
}
```

#### 6. **Report Blocker**

```javascript
const blocker = {
  title: 'API authentication failing',
  description: 'OAuth tokens expired',
};

socketEmitters.reportBlocker(socket, blocker, 'high');

// Sends to server:
{
  blocker: { title: "...", description: "..." },
  severity: "high",
  timestamp: "2025-11-08T12:30:00Z"
}
```

#### 7. **Log Decision**

```javascript
const decision = {
  title: 'Use PostgreSQL database',
  description: 'Better performance',
};

socketEmitters.logDecision(socket, decision, 'technical');

// Sends to server:
{
  decision: { title: "...", description: "..." },
  impact: "technical",
  timestamp: "2025-11-08T12:30:00Z"
}
```

## 🔔 Notification System

### Setup Notifications

```javascript
import { useNotifications, NotificationContainer } from '@/hooks/useNotifications';

function MyApp() {
  const { notifications, showNotification, removeNotification } = useNotifications();
  
  return (
    <>
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
        darkMode={darkMode}
      />
      
      {/* Your app content */}
    </>
  );
}
```

### Show Notifications

```javascript
// Success notification
showNotification({
  type: 'success',
  message: '✅ Task completed successfully!',
  duration: 4000,
});

// Error notification
showNotification({
  type: 'error',
  message: '🚨 HIGH BLOCKER: API down',
  duration: 6000,
  sound: true, // Optional: play sound
});

// Warning notification
showNotification({
  type: 'warning',
  message: '⚠️ Deadline approaching',
  duration: 3000,
});

// Info notification
showNotification({
  type: 'info',
  message: 'ℹ️ New message from Priya',
  duration: 3000,
});
```

## 🎭 Judge-Impressing Demos

### Demo 1: Real-time Multi-Tab Sync

1. Open app in 2 browser tabs
2. Send a message in Tab 1
3. Message appears instantly in Tab 2
4. **Result**: Judges see perfect real-time sync

### Demo 2: Auto-Reconnection

1. Disconnect internet
2. App shows "🔴 Disconnected"
3. Reconnect internet
4. App shows "⏳ Reconnecting... (attempt #1)"
5. App shows "✅ Reconnected!"
6. **Result**: Judges see robust error handling

### Demo 3: Smooth Animations

1. Update task progress from 0% → 100%
2. Watch progress bar animate smoothly (500ms)
3. Celebration toast appears: "🎉 Task completed!"
4. **Result**: Judges see polished UX

### Demo 4: Live Health Score

1. Click "Refresh Health Score"
2. Gauge animates from old value to new value
3. Color changes (red → yellow → green)
4. Trend indicator shows ⬆️ or ⬇️
5. **Result**: Judges see real-time analytics

### Demo 5: Blocker Alerts

1. Report a HIGH severity blocker
2. Red notification slides in from right
3. Alert stays for 6 seconds
4. Blocker appears in dashboard immediately
5. **Result**: Judges see instant collaboration

## 🐛 Debugging

### Enable Debug Logs

All Socket.IO events are logged to console:

```
✅ Socket.IO connected: abc123
📤 Emitted 'send_message': { author: "Priya", text: "Hello" }
📥 Received 'receive_message': { author: "Priya", text: "Hello" }
🔄 Reconnection attempt #1...
✅ Reconnected after 1 attempts
```

### Check Connection Status

```javascript
console.log('Connected:', socket.isConnected());
console.log('Status:', socket.connectionStatus);
console.log('Socket ID:', socket.socket?.id);
```

### Test Events Manually

```javascript
// Send test message
socket.emit('send_message', {
  author: 'Test User',
  text: 'Test message',
  timestamp: new Date().toISOString(),
});

// Listen for response
socket.on('receive_message', (data) => {
  console.log('Received:', data);
});
```

## ⚡ Performance Tips

1. **Cleanup Listeners**: Always cleanup in `useEffect` return
2. **Debounce Emits**: Don't spam server with rapid updates
3. **Batch Updates**: Combine multiple state updates
4. **Memoize Callbacks**: Use `useCallback` for event handlers
5. **Error Boundaries**: Wrap Socket components in error boundaries

## 🎯 Production Checklist

- ✅ Auto-reconnection enabled
- ✅ All listeners cleanup properly
- ✅ Error handling in all event handlers
- ✅ User-friendly connection status display
- ✅ Notifications for all important events
- ✅ Smooth animations (300-500ms)
- ✅ Console logs for debugging (remove in production)
- ✅ Multi-tab sync working
- ✅ No memory leaks

## 🚀 Ready to Impress!

Your Socket.IO integration is:
- **Robust**: Auto-reconnects, error handling
- **Smooth**: Animations, notifications
- **Professional**: Clean code, proper cleanup
- **Impressive**: Multi-tab sync, real-time updates

**Now go wow those judges!** 🏆
