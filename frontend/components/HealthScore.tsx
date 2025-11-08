'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HealthData {
  score: number;
  status: string;
  emoji: string;
  color: string;
  message: string;
  trend?: 'improving' | 'stable' | 'declining';
}

interface HealthScoreProps {
  darkMode: boolean;
}

export default function HealthScore({ darkMode }: HealthScoreProps) {
  const { socket } = useSocket();
  const [health, setHealth] = useState<HealthData>({
    score: 0,
    status: 'LOADING',
    emoji: '⏳',
    color: 'gray',
    message: 'Loading...',
    trend: 'stable'
  });

  const [prevScore, setPrevScore] = useState(0);

  // Fetch initial health score
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/analytics/health-score');
        const data = await response.json();
        setHealth(data);
        setPrevScore(data.score);
      } catch (error) {
        console.error('Failed to fetch health score:', error);
      }
    };

    fetchHealth();
  }, []);

  // Listen for real-time health updates
  useEffect(() => {
    if (!socket) return;

    socket.on('health_score_updated', (data: HealthData) => {
      setPrevScore(health.score);
      setHealth(data);
    });

    return () => {
      socket.off('health_score_updated');
    };
  }, [socket, health.score]);

  const getStatusColor = (color: string) => {
    switch (color.toLowerCase()) {
      case 'green':
        return { bg: '#10b981', text: 'white' };
      case 'yellow':
        return { bg: '#fbbf24', text: 'black' };
      case 'orange':
        return { bg: '#f97316', text: 'white' };
      case 'red':
        return { bg: '#ef4444', text: 'white' };
      default:
        return { bg: '#6b7280', text: 'white' };
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrendLabel = (trend?: string) => {
    switch (trend) {
      case 'improving':
        return '⬆️ Improving';
      case 'declining':
        return '⬇️ Declining';
      default:
        return '⏸️ Stable';
    }
  };

  const statusColor = getStatusColor(health.color);
  const scoreChanged = health.score !== prevScore;

  return (
    <div className={`rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div
        className="p-4 text-white font-bold text-lg"
        style={{
          background: darkMode
            ? 'linear-gradient(90deg, #1e3a8a 0%, #581c87 100%)'
            : 'linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)'
        }}
      >
        🏥 Project Health
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Score Display */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            {/* Circular Progress */}
            <svg className="transform -rotate-90" width="200" height="200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={darkMode ? '#374151' : '#e5e7eb'}
                strokeWidth="12"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={statusColor.bg}
                strokeWidth="12"
                strokeDasharray={`${(health.score / 100) * 565.48} 565.48`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>

            {/* Score Number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className={`text-6xl font-bold transition-all duration-500 ${
                  scoreChanged ? 'scale-110' : 'scale-100'
                }`}
                style={{ color: statusColor.bg }}
              >
                {health.score}
              </div>
              <div className={`text-2xl font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                /100
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-4">
          <div
            className="px-6 py-3 rounded-full font-bold text-lg flex items-center gap-2"
            style={{
              backgroundColor: statusColor.bg,
              color: statusColor.text
            }}
          >
            <span className="text-2xl">{health.emoji}</span>
            <span>{health.status}</span>
          </div>
        </div>

        {/* Message */}
        <div className={`text-center mb-4 text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {health.message}
        </div>

        {/* Trend */}
        <div className="flex items-center justify-center gap-2">
          {getTrendIcon(health.trend)}
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {getTrendLabel(health.trend)}
          </span>
        </div>

        {/* Progress Bar Alternative (smaller) */}
        <div className="mt-6">
          <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="h-full transition-all duration-1000 ease-out rounded-full"
              style={{
                width: `${health.score}%`,
                backgroundColor: statusColor.bg
              }}
            />
          </div>
          <div className={`flex justify-between mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
