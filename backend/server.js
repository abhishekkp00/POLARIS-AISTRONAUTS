const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-taskmuse-2025';
const JWT_EXPIRES_IN = '7d';

// ===========================
// IN-MEMORY DATABASE
// ===========================

// Pre-hash passwords for demo users
const demoPasswordHash = bcrypt.hashSync('password123', 10);

const database = {
  users: [
    {
      id: 'u1',
      email: 'priya@taskmuse.com',
      passwordHash: demoPasswordHash,
      name: 'Priya Sharma',
      role: 'PM',
      createdAt: '2025-11-08T10:00:00Z'
    },
    {
      id: 'u2',
      email: 'rahul@taskmuse.com',
      passwordHash: demoPasswordHash,
      name: 'Rahul Kumar',
      role: 'Developer',
      createdAt: '2025-11-08T10:00:00Z'
    },
    {
      id: 'u3',
      email: 'demo@taskmuse.com',
      passwordHash: demoPasswordHash,
      name: 'Demo User',
      role: 'Team Lead',
      createdAt: '2025-11-08T10:00:00Z'
    }
  ],
  tasks: [],
  messages: [],
  decisions: [],
  blockers: []
};

// User ID counter for new signups
let userIdCounter = 4;

// ===========================
// UTILITY FUNCTIONS
// ===========================

// Generate JWT token
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize user (remove password hash)
const sanitizeUser = (user) => {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
};

// ===========================
// AUTH MIDDLEWARE
// ===========================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - No token provided'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid or expired token'
      });
    }

    // Find user in database
    const user = database.users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - User not found'
      });
    }

    req.user = sanitizeUser(user);
    next();
  });
};

// ===========================
// HEALTH CHECK
// ===========================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// ===========================
// AUTH ROUTES
// ===========================

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validation
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Name must be at least 2 characters'
      });
    }

    // Check if user already exists
    const existingUser = database.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: `u${userIdCounter++}`,
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name.trim(),
      role: role || 'Team Member',
      createdAt: new Date().toISOString()
    };

    // Save to database
    database.users.push(newUser);

    // Generate JWT token
    const token = generateToken(newUser);

    // Return success
    res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(newUser),
        token,
        expiresIn: JWT_EXPIRES_IN
      }
    });

  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error during signup'
    });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user by email
    const user = database.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return success
    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        token,
        expiresIn: JWT_EXPIRES_IN
      }
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error during login'
    });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  // This endpoint is here for consistency and future session management
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

// ===========================
// TASK ROUTES (Protected)
// ===========================

// GET /api/tasks - Get all tasks
app.get('/api/tasks', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: database.tasks
  });
});

// POST /api/tasks - Create new task
app.post('/api/tasks', authenticateToken, (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Task title is required'
      });
    }

    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      assignedTo: assignedTo || req.user.id,
      createdBy: req.user.id,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    database.tasks.push(newTask);

    // Emit Socket.io event
    io.emit('task:created', newTask);

    res.status(201).json({
      success: true,
      data: newTask
    });
  } catch (error) {
    console.error('Create task error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create task'
    });
  }
});

// PUT /api/tasks/:id - Update task
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const taskIndex = database.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const updatedTask = {
      ...database.tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    database.tasks[taskIndex] = updatedTask;

    // Emit Socket.io event
    io.emit('task:updated', updatedTask);

    res.json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const taskIndex = database.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const deletedTask = database.tasks[taskIndex];
    database.tasks.splice(taskIndex, 1);

    // Emit Socket.io event
    io.emit('task:deleted', { id });

    res.json({
      success: true,
      data: deletedTask
    });
  } catch (error) {
    console.error('Delete task error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    });
  }
});

// ===========================
// MESSAGE ROUTES (Protected)
// ===========================

// GET /api/messages - Get all messages
app.get('/api/messages', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: database.messages
  });
});

// POST /api/messages - Send message
app.post('/api/messages', authenticateToken, (req, res) => {
  try {
    const { content, channel } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: content.trim(),
      channel: channel || 'general',
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      timestamp: new Date().toISOString()
    };

    database.messages.push(newMessage);

    // Emit Socket.io event
    io.emit('message:new', newMessage);

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// ===========================
// ANALYTICS ROUTES (Protected)
// ===========================

// GET /api/analytics/overview
app.get('/api/analytics/overview', authenticateToken, (req, res) => {
  try {
    const totalTasks = database.tasks.length;
    const completedTasks = database.tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = database.tasks.filter(t => t.status === 'in-progress').length;
    const todoTasks = database.tasks.filter(t => t.status === 'todo').length;
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        completionRate: Math.round(completionRate * 10) / 10,
        totalUsers: database.users.length,
        totalMessages: database.messages.length
      }
    });
  } catch (error) {
    console.error('Analytics error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

// ===========================
// BLOCKER ROUTES (Protected)
// ===========================

// GET /api/blockers - Get all blockers
app.get('/api/blockers', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: database.blockers
  });
});

// POST /api/blockers - Create blocker
app.post('/api/blockers', authenticateToken, (req, res) => {
  try {
    const { title, description, severity, taskId } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Blocker title is required'
      });
    }

    const newBlocker = {
      id: `blocker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description || '',
      severity: severity || 'medium',
      taskId: taskId || null,
      reportedBy: req.user.id,
      status: 'open',
      createdAt: new Date().toISOString(),
      resolvedAt: null
    };

    database.blockers.push(newBlocker);

    // Emit Socket.io event
    io.emit('blocker:created', newBlocker);

    res.status(201).json({
      success: true,
      data: newBlocker
    });
  } catch (error) {
    console.error('Create blocker error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create blocker'
    });
  }
});

// ===========================
// DECISION LOG ROUTES (Protected)
// ===========================

// GET /api/decisions - Get all decisions
app.get('/api/decisions', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: database.decisions
  });
});

// POST /api/decisions - Log decision
app.post('/api/decisions', authenticateToken, (req, res) => {
  try {
    const { title, description, impact, alternatives } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Decision title is required'
      });
    }

    const newDecision = {
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description || '',
      impact: impact || 'medium',
      alternatives: alternatives || [],
      madeBy: req.user.id,
      makerName: req.user.name,
      createdAt: new Date().toISOString()
    };

    database.decisions.push(newDecision);

    // Emit Socket.io event
    io.emit('decision:logged', newDecision);

    res.status(201).json({
      success: true,
      data: newDecision
    });
  } catch (error) {
    console.error('Log decision error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to log decision'
    });
  }
});

// ===========================
// SOCKET.IO EVENTS
// ===========================

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Join user to their room
  socket.on('join', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle typing indicators
  socket.on('typing:start', (data) => {
    socket.broadcast.emit('typing:start', data);
  });

  socket.on('typing:stop', (data) => {
    socket.broadcast.emit('typing:stop', data);
  });

  // Handle task updates
  socket.on('task:update', (task) => {
    socket.broadcast.emit('task:updated', task);
  });

  // Handle message events
  socket.on('message:send', (message) => {
    io.emit('message:new', message);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// ===========================
// ERROR HANDLING MIDDLEWARE
// ===========================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===========================
// START SERVER
// ===========================

server.listen(PORT, () => {
  console.log('\n🚀 ===================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.IO ready for connections`);
  console.log('===================================\n');
  
  console.log('📝 Demo Users:');
  console.log('  Email: priya@taskmuse.com | Password: password123');
  console.log('  Email: rahul@taskmuse.com | Password: password123');
  console.log('  Email: demo@taskmuse.com  | Password: password123\n');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = { app, io };
