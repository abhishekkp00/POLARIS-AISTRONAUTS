'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

interface TeamMember {
  name: string;
  completed: number;
  in_progress: number;
  pending: number;
  impact: number;
}

interface HeatmapProps {
  darkMode: boolean;
}

export default function Heatmap({ darkMode }: HeatmapProps) {
  const { socket } = useSocket();
  const [teamData, setTeamData] = useState<TeamMember[]>([
    { name: 'Priya', completed: 8, in_progress: 1, pending: 0, impact: 95 },
    { name: 'Sarah', completed: 7, in_progress: 1, pending: 0, impact: 88 },
    { name: 'Rahul', completed: 5, in_progress: 2, pending: 1, impact: 65 },
    { name: 'Aditya', completed: 2, in_progress: 1, pending: 2, impact: 45 }
  ]);

  const [highlightedMember, setHighlightedMember] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [celebrationEmoji, setCelebrationEmoji] = useState<{ name: string; emoji: string } | null>(null);

  // Calculate totals
  const totalTasks = teamData.reduce((sum, member) => 
    sum + member.completed + member.in_progress + member.pending, 0
  );
  const totalCompleted = teamData.reduce((sum, member) => sum + member.completed, 0);
  const totalInProgress = teamData.reduce((sum, member) => sum + member.in_progress, 0);

  // Listen for real-time Socket.io events
  useEffect(() => {
    if (!socket) return;

    socket.on('heatmap_updated', (data: { name: string; updates: Partial<TeamMember> }) => {
      setTeamData((prev) => {
        const updated = prev.map((member) => {
          if (member.name === data.name) {
            const oldImpact = member.impact;
            const newMember = { ...member, ...data.updates };
            
            // Check if moved to higher tier
            if (data.updates.impact && data.updates.impact > oldImpact) {
              if (data.updates.impact >= 80 && oldImpact < 80) {
                setCelebrationEmoji({ name: data.name, emoji: '⭐' });
                setTimeout(() => setCelebrationEmoji(null), 2000);
              } else if (data.updates.impact >= 60 && oldImpact < 60) {
                setCelebrationEmoji({ name: data.name, emoji: '⬆️' });
                setTimeout(() => setCelebrationEmoji(null), 2000);
              }
            }
            
            return newMember;
          }
          return member;
        });

        // Highlight updated row
        setHighlightedMember(data.name);
        setTimeout(() => setHighlightedMember(null), 1000);

        // Show notification
        const member = updated.find(m => m.name === data.name);
        if (member) {
          const status = member.impact >= 80 ? 'Top performer!' : 
                        member.impact >= 60 ? 'On track!' : 
                        member.impact >= 40 ? 'Needs support' : 'At risk';
          setNotification(`${data.name}'s impact: ${member.impact}% - ${status}`);
          setTimeout(() => setNotification(null), 3000);
        }

        return updated;
      });
    });

    return () => {
      socket.off('heatmap_updated');
    };
  }, [socket]);

  const getImpactColor = (impact: number) => {
    if (impact >= 80) return { bg: '#10b981', text: 'white', label: 'GREEN' };
    if (impact >= 60) return { bg: '#3b82f6', text: 'white', label: 'BLUE' };
    if (impact >= 40) return { bg: '#f59e0b', text: 'black', label: 'YELLOW' };
    return { bg: '#ef4444', text: 'white', label: 'RED' };
  };

  const getImpactEmoji = (impact: number) => {
    if (impact >= 80) return '🟢';
    if (impact >= 60) return '🔵';
    if (impact >= 40) return '🟡';
    return '🔴';
  };

  const getImpactLabel = (impact: number, name: string) => {
    if (impact >= 80) return `${name === 'Priya' ? 'Top performer!' : 'Reliable!'}`;
    if (impact >= 60) return 'On track';
    if (impact >= 40) return 'Needs support';
    return 'At risk';
  };

  // Prepare chart data
  const chartData = teamData.map(member => ({
    name: member.name,
    Completed: member.completed,
    'In Progress': member.in_progress,
    Pending: member.pending
  }));

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className="p-4 bg-blue-500 text-white rounded-lg shadow-lg animate-slideDown font-medium">
          {notification}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks Card */}
        <div
          className="rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            animationDelay: '0ms'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📊</span>
            <TrendingUp className="w-6 h-6 text-white/80" />
          </div>
          <div className="text-3xl font-bold text-white mb-1 transition-all duration-500">
            {totalTasks}
          </div>
          <div className="text-sm text-white/80">Project tasks</div>
        </div>

        {/* Completed Card */}
        <div
          className="rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            animationDelay: '100ms'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">✅</span>
            <CheckCircle className="w-6 h-6 text-white/80" />
          </div>
          <div className="text-3xl font-bold text-white mb-1 transition-all duration-500">
            {totalCompleted}
          </div>
          <div className="text-sm text-white/80">Finished tasks</div>
        </div>

        {/* In Progress Card */}
        <div
          className="rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            animationDelay: '200ms'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🔄</span>
            <Clock className="w-6 h-6 text-white/80" />
          </div>
          <div className="text-3xl font-bold text-white mb-1 transition-all duration-500">
            {totalInProgress}
          </div>
          <div className="text-sm text-white/80">Active tasks</div>
        </div>

        {/* Team Members Card */}
        <div
          className="rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn"
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)',
            animationDelay: '300ms'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">👥</span>
            <Users className="w-6 h-6 text-white/80" />
          </div>
          <div className="text-3xl font-bold text-white mb-1 transition-all duration-500">
            {teamData.length}
          </div>
          <div className="text-sm text-white/80">Priya, Rahul, Sarah, Aditya</div>
        </div>
      </div>

      {/* Contribution Table */}
      <div className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div
          className="p-4 text-white font-bold text-lg"
          style={{
            background: darkMode
              ? 'linear-gradient(90deg, #1e3a8a 0%, #581c87 100%)'
              : 'linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)'
          }}
        >
          📊 Team Contributions
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Name
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  ✅ Completed
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  🔄 In Progress
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  ⏳ Pending
                </th>
                <th className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  📊 Impact %
                </th>
              </tr>
            </thead>
            <tbody className={darkMode ? 'bg-gray-800' : 'bg-white'}>
              {teamData.map((member, index) => {
                const impactColor = getImpactColor(member.impact);
                const isHighlighted = highlightedMember === member.name;
                const isTopPerformer = member.impact >= 80;
                const needsSupport = member.impact < 60;
                
                return (
                  <tr
                    key={member.name}
                    className={`border-b transition-all duration-500 ${
                      darkMode ? 'border-gray-700' : 'border-gray-200'
                    } ${
                      index % 2 === 0
                        ? darkMode ? 'bg-gray-800' : 'bg-white'
                        : darkMode ? 'bg-gray-750' : 'bg-gray-50'
                    } ${
                      isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''
                    } ${
                      isTopPerformer ? 'shadow-md shadow-yellow-200/50 dark:shadow-yellow-900/30' : ''
                    } ${
                      needsSupport && !isTopPerformer ? 'shadow-md shadow-orange-200/50 dark:shadow-orange-900/30' : ''
                    } hover:bg-yellow-50 dark:hover:bg-yellow-900/20`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)'
                          }}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {member.name}
                          </div>
                          {celebrationEmoji?.name === member.name && (
                            <span className="text-2xl animate-bounce inline-block">
                              {celebrationEmoji.emoji}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white transition-all duration-500">
                        {member.completed}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white transition-all duration-500">
                        {member.in_progress}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white transition-all duration-500">
                        {member.pending}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold transition-all duration-500"
                          style={{
                            backgroundColor: impactColor.bg,
                            color: impactColor.text
                          }}
                        >
                          {member.impact}% {getImpactEmoji(member.impact)} {impactColor.label}
                        </span>
                        <span className="text-xs text-gray-500 italic">
                          ({getImpactLabel(member.impact, member.name)})
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className={`rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📊 Task Distribution by Team Member
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                color: darkMode ? '#ffffff' : '#000000'
              }}
            />
            <Legend />
            <Bar dataKey="Completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="In Progress" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Pending" stackId="a" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>✅ Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>🔄 In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>⏳ Pending</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 500ms ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 300ms ease-out;
        }
      `}</style>
    </div>
  );
}
