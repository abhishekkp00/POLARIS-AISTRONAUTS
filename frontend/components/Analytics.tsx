'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, Users, Target } from 'lucide-react';
// Heatmap and HealthScore are used separately in the dashboard

interface Contribution {
  username: string;
  tasks_completed: number;
  impact_score: number;
  total_hours: number;
}

interface Task {
  status: string;
  progress: number;
}

interface AnalyticsProps {
  contributions: Contribution[];
  healthScore: number;
  tasks: Task[];
}

export default function Analytics({ contributions, healthScore, tasks }: AnalyticsProps) {
  const stats = [
    {
      label: 'Total Tasks',
      value: tasks.length,
      icon: Target,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Completed',
      value: tasks.filter(t => t.status === 'completed').length,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'In Progress',
      value: tasks.filter(t => t.status === 'in_progress').length,
      icon: Activity,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      label: 'Team Members',
      value: contributions.length,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h2 className="text-3xl font-bold gradient-text">Analytics Dashboard</h2>
        <p className="text-slate-400 mt-1">Real-time insights and team performance metrics</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="glass rounded-xl p-6 card-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}/20`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Health Score & Heatmap */}
      <div className="grid grid-cols-2 gap-6">
        {/* Health Score Component - integrate separately */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Health Score</h3>
          <div className="text-5xl font-bold gradient-text">{healthScore}%</div>
          <p className="text-slate-400 mt-2">Project health is {healthScore >= 80 ? 'excellent' : healthScore >= 60 ? 'good' : 'needs attention'}</p>
        </motion.div>

        {/* Team Heatmap - integrate separately */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4">Team Activity</h3>
          <div className="space-y-3">
            {contributions.slice(0, 5).map((member, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm">{member.username}</span>
                <span className="text-sm font-bold">{member.tasks_completed} tasks</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Contributions Chart */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-6">Team Contributions</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={contributions}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="username" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="tasks_completed" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="impact_score" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
