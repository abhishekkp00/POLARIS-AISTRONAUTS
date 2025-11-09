'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import useSocket from '@/hooks/useSocket'
import { useNotifications, NotificationContainer } from '@/hooks/useNotifications'
import { setupSocketListeners, cleanupSocketListeners, socketEmitters } from '@/lib/socketEvents'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// Import components
import Header from '@/components/Header'
import TaskBoard from '@/components/TaskBoard'
import Chat from '@/components/Chat'
import Heatmap from '@/components/Heatmap'
import BlockerDashboard from '@/components/BlockerDashboard'
import DecisionLog from '@/components/DecisionLog'
import HealthScore from '@/components/HealthScore'
import Analytics from '@/components/Analytics'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

function DashboardContent() {
  const router = useRouter()
  const { user, logout } = useAuth()
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState(false)

  // Socket.IO hook
  const { socket, isConnected, statusDisplay } = useSocket()

  // Notification system
  const { notifications, showNotification, removeNotification } = useNotifications()

  // Component states
  const [chatMessages, setChatMessages] = useState([])
  const [tasks, setTasks] = useState([])
  const [contributions, setContributions] = useState([])
  const [blockers, setBlockers] = useState([])
  const [decisions, setDecisions] = useState([])
  const [healthScore, setHealthScore] = useState({
    score: 85,
    status: 'healthy',
    message: 'Project health is good',
    trend: 'stable',
  })

  // Setup Socket.IO listeners
  useEffect(() => {
    if (!socket) return

    const setters = {
      setChatMessages,
      setTasks,
      setContributions,
      setBlockers,
      setDecisions,
      setHealthScore,
      showNotification,
    }

    setupSocketListeners(socket, setters)

    // Cleanup on unmount
    return () => {
      cleanupSocketListeners(socket)
    }
  }, [socket, showNotification])

  // Request initial health score on mount
  useEffect(() => {
    if (socket && isConnected) {
      socketEmitters.requestHealthScore(socket)
    }
  }, [socket, isConnected])

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
    
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', darkMode ? 'light' : 'dark')
    }
  }

  // Handle logout
  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  // Send chat message
  const handleSendMessage = (text) => {
    if (!socket || !isConnected) {
      showNotification({
        type: 'error',
        message: '🔴 Cannot send message - not connected',
        duration: 3000,
      })
      return
    }

    const author = user?.name || 'Anonymous'
    socketEmitters.sendMessage(socket, author, text)
  }

  // Update task progress
  const handleTaskProgressChange = (taskId, newProgress) => {
    if (!socket || !isConnected) {
      showNotification({
        type: 'error',
        message: '🔴 Cannot update task - not connected',
        duration: 3000,
      })
      return
    }

    const task = tasks.find((t) => t.id === taskId)
    socketEmitters.updateTaskProgress(socket, taskId, newProgress, task?.assigned_to)
  }

  // Update task status
  const handleTaskStatusChange = (taskId, newStatus) => {
    if (!socket || !isConnected) {
      showNotification({
        type: 'error',
        message: '🔴 Cannot update task - not connected',
        duration: 3000,
      })
      return
    }

    const task = tasks.find((t) => t.id === taskId)
    socketEmitters.updateTaskStatus(socket, taskId, newStatus, task?.status)
  }

  // Report blocker
  const handleReportBlocker = (blocker, severity) => {
    if (!socket || !isConnected) {
      showNotification({
        type: 'error',
        message: '🔴 Cannot report blocker - not connected',
        duration: 3000,
      })
      return
    }

    socketEmitters.reportBlocker(socket, blocker, severity)
  }

  // Log decision
  const handleLogDecision = (decision, impact) => {
    if (!socket || !isConnected) {
      showNotification({
        type: 'error',
        message: '🔴 Cannot log decision - not connected',
        duration: 3000,
      })
      return
    }

    socketEmitters.logDecision(socket, decision, impact)
  }

  return (
    <div
      className="min-h-screen transition-colors"
      style={{
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
        className="fixed bottom-5 left-5 z-50"
        style={{
          background: darkMode ? '#1e293b' : 'white',
          padding: '12px 20px',
          borderRadius: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isConnected ? '#10b981' : '#ef4444',
          }}
        />
        {statusDisplay}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          user={user}
          onLogout={handleLogout}
        />

        {/* Health Score */}
        <div className="mt-6">
          <HealthScore
            darkMode={darkMode}
            score={healthScore.score}
            status={healthScore.status}
            message={healthScore.message}
            trend={healthScore.trend}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Tasks & Analytics */}
          <div className="lg:col-span-2 space-y-6">
            <TaskBoard
              darkMode={darkMode}
              tasks={tasks}
              onProgressChange={handleTaskProgressChange}
              onStatusChange={handleTaskStatusChange}
            />
            
            <Analytics darkMode={darkMode} />
          </div>

          {/* Right Column - Chat & Heatmap */}
          <div className="space-y-6">
            <Chat
              darkMode={darkMode}
              messages={chatMessages}
              onSendMessage={handleSendMessage}
            />
            
            <Heatmap
              darkMode={darkMode}
              contributions={contributions}
            />
          </div>
        </div>

        {/* Bottom Row - Blockers & Decisions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
        </div>
      </div>
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
