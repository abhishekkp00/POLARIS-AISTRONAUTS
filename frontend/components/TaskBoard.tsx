'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Sparkles, User, Calendar, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'completed';
  progress: number;
  deadline: string;
  ai_suggestion?: {
    next: string;
    who: string;
    time: string;
    why: string;
    confidence: number;
  };
}

interface TaskBoardProps {
  darkMode: boolean;
}

export default function TaskBoard({ darkMode }: TaskBoardProps) {
  const { socket } = useSocket();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Database Setup',
      description: 'Set up PostgreSQL database with initial schema',
      assignee: 'Aditya',
      status: 'pending',
      progress: 0,
      deadline: '2025-11-15'
    },
    {
      id: 2,
      title: 'Frontend Auth',
      description: 'Implement authentication flow with OAuth and JWT',
      assignee: 'Priya',
      status: 'in_progress',
      progress: 65,
      deadline: '2025-11-12'
    },
    {
      id: 3,
      title: 'API Integration',
      description: 'Connect frontend to backend REST API endpoints',
      assignee: 'Sarah',
      status: 'in_progress',
      progress: 45,
      deadline: '2025-11-10'
    },
    {
      id: 4,
      title: 'API Setup',
      description: 'Build RESTful API with Express and middleware',
      assignee: 'Rahul',
      status: 'submitted',
      progress: 100,
      deadline: '2025-11-08',
      ai_suggestion: {
        next: 'Sarah should test API endpoints',
        who: 'Sarah',
        time: '2 hours',
        why: 'Unblocks frontend integration',
        confidence: 85
      }
    },
    {
      id: 5,
      title: 'Project Plan',
      description: 'Create comprehensive project roadmap and timeline',
      assignee: 'Priya',
      status: 'completed',
      progress: 100,
      deadline: '2025-11-05'
    },
    {
      id: 6,
      title: 'Research & Design',
      description: 'UI/UX research and design mockups in Figma',
      assignee: 'Rahul',
      status: 'completed',
      progress: 100,
      deadline: '2025-11-06'
    }
  ]);

  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [loadingAI, setLoadingAI] = useState<number | null>(null);
  const [flashingTask, setFlashingTask] = useState<number | null>(null);
  const [celebratingTask, setCelebratingTask] = useState<number | null>(null);
  const [highlightedColumn, setHighlightedColumn] = useState<string | null>(null);

  // Listen for real-time Socket.io events
  useEffect(() => {
    if (!socket) return;

    // Task progress updated
    socket.on('task_progress_updated', (data: { taskId: number; newProgress: number }) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === data.taskId ? { ...task, progress: data.newProgress } : task
        )
      );

      // Flash animation
      setFlashingTask(data.taskId);
      setTimeout(() => setFlashingTask(null), 1000);

      // Celebration if 100%
      if (data.newProgress === 100) {
        setCelebratingTask(data.taskId);
        setTimeout(() => setCelebratingTask(null), 2000);
      }
    });

    // Task status updated
    socket.on('task_updated', (data: { taskId: number; newStatus: string }) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === data.taskId
            ? { ...task, status: data.newStatus as Task['status'] }
            : task
        )
      );

      // Highlight column
      setHighlightedColumn(data.newStatus);
      setTimeout(() => setHighlightedColumn(null), 500);
    });

    // AI suggestion ready
    socket.on('ai_suggestion_ready', (data: { taskId: number; suggestion: Task['ai_suggestion'] }) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === data.taskId ? { ...task, ai_suggestion: data.suggestion } : task
        )
      );
      setLoadingAI(null);
    });

    return () => {
      socket.off('task_progress_updated');
      socket.off('task_updated');
      socket.off('ai_suggestion_ready');
    };
  }, [socket]);

  const columns = [
    { id: 'pending', title: '⏳ PENDING', color: 'gray', bgColor: '#9ca3af' },
    { id: 'in_progress', title: '🔄 IN PROGRESS', color: 'blue', bgColor: '#3b82f6' },
    { id: 'submitted', title: '✅ SUBMITTED', color: 'purple', bgColor: '#a855f7' },
    { id: 'completed', title: '✔️ COMPLETED', color: 'green', bgColor: '#10b981' }
  ];

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: '#9ca3af',
      in_progress: '#3b82f6',
      submitted: '#a855f7',
      completed: '#10b981'
    };
    return colors[status] || '#9ca3af';
  };

  const getProgressGradient = (progress: number) => {
    if (progress < 33) return 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)';
    if (progress < 66) return 'linear-gradient(90deg, #f97316 0%, #fbbf24 100%)';
    return 'linear-gradient(90deg, #fbbf24 0%, #10b981 100%)';
  };

  const getDeadlineColor = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-500';
    if (diffDays < 2) return 'text-orange-500';
    return 'text-green-500';
  };

  const handleSubmitTask = async (taskId: number) => {
    setLoadingAI(taskId);

    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.ai_next_step) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: 'submitted',
                  ai_suggestion: data.ai_next_step
                }
              : task
          )
        );
      }
    } catch (error) {
      console.error('Failed to submit task:', error);
    } finally {
      setLoadingAI(null);
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="w-full p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`flex flex-col rounded-lg transition-all duration-500 ${
              highlightedColumn === column.id
                ? 'ring-4 ring-yellow-400 ring-opacity-50'
                : ''
            }`}
          >
            {/* Column Header */}
            <div
              className="p-4 rounded-t-lg text-white font-bold text-sm tracking-wide"
              style={{ backgroundColor: column.bgColor }}
            >
              {column.title}
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {tasks.filter((t) => t.status === column.id).length}
              </span>
            </div>

            {/* Column Body */}
            <div
              className={`flex-1 p-3 rounded-b-lg min-h-[400px] ${
                darkMode ? 'bg-gray-800/50' : 'bg-gray-50'
              }`}
            >
              <div className="space-y-3">
                {tasks
                  .filter((task) => task.status === column.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      onClick={() =>
                        setExpandedTask(expandedTask === task.id ? null : task.id)
                      }
                      className={`rounded-lg cursor-pointer transition-all duration-300 ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      } border shadow-md hover:shadow-xl hover:-translate-y-1 ${
                        flashingTask === task.id ? 'ring-4 ring-green-400 ring-opacity-50' : ''
                      }`}
                      style={{ borderLeft: `4px solid ${getStatusColor(task.status)}` }}
                    >
                      <div className="p-3">
                        {/* Task Title */}
                        <h3
                          className={`font-bold text-base mb-2 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          } ${expandedTask !== task.id ? 'truncate' : ''}`}
                          title={task.title}
                        >
                          {task.title}
                        </h3>

                        {/* Task Description */}
                        <p
                          className={`text-xs mb-3 ${
                            darkMode ? 'text-gray-300' : 'text-gray-600'
                          } ${expandedTask !== task.id ? 'line-clamp-1' : ''}`}
                        >
                          {task.description}
                        </p>

                        {/* Assignee Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                            <User className="w-3 h-3" />
                            {task.assignee}
                          </div>
                          <div
                            className="px-2 py-1 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: getStatusColor(task.status) }}
                          >
                            {task.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div
                            className={`h-1.5 rounded-full overflow-hidden ${
                              darkMode ? 'bg-gray-600' : 'bg-gray-200'
                            }`}
                          >
                            <div
                              className="h-full transition-all duration-500 ease-out rounded-full"
                              style={{
                                width: `${task.progress}%`,
                                background: getProgressGradient(task.progress)
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p
                              className={`text-xs ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}
                            >
                              {task.progress}% complete
                            </p>
                            {celebratingTask === task.id && (
                              <span className="text-lg animate-bounce">🎉</span>
                            )}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedTask === task.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3 animate-fadeIn">
                            {/* Deadline */}
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className={`text-xs font-medium ${getDeadlineColor(task.deadline)}`}>
                                {formatDeadline(task.deadline)}
                              </span>
                            </div>

                            {/* Submit Button (only for in_progress) */}
                            {task.status === 'in_progress' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubmitTask(task.id);
                                }}
                                disabled={loadingAI === task.id}
                                className="w-full py-2 px-4 rounded-lg text-white font-medium text-sm transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                                style={{
                                  background: 'linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)'
                                }}
                              >
                                {loadingAI === task.id ? (
                                  <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    AI suggesting...
                                  </span>
                                ) : (
                                  'Submit & Get AI Suggestion'
                                )}
                              </button>
                            )}

                            {/* AI Suggestion */}
                            {task.ai_suggestion && (
                              <div
                                className="p-3 rounded-lg animate-fadeIn"
                                style={{
                                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                                  color: 'white'
                                }}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="w-4 h-4 animate-pulse" />
                                  <span className="font-bold text-xs">AI SUGGESTION</span>
                                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                    {task.ai_suggestion.confidence}% confidence
                                  </span>
                                </div>
                                <div className="text-xs space-y-1">
                                  <p>
                                    <strong>Next:</strong> {task.ai_suggestion.next}
                                  </p>
                                  <p>
                                    <strong>Who:</strong> {task.ai_suggestion.who}
                                  </p>
                                  <p>
                                    <strong>Time:</strong> {task.ai_suggestion.time}
                                  </p>
                                  <p>
                                    <strong>Why:</strong> {task.ai_suggestion.why}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Expand/Collapse Indicator */}
                        <div className="flex justify-center mt-2">
                          {expandedTask === task.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 300ms ease-out;
        }
      `}</style>
    </div>
  );
}
