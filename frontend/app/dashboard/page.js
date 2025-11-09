'use client'

import { useState, useEffect } from 'react'
import useAuth from '@/hooks/useAuth'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Chat from '@/components/dashboard/Chat'

// Demo task data
const DEMO_TASKS = [
  { id: 1, title: 'Design user authentication flow', status: 'backlog', assignee: 'Sarah', priority: 'high', progress: 0, deadline: '2025-11-15' },
  { id: 2, title: 'Implement JWT authentication', status: 'backlog', assignee: 'Priya', priority: 'high', progress: 0, deadline: '2025-11-16' },
  { id: 3, title: 'Create dashboard mockups', status: 'backlog', assignee: 'David', priority: 'medium', progress: 0, deadline: '2025-11-18' },
  { id: 4, title: 'Set up Socket.io real-time', status: 'in-progress', assignee: 'Rahul', priority: 'high', progress: 65, deadline: '2025-11-12' },
  { id: 5, title: 'Build task board component', status: 'in-progress', assignee: 'Sarah', priority: 'high', progress: 80, deadline: '2025-11-13' },
  { id: 6, title: 'API endpoints for tasks', status: 'in-progress', assignee: 'Priya', priority: 'medium', progress: 45, deadline: '2025-11-14' },
  { id: 7, title: 'Design system setup', status: 'in-progress', assignee: 'David', priority: 'medium', progress: 50, deadline: '2025-11-14' },
  { id: 8, title: 'Code review: Auth module', status: 'review', assignee: 'Rahul', priority: 'high', progress: 100, deadline: '2025-11-11' },
  { id: 9, title: 'Test Socket.io connections', status: 'review', assignee: 'Sarah', priority: 'medium', progress: 100, deadline: '2025-11-11' },
  { id: 10, title: 'Landing page design', status: 'done', assignee: 'David', priority: 'low', progress: 100, deadline: '2025-11-08' },
  { id: 11, title: 'Database schema', status: 'done', assignee: 'Priya', priority: 'high', progress: 100, deadline: '2025-11-07' },
  { id: 12, title: 'Project kickoff meeting', status: 'done', assignee: 'Rahul', priority: 'medium', progress: 100, deadline: '2025-11-05' },
]

const TEAM_MEMBERS = [
  { name: 'Priya', role: 'PM', performance: 92, online: true, tasks: 5, avatar: '👩‍💼' },
  { name: 'Rahul', role: 'Developer', performance: 88, online: true, tasks: 7, avatar: '👨‍💻' },
  { name: 'Sarah', role: 'Designer', performance: 95, online: false, tasks: 4, avatar: '👩‍🎨' },
  { name: 'David', role: 'Developer', performance: 85, online: true, tasks: 6, avatar: '👨‍💻' },
]

const ACTIVITIES = [
  { user: 'Priya', action: 'completed task', time: '2m ago', icon: '✅' },
  { user: 'Rahul', action: 'moved task to review', time: '5m ago', icon: '🔄' },
  { user: 'Sarah', action: 'started new task', time: '8m ago', icon: '▶️' },
  { user: 'David', action: 'updated design mockup', time: '12m ago', icon: '🎨' },
  { user: 'Priya', action: 'added comment', time: '15m ago', icon: '💬' },
]

