'use client';

import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  assigned_to: string;
  assignee_name: string;
  deadline: string;
  progress: number;
  ai_suggestion?: string;
}

interface Message {
  id: string;
  username: string;
  content: string;
  created_at: string;
  analysis?: any;
}

interface Contribution {
  username: string;
  tasks_completed: number;
  impact_score: number;
  total_hours: number;
}

export function useDemoData() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Frontend UI Components',
      description: 'Build React components with Tailwind CSS and smooth animations',
      status: 'in_progress',
      assigned_to: '1',
      assignee_name: 'Priya',
      deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 65,
    },
    {
      id: '2',
      title: 'API Integration',
      description: 'Connect frontend to Express backend with Socket.io real-time updates',
      status: 'completed',
      assigned_to: '2',
      assignee_name: 'Rahul',
      deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 100,
      ai_suggestion: 'Next: Add authentication / Who: Security Team / Time: 4 hours / Why: Secure endpoints before production',
    },
    {
      id: '3',
      title: 'Database Setup',
      description: 'Configure PostgreSQL with proper schema and indexes for scalability',
      status: 'pending',
      assigned_to: '3',
      assignee_name: 'Sarah',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 0,
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      username: 'Rahul',
      content: 'Backend API is ready! All endpoints tested and documented.',
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      analysis: {
        badges: [{ type: 'decision', text: 'Backend API is ready!', emoji: '✅', color: '#10B981' }],
      },
    },
  ]);

  const [contributions] = useState<Contribution[]>([
    { username: 'Priya', tasks_completed: 12, impact_score: 87, total_hours: 45 },
    { username: 'Rahul', tasks_completed: 15, impact_score: 92, total_hours: 52 },
    { username: 'Sarah', tasks_completed: 8, impact_score: 71, total_hours: 32 },
    { username: 'Aditya', tasks_completed: 10, impact_score: 78, total_hours: 38 },
  ]);

  const [healthScore, setHealthScore] = useState(85);

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const addMessage = (content: string, username: string) => {
    const analysis = analyzeMessage(content);
    const newMessage: Message = {
      id: String(Date.now()),
      username,
      content,
      created_at: new Date().toISOString(),
      analysis: analysis.badges.length > 0 ? analysis : undefined,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const analyzeMessage = (content: string) => {
    const analysis = { blockers: [], decisions: [], actionItems: [], risks: [], badges: [] as any[] };
    const text = content.toLowerCase();

    if (text.match(/waiting for|blocked|stuck|depends on|can't proceed|need|require|pending/i)) {
      analysis.badges.push({ type: 'blocker', text: content.substring(0, 50), emoji: '🚨', color: '#EF4444' });
    }
    if (text.match(/decided|agreed|approved|confirmed|going with|chosen|finalized/i)) {
      analysis.badges.push({ type: 'decision', text: content.substring(0, 50), emoji: '✅', color: '#10B981' });
    }
    if (text.match(/should|will|needs to|must|action|todo|task|assign/i)) {
      analysis.badges.push({ type: 'action', text: content.substring(0, 50), emoji: '📝', color: '#3B82F6' });
    }
    if (text.match(/problem|issue|error|bug|critical|warning|concern|risk|failure/i)) {
      analysis.badges.push({ type: 'risk', text: content.substring(0, 50), emoji: '⚠️', color: '#F59E0B' });
    }

    return analysis;
  };

  return {
    tasks,
    messages,
    contributions,
    healthScore,
    updateTask,
    addMessage,
  };
}
