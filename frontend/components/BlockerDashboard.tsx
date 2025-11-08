'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { AlertTriangle, Clock, User, CheckCircle, PlayCircle } from 'lucide-react';

interface Blocker {
  id: number;
  text: string;
  severity: 'high' | 'medium' | 'low';
  from: string;
  time: string;
  resolution: string;
  status: 'open' | 'in_progress' | 'resolved';
  context: string;
}

interface BlockerDashboardProps {
  darkMode: boolean;
}

export default function BlockerDashboard({ darkMode }: BlockerDashboardProps) {
  const { socket } = useSocket();
  const [blockers, setBlockers] = useState<Blocker[]>([
    {
      id: 1,
      text: 'API documentation',
      severity: 'high',
      from: 'Priya',
      time: '2 min ago',
      resolution: '4 hours',
      status: 'open',
      context: 'integration work'
    }
  ]);
  const [expandedBlocker, setExpandedBlocker] = useState<number | null>(null);
  const [newBlockerAlert, setNewBlockerAlert] = useState<Blocker | null>(null);

  // Listen for real-time blocker alerts
  useEffect(() => {
    if (!socket) return;

    socket.on('blocker_alert', (data: { blocker: string; from: string; severity?: string }) => {
      const newBlocker: Blocker = {
        id: Date.now(),
        text: data.blocker,
        severity: (data.severity || 'medium') as Blocker['severity'],
        from: data.from,
        time: 'just now',
        resolution: data.severity === 'high' ? '2-4 hours' : '1-2 hours',
        status: 'open',
        context: 'Detected from chat'
      };

      setBlockers((prev) => [newBlocker, ...prev]);
      
      // Show alert notification
      setNewBlockerAlert(newBlocker);
      setTimeout(() => setNewBlockerAlert(null), 4000);
    });

    return () => {
      socket.off('blocker_alert');
    };
  }, [socket]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return { bg: '#ef4444', border: '#b91c1c', text: 'white' };
      case 'medium':
        return { bg: '#f97316', border: '#c2410c', text: 'white' };
      case 'low':
        return { bg: '#fbbf24', border: '#d97706', text: 'black' };
      default:
        return { bg: '#6b7280', border: '#4b5563', text: 'white' };
    }
  };

  const updateBlockerStatus = (id: number, status: Blocker['status']) => {
    setBlockers((prev) =>
      prev.map((blocker) =>
        blocker.id === id ? { ...blocker, status } : blocker
      )
    );
  };

  const activeBlockers = blockers.filter((b) => b.status !== 'resolved');
  const resolvedBlockers = blockers.filter((b) => b.status === 'resolved');

  return (
    <div className="space-y-4">
      {/* Alert Notification */}
      {newBlockerAlert && (
        <div className="p-4 bg-red-500 text-white rounded-lg shadow-lg animate-slideDown font-medium flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          <div>
            <div className="font-bold">🚨 New Blocker Detected!</div>
            <div className="text-sm">
              {newBlockerAlert.from}: {newBlockerAlert.text}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div
          className="p-4 text-white font-bold text-lg flex items-center justify-between"
          style={{
            background: activeBlockers.length > 0
              ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
          }}
        >
          <span>
            {activeBlockers.length > 0
              ? `🚨 Active Blockers (${activeBlockers.length})`
              : '✅ No blockers!'}
          </span>
          {activeBlockers.length === 0 && <span className="text-2xl">🎉</span>}
        </div>

        {/* No Blockers State */}
        {activeBlockers.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <div className={`text-2xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              No blockers! Team is flowing!
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Keep up the great work! All systems operational.
            </div>
          </div>
        )}

        {/* Active Blockers List */}
        {activeBlockers.length > 0 && (
          <div className="p-4 space-y-3">
            {activeBlockers.map((blocker) => {
              const colors = getSeverityColor(blocker.severity);
              const isExpanded = expandedBlocker === blocker.id;

              return (
                <div
                  key={blocker.id}
                  onClick={() => setExpandedBlocker(isExpanded ? null : blocker.id)}
                  className="rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg animate-popIn"
                  style={{
                    backgroundColor: colors.bg,
                    borderLeft: `4px solid ${colors.border}`,
                    color: colors.text
                  }}
                >
                  {/* Blocker Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-bold text-xs uppercase tracking-wide">
                          {blocker.severity} SEVERITY
                        </span>
                        {blocker.status === 'in_progress' && (
                          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs">
                            🔄 In Progress
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-base mb-2">
                        {blocker.text}
                      </div>
                      <div className="flex items-center gap-4 text-sm opacity-90">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{blocker.from}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{blocker.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/20 space-y-3 animate-fadeIn">
                      <div>
                        <div className="text-xs font-bold mb-1">CONTEXT:</div>
                        <div className="text-sm">{blocker.context}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold mb-1">ESTIMATED RESOLUTION:</div>
                        <div className="text-sm">{blocker.resolution}</div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        {blocker.status === 'open' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBlockerStatus(blocker.id, 'in_progress');
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-all"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Mark In Progress
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateBlockerStatus(blocker.id, 'resolved');
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Resolved Blockers Section */}
        {resolvedBlockers.length > 0 && (
          <div className={`border-t p-4 ${darkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
            <div className={`text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              ✅ Resolved ({resolvedBlockers.length})
            </div>
            <div className="space-y-2">
              {resolvedBlockers.map((blocker) => (
                <div
                  key={blocker.id}
                  className={`p-2 rounded text-sm ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-600'}`}
                >
                  <span className="line-through">{blocker.text}</span>
                  <span className="ml-2 text-xs opacity-70">by {blocker.from}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

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

        .animate-popIn {
          animation: popIn 300ms ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 300ms ease-out;
        }

        .animate-slideDown {
          animation: slideDown 300ms ease-out;
        }
      `}</style>
    </div>
  );
}
