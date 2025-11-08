'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

interface HealthScore {
  score: number;
  status: string;
  emoji: string;
  color: string;
  message: string;
}

export default function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  const { socket, connected } = useSocket();
  const [healthScore, setHealthScore] = useState<HealthScore>({
    score: 0,
    status: 'LOADING',
    emoji: '⏳',
    color: 'gray',
    message: 'Loading...'
  });
  const [prevScore, setPrevScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Animate on mount
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // Fetch initial health score
  useEffect(() => {
    const fetchHealthScore = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/analytics/health-score');
        const data = await response.json();
        setHealthScore(data);
        setPrevScore(data.score);
      } catch (error) {
        console.error('Failed to fetch health score:', error);
      }
    };

    fetchHealthScore();
  }, []);

  // Listen for real-time health updates via Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleHealthUpdate = (data: HealthScore) => {
      setPrevScore(healthScore.score);
      setHealthScore(data);

      // Show celebration if score improved by 5+ points
      if (data.score > healthScore.score + 5) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
    };

    socket.on('health_score_updated', handleHealthUpdate);

    return () => {
      socket.off('health_score_updated', handleHealthUpdate);
    };
  }, [socket, healthScore.score]);

  const getStatusColor = (color: string) => {
    const colors: { [key: string]: string } = {
      green: 'text-green-300',
      yellow: 'text-yellow-300',
      orange: 'text-orange-300',
      red: 'text-red-300',
      gray: 'text-gray-300'
    };
    return colors[color.toLowerCase()] || 'text-gray-300';
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      style={{
        background: darkMode
          ? 'linear-gradient(90deg, #1e3a8a 0%, #581c87 100%)'
          : 'linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)',
        borderBottom: darkMode
          ? '1px solid rgba(168, 85, 247, 0.3)'
          : '1px solid rgba(59, 130, 246, 0.3)'
      }}
    >
      <div className="container mx-auto px-5 py-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div
              className="text-2xl font-bold text-white transition-all duration-300 hover:scale-105"
              style={{
                backgroundImage: darkMode
                  ? 'linear-gradient(90deg, #60a5fa 0%, #c084fc 100%)'
                  : 'linear-gradient(90deg, #ffffff 0%, #fde68a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              ✨ TaskMuse
            </div>
            <div className="h-6 w-px bg-white/30" />
            <div className="text-sm text-white/80 font-medium">
              AI-Powered Team Brain
            </div>
          </div>

          {/* Center - Project Name */}
          <div className="flex items-center gap-2 text-white">
            <span className="text-base font-bold">🚀 Mobile App Launch</span>
          </div>

          {/* Right Section - Health Score + Settings */}
          <div className="flex items-center gap-6">
            {/* Health Score */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <div className="flex flex-col">
                <span className="text-xs text-white/70 font-medium">Project Health</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold transition-all duration-500 ${
                      healthScore.score > prevScore ? 'scale-110' : ''
                    } ${getStatusColor(healthScore.color)}`}
                  >
                    {healthScore.score}
                  </span>
                  <span className="text-white/90 text-sm">/100</span>
                  <span className="text-xl">{healthScore.emoji}</span>
                  {showCelebration && (
                    <span className="text-2xl animate-bounce">🎉</span>
                  )}
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {connected ? (
                <>
                  <div className="relative">
                    <Wifi className="w-5 h-5 text-green-300" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <span className="text-xs text-white/80 font-medium">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-300 animate-pulse" />
                  <span className="text-xs text-red-300 font-medium">Disconnected</span>
                </>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-300 transition-transform duration-200" />
              ) : (
                <Moon className="w-5 h-5 text-white transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-3">
          {/* First Line: Logo + Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="text-xl font-bold text-white"
                style={{
                  backgroundImage: darkMode
                    ? 'linear-gradient(90deg, #60a5fa 0%, #c084fc 100%)'
                    : 'linear-gradient(90deg, #ffffff 0%, #fde68a 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                ✨ TaskMuse
              </div>
              <div className="text-xs text-white/70">AI Brain</div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-yellow-300" />
              ) : (
                <Moon className="w-4 h-4 text-white" />
              )}
            </button>
          </div>

          {/* Second Line: Project + Health + Connection */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-white font-medium">🚀 Mobile App</div>
            <div className="flex items-center gap-3">
              {/* Health Score */}
              <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                <span className={`text-lg font-bold ${getStatusColor(healthScore.color)}`}>
                  {healthScore.score}
                </span>
                <span className="text-xs text-white/70">/100</span>
                <span className="text-sm">{healthScore.emoji}</span>
              </div>
              {/* Connection */}
              {connected ? (
                <div className="relative">
                  <Wifi className="w-4 h-4 text-green-300" />
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                </div>
              ) : (
                <WifiOff className="w-4 h-4 text-red-300 animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle gradient line at bottom */}
      <div
        className="h-px w-full"
        style={{
          background: darkMode
            ? 'linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.5) 50%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.5) 50%, transparent 100%)'
        }}
      />
    </header>
  );
}