function DashboardContent() {
  const { user, logout } = useAuth()
  
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [tasks, setTasks] = useState(DEMO_TASKS)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [currentView, setCurrentView] = useState('dashboard') // dashboard, my-tasks, team-tasks, completed
  const [showNotifications, setShowNotifications] = useState(false)
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    assignee: 'Sarah',
    priority: 'medium',
    status: 'backlog',
    deadline: ''
  })

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
        setRightPanelOpen(false)
      } else {
        setSidebarOpen(true)
        setRightPanelOpen(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  const getTasksByStatus = (status) => {
    let filteredTasks = tasks.filter(t => t.status === status)
    
    // Apply view filters
    if (currentView === 'my-tasks') {
      // Filter to show only current user's tasks (for demo, show Sarah's tasks)
      filteredTasks = filteredTasks.filter(t => t.assignee === 'Sarah')
    } else if (currentView === 'completed') {
      // Only show completed tasks
      return tasks.filter(t => t.status === 'done')
    }
    
    return filteredTasks
  }

  const taskCounts = {
    backlog: getTasksByStatus('backlog').length,
    inProgress: getTasksByStatus('in-progress').length,
    review: getTasksByStatus('review').length,
    done: getTasksByStatus('done').length,
  }

  const moveTask = (taskId, newStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
  }

  const updateTaskProgress = (taskId, progress) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, progress } : t))
  }

  const handleCreateTask = () => {
    if (!newTaskData.title.trim()) {
      alert('Please enter a task title')
      return
    }
    
    const newTask = {
      id: tasks.length + 1,
      title: newTaskData.title,
      status: newTaskData.status,
      assignee: newTaskData.assignee,
      priority: newTaskData.priority,
      progress: 0,
      deadline: newTaskData.deadline || new Date().toISOString().split('T')[0]
    }
    
    setTasks([...tasks, newTask])
    setShowNewTaskModal(false)
    setNewTaskData({
      title: '',
      assignee: 'Sarah',
      priority: 'medium',
      status: 'backlog',
      deadline: ''
    })
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* HEADER */}
      <header className={`h-20 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-b px-6 flex items-center justify-between sticky top-0 z-50`}>
        {/* Left */}
        <div className="flex items-center gap-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
            <span className="text-2xl">☰</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">✨ TaskMuse</h1>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <span>🚀 Mobile App Launch</span>
              <span>•</span>
              <span>Home &gt; Dashboard</span>
            </div>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden md:block flex-1 max-w-md mx-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 pl-10 rounded-lg ${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <span className="absolute left-3 top-2.5">🔍</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative">
              <span className="text-2xl">🔔</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
            </button>
            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-xl border ${darkMode ? 'border-slate-700' : 'border-gray-200'} py-2 z-50`}>
                <div className="px-4 py-2 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}">
                  <p className="font-semibold">Notifications</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer">
                    <p className="text-sm font-medium">New task assigned</p>
                    <p className="text-xs text-gray-500">Sarah assigned you &ldquo;Code review: Auth module&rdquo;</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer">
                    <p className="text-sm font-medium">Task completed</p>
                    <p className="text-xs text-gray-500">Mike completed &ldquo;Database schema&rdquo;</p>
                    <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer">
                    <p className="text-sm font-medium">Deadline approaching</p>
                    <p className="text-xs text-gray-500">&ldquo;Design user authentication flow&rdquo; due tomorrow</p>
                    <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                  </div>
                </div>
                <div className="px-4 py-2 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}">
                  <button className="text-sm text-blue-500 hover:underline">View all notifications</button>
                </div>
              </div>
            )}
          </div>
          
          <button onClick={() => setDarkMode(!darkMode)} className="text-2xl">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user?.name?.[0] || 'U'}
              </div>
            </button>
            {showUserMenu && (
              <div className={`absolute right-0 mt-2 w-64 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-xl border ${darkMode ? 'border-slate-700' : 'border-gray-200'} py-2`}>
                <div className="px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}">
                  <p className="font-semibold">{user?.name || 'User'}</p>
                  <p className="text-sm text-gray-500">{user?.email || ''}</p>
                </div>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700">Settings</button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700">Profile</button>
                <button onClick={handleLogout} className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 text-red-500">Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* SIDEBAR */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-r transition-all duration-300 overflow-hidden sticky top-20 h-[calc(100vh-5rem)]`}>
          <div className="p-6">
            {/* Navigation */}
            <nav className="space-y-1 mb-8">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${
                  currentView === 'dashboard' 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>📊</span> Dashboard
              </button>
              <button 
                onClick={() => setCurrentView('my-tasks')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${
                  currentView === 'my-tasks' 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>✓</span> My Tasks
              </button>
              <button 
                onClick={() => setCurrentView('team-tasks')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${
                  currentView === 'team-tasks' 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>👥</span> Team Tasks
              </button>
              <button 
                onClick={() => setCurrentView('completed')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${
                  currentView === 'completed' 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>✔️</span> Completed
              </button>
            </nav>

            {/* Quick Stats */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-3 text-gray-500">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pending</span>
                  <span className="font-semibold text-gray-400">{taskCounts.backlog}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>In Progress</span>
                  <span className="font-semibold text-blue-500">{taskCounts.inProgress}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>In Review</span>
                  <span className="font-semibold text-purple-500">{taskCounts.review}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span className="font-semibold text-green-500">{taskCounts.done}</span>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-500">Team Members</h3>
              <div className="space-y-2">
                {TEAM_MEMBERS.map((member, idx) => (
                  <button key={idx} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
                    <span className="text-2xl">{member.avatar}</span>
                    <div className="flex-1 text-left text-sm">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${member.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6">
          {/* View Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              {currentView === 'dashboard' && 'Dashboard'}
              {currentView === 'my-tasks' && 'My Tasks'}
              {currentView === 'team-tasks' && 'Team Tasks'}
              {currentView === 'completed' && 'Completed Tasks'}
            </h2>
            <p className="text-gray-500 text-sm">
              {currentView === 'dashboard' && 'Overview of all tasks and activities'}
              {currentView === 'my-tasks' && 'Tasks assigned to you'}
              {currentView === 'team-tasks' && 'All team tasks'}
              {currentView === 'completed' && 'Successfully completed tasks'}
            </p>
          </div>

          {/* Completed View - List Format */}
          {currentView === 'completed' && (
            <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6`}>
              <div className="space-y-3">
                {tasks.filter(t => t.status === 'done').map(task => (
                  <div key={task.id} className={`${darkMode ? 'bg-slate-700' : 'bg-gray-50'} p-4 rounded-lg flex items-center justify-between hover:shadow-lg transition-all cursor-pointer`} onClick={() => { setSelectedTask(task); setShowTaskModal(true); }}>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">✅</span>
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs">{TEAM_MEMBERS.find(m => m.name === task.assignee)?.avatar}</span>
                          <span className="text-xs text-gray-500">{task.assignee}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">Completed</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-3 py-1 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-600' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-500">📅 {task.deadline}</span>
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status === 'done').length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <span className="text-6xl mb-4 block">🎉</span>
                    <p>No completed tasks yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kanban Board - Dashboard, My Tasks, Team Tasks */}
          {currentView !== 'completed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Backlog Column */}
            <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <span>⏳</span> Backlog
                </h3>
                <span className="text-sm text-gray-500">{taskCounts.backlog} tasks</span>
              </div>
              <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {getTasksByStatus('backlog').map(task => (
                  <div key={task.id} className={`${darkMode ? 'bg-slate-700' : 'bg-gray-50'} p-3 rounded-lg cursor-pointer hover:shadow-lg transition-all`} onClick={() => { setSelectedTask(task); setShowTaskModal(true); }}>
                    <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs">{TEAM_MEMBERS.find(m => m.name === task.assignee)?.avatar}</span>
                      <span className="text-xs text-gray-500">{task.assignee}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-600' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-500">📅 {task.deadline}</span>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => setShowNewTaskModal(true)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500"
                >
                  + Add Task
                </button>
              </div>
            </div>

            {/* In Progress Column */}
            <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <span>🔄</span> In Progress
                </h3>
                <span className="text-sm text-gray-500">{taskCounts.inProgress} tasks</span>
              </div>
              <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {getTasksByStatus('in-progress').map(task => (
                  <div key={task.id} className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} p-3 rounded-lg cursor-pointer hover:shadow-lg transition-all`} onClick={() => { setSelectedTask(task); setShowTaskModal(true); }}>
                    <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs">{TEAM_MEMBERS.find(m => m.name === task.assignee)?.avatar}</span>
                      <span className="text-xs text-gray-500">{task.assignee}</span>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${task.progress}%` }}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-600' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-500">📅 {task.deadline}</span>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => setShowNewTaskModal(true)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500"
                >
                  + Add Task
                </button>
              </div>
            </div>

            {/* Review Column */}
            <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <span>✅</span> In Review
                </h3>
                <span className="text-sm text-gray-500">{taskCounts.review} tasks</span>
              </div>
              <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {getTasksByStatus('review').map(task => (
                  <div key={task.id} className={`${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'} p-3 rounded-lg cursor-pointer hover:shadow-lg transition-all`} onClick={() => { setSelectedTask(task); setShowTaskModal(true); }}>
                    <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs">{TEAM_MEMBERS.find(m => m.name === task.assignee)?.avatar}</span>
                      <span className="text-xs text-gray-500">{task.assignee}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-600' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-500">📅 {task.deadline}</span>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => setShowNewTaskModal(true)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500"
                >
                  + Add Task
                </button>
              </div>
            </div>

            {/* Done Column */}
            <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <span>✔️</span> Done
                </h3>
                <span className="text-sm text-gray-500">{taskCounts.done} tasks</span>
              </div>
              <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {getTasksByStatus('done').map(task => (
                  <div key={task.id} className={`${darkMode ? 'bg-green-900/30' : 'bg-green-50'} p-3 rounded-lg cursor-pointer hover:shadow-lg transition-all`} onClick={() => { setSelectedTask(task); setShowTaskModal(true); }}>
                    <h4 className="font-medium text-sm mb-2 line-through opacity-75">{task.title}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs">{TEAM_MEMBERS.find(m => m.name === task.assignee)?.avatar}</span>
                      <span className="text-xs text-gray-500">{task.assignee}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-600">
                        Completed
                      </span>
                      <span className="text-xs text-gray-500">📅 {task.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}
        </main>

        {/* RIGHT PERFORMANCE PANEL */}
        <aside className={`${rightPanelOpen ? 'w-96' : 'w-0'} ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-l transition-all duration-300 overflow-hidden sticky top-20 h-[calc(100vh-5rem)]`}>
          <div className="p-6 overflow-y-auto h-full">
            {/* Project Health */}
            <div className={`${darkMode ? 'bg-slate-700' : 'bg-gradient-to-br from-green-50 to-blue-50'} rounded-lg p-6 mb-6`}>
              <h3 className="font-semibold mb-4">Project Health</h3>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-300" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={`${85 * 3.51} 351`} className="text-green-500" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold">85</span>
                    <span className="text-xs text-gray-500">/ 100</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-green-600">🟢 All systems go!</p>
                <p className="text-sm text-gray-500">⬆️ Improving</p>
              </div>
            </div>

            {/* Team Performance */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Team Performance</h3>
              <div className="space-y-3">
                {TEAM_MEMBERS.map((member, idx) => (
                  <div key={idx} className={`${darkMode ? 'bg-slate-700' : 'bg-gray-50'} p-3 rounded-lg`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{member.avatar}</span>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.tasks} tasks</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${member.performance >= 90 ? 'text-green-500' : member.performance >= 85 ? 'text-blue-500' : 'text-yellow-500'}`}>
                        {member.performance}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${member.performance >= 90 ? 'bg-green-500' : member.performance >= 85 ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{ width: `${member.performance}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {ACTIVITIES.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-lg">{activity.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-gray-500"> {activity.action}</span>
                      </p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Mentor Assistant */}
            <div className="mb-6">
              <div className={`${darkMode ? 'bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'} border-2 rounded-lg p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🧠</span>
                  <h3 className="font-semibold">AI Mentor</h3>
                  <span className="ml-auto text-xs bg-purple-500 text-white px-2 py-1 rounded-full">BETA</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Your intelligent project assistant
                </p>
                <div className="space-y-2">
                  <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-white'} p-3 rounded-lg`}>
                    <div className="flex items-start gap-2">
                      <span className="text-lg">💡</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">Suggestion</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Consider reviewing the &ldquo;Auth module&rdquo; task - it&apos;s been in review for 3 days.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-white'} p-3 rounded-lg`}>
                    <div className="flex items-start gap-2">
                      <span className="text-lg">⚡</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">Quick Win</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Sarah has bandwidth - assign her &ldquo;Build task board&rdquo; to speed up delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-white'} p-3 rounded-lg`}>
                    <div className="flex items-start gap-2">
                      <span className="text-lg">🎯</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">Focus Area</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          High priority tasks need attention - 3 items overdue this week.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-3 bg-purple-500 hover:bg-purple-600 text-white text-sm py-2 rounded-lg transition-colors">
                  Ask AI Mentor
                </button>
              </div>
            </div>

            {/* Chat Component */}
            <div>
              <Chat darkMode={darkMode} isConnected={true} />
            </div>
          </div>
        </aside>

        {/* Toggle Right Panel Button (Tablet) */}
        <button
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="fixed right-4 top-24 lg:hidden bg-blue-500 text-white p-2 rounded-full shadow-lg z-50"
        >
          {rightPanelOpen ? '→' : '←'}
        </button>
      </div>

      {/* Task Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTaskModal(false)}>
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedTask.title}</h2>
              <button onClick={() => setShowTaskModal(false)} className="text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Assignee</label>
                <p className="font-medium">{selectedTask.assignee}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Priority</label>
                <p className="font-medium capitalize">{selectedTask.priority}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Deadline</label>
                <p className="font-medium">{selectedTask.deadline}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-2 block">Progress: {selectedTask.progress}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedTask.progress}
                  onChange={(e) => updateTaskProgress(selectedTask.id, parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-2 block">Status</label>
                <select
                  value={selectedTask.status}
                  onChange={(e) => moveTask(selectedTask.id, e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="backlog">Backlog</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowNewTaskModal(false)}>
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full mx-4`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create New Task</h2>
              <button onClick={() => setShowNewTaskModal(false)} className="text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Task Title *</label>
                <input
                  type="text"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
                  placeholder="Enter task title..."
                  className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Assign To</label>
                <select
                  value={newTaskData.assignee}
                  onChange={(e) => setNewTaskData({...newTaskData, assignee: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="Sarah">Sarah</option>
                  <option value="Mike">Mike</option>
                  <option value="Alex">Alex</option>
                  <option value="Lisa">Lisa</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Priority</label>
                <select
                  value={newTaskData.priority}
                  onChange={(e) => setNewTaskData({...newTaskData, priority: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Status</label>
                <select
                  value={newTaskData.status}
                  onChange={(e) => setNewTaskData({...newTaskData, status: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="backlog">Backlog</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Deadline</label>
                <input
                  type="date"
                  value={newTaskData.deadline}
                  onChange={(e) => setNewTaskData({...newTaskData, deadline: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg ${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateTask}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Task
                </button>
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
