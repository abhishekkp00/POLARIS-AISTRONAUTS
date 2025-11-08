'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { CheckCircle, Clock, User, Search, Filter, TrendingUp } from 'lucide-react';

interface Decision {
  id: number;
  text: string;
  madeBy: string;
  when: string;
  impact: 'strategic' | 'technical' | 'process' | 'resource';
  status: 'implemented' | 'pending' | 'in_progress';
  timestamp: number;
}

interface DecisionLogProps {
  darkMode: boolean;
}

export default function DecisionLog({ darkMode }: DecisionLogProps) {
  const { socket } = useSocket();
  const [decisions, setDecisions] = useState<Decision[]>([
    {
      id: 1,
      text: 'Use PostgreSQL for database',
      madeBy: 'Sarah',
      when: '5 min ago',
      impact: 'strategic',
      status: 'implemented',
      timestamp: Date.now() - 5 * 60 * 1000
    },
    {
      id: 2,
      text: 'API approved and ready for production',
      madeBy: 'Rahul',
      when: '10 min ago',
      impact: 'strategic',
      status: 'implemented',
      timestamp: Date.now() - 10 * 60 * 1000
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedDecision, setExpandedDecision] = useState<number | null>(null);
  const [newDecisionAlert, setNewDecisionAlert] = useState<Decision | null>(null);

  // Listen for real-time decision updates
  useEffect(() => {
    if (!socket) return;

    socket.on('decision_logged', (data: { decision: string; by: string; impact?: string }) => {
      const newDecision: Decision = {
        id: Date.now(),
        text: data.decision,
        madeBy: data.by,
        when: 'just now',
        impact: (data.impact || 'technical') as Decision['impact'],
        status: 'pending',
        timestamp: Date.now()
      };

      setDecisions((prev) => [newDecision, ...prev]);
      
      // Show alert notification
      setNewDecisionAlert(newDecision);
      setTimeout(() => setNewDecisionAlert(null), 3000);
    });

    return () => {
      socket.off('decision_logged');
    };
  }, [socket]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'strategic':
        return { bg: '#a855f7', text: 'white', label: 'Strategic' };
      case 'technical':
        return { bg: '#3b82f6', text: 'white', label: 'Technical' };
      case 'process':
        return { bg: '#f59e0b', text: 'white', label: 'Process' };
      case 'resource':
        return { bg: '#ec4899', text: 'white', label: 'Resource' };
      default:
        return { bg: '#6b7280', text: 'white', label: 'Other' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented':
        return '✅';
      case 'pending':
        return '⏳';
      case 'in_progress':
        return '🔄';
      default:
        return '📝';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'Implemented';
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Unknown';
    }
  };

  const updateDecisionStatus = (id: number, status: Decision['status']) => {
    setDecisions((prev) =>
      prev.map((decision) =>
        decision.id === id ? { ...decision, status } : decision
      )
    );
  };

  // Filter decisions
  const filteredDecisions = decisions.filter((decision) => {
    const matchesSearch = decision.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         decision.madeBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || decision.impact === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Alert Notification */}
      {newDecisionAlert && (
        <div className="p-4 bg-green-500 text-white rounded-lg shadow-lg animate-slideDown font-medium flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
          <div>
            <div className="font-bold">✅ New Decision Logged!</div>
            <div className="text-sm">
              {newDecisionAlert.madeBy}: {newDecisionAlert.text}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div
          className="p-4 text-white font-bold text-lg flex items-center justify-between"
          style={{
            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
          }}
        >
          <span>✅ Decisions Made ({decisions.length})</span>
          <TrendingUp className="w-5 h-5" />
        </div>

        {/* Search and Filter */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex gap-3 mb-3">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search decisions..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <div className="relative">
              <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border text-sm ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Types</option>
                <option value="strategic">Strategic</option>
                <option value="technical">Technical</option>
                <option value="process">Process</option>
                <option value="resource">Resource</option>
              </select>
            </div>
          </div>
        </div>

        {/* Decisions List */}
        <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
          {filteredDecisions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <div>No decisions found</div>
            </div>
          ) : (
            filteredDecisions.map((decision) => {
              const impactColor = getImpactColor(decision.impact);
              const isExpanded = expandedDecision === decision.id;

              return (
                <div
                  key={decision.id}
                  onClick={() => setExpandedDecision(isExpanded ? null : decision.id)}
                  className={`rounded-lg p-4 cursor-pointer transition-all duration-300 animate-fadeIn ${
                    darkMode
                      ? 'bg-green-900/20 border-green-700 hover:bg-green-900/30'
                      : 'bg-green-50 border-green-200 hover:bg-green-100'
                  } border`}
                  style={{ borderLeft: `4px solid #10b981` }}
                >
                  {/* Decision Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xl">{getStatusIcon(decision.status)}</span>
                        <span
                          className="px-2 py-0.5 rounded text-xs font-bold"
                          style={{
                            backgroundColor: impactColor.bg,
                            color: impactColor.text
                          }}
                        >
                          {impactColor.label}
                        </span>
                        <span className={`text-xs font-medium ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                          {getStatusLabel(decision.status)}
                        </span>
                      </div>
                      <div className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'} ${!isExpanded ? 'truncate' : ''}`}>
                        {decision.text}
                      </div>
                      <div className={`flex items-center gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{decision.madeBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{decision.when}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-green-300 dark:border-green-700 space-y-3 animate-fadeIn">
                      <div>
                        <div className={`text-xs font-bold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          UPDATE STATUS:
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateDecisionStatus(decision.id, 'pending');
                            }}
                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                              decision.status === 'pending'
                                ? 'bg-yellow-500 text-white'
                                : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            ⏳ Pending
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateDecisionStatus(decision.id, 'in_progress');
                            }}
                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                              decision.status === 'in_progress'
                                ? 'bg-blue-500 text-white'
                                : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            🔄 In Progress
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateDecisionStatus(decision.id, 'implemented');
                            }}
                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                              decision.status === 'implemented'
                                ? 'bg-green-500 text-white'
                                : darkMode
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            ✅ Implemented
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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
          animation: fadeIn 300ms ease-out;
        }

        .animate-slideDown {
          animation: slideDown 300ms ease-out;
        }
      `}</style>
    </div>
  );
}
