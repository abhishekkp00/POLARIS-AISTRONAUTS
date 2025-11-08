'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import TaskBoard from '@/components/TaskBoard';
import Chat from '@/components/Chat';
import Heatmap from '@/components/Heatmap';
import BlockerDashboard from '@/components/BlockerDashboard';
import DecisionLog from '@/components/DecisionLog';
import LaunchSequence from '@/components/LaunchSequence';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  if (isLoading) {
    return (
      <LaunchSequence 
        onComplete={() => setIsLoading(false)} 
        darkMode={darkMode} 
      />
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Header 
          darkMode={darkMode} 
          toggleDarkMode={() => setDarkMode(!darkMode)} 
        />
        
        <main className="container mx-auto px-4 py-6 space-y-6">
          {/* Task Board */}
          <TaskBoard darkMode={darkMode} />
          
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chat */}
            <Chat darkMode={darkMode} />
            
            {/* Team Heatmap */}
            <Heatmap darkMode={darkMode} />
          </div>
          
          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blocker Dashboard */}
            <BlockerDashboard darkMode={darkMode} />
            
            {/* Decision Log */}
            <DecisionLog darkMode={darkMode} />
          </div>
        </main>
      </div>
    </div>
  );
}
