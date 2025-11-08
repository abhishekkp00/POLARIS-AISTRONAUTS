'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Send, Trash2, Wifi, WifiOff, Smile } from 'lucide-react';

interface Message {
  id: number;
  author: string;
  text: string;
  timestamp: string;
  isCurrentUser: boolean;
  analysis?: {
    blockers: Array<{ text: string; severity: string; context: string }>;
    decisions: Array<{ text: string; impact: string; context: string }>;
    actions: Array<{ text: string; assignee: string; context: string }>;
    risks: Array<{ text: string; level: string; context: string }>;
  };
}

interface ChatProps {
  darkMode: boolean;
}

export default function Chat({ darkMode }: ChatProps) {
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      author: 'Rahul',
      text: 'Backend API is fully ready and tested! 🚀',
      timestamp: '2:15 PM',
      isCurrentUser: false,
      analysis: {
        blockers: [],
        decisions: [{ text: 'API approved and ready', impact: 'strategic', context: 'Backend API ready' }],
        actions: [],
        risks: []
      }
    },
    {
      id: 2,
      author: 'Priya',
      text: 'Waiting for API documentation to start integration work',
      timestamp: '2:18 PM',
      isCurrentUser: false,
      analysis: {
        blockers: [{ text: 'API documentation', severity: 'high', context: 'integration work' }],
        decisions: [],
        actions: [],
        risks: []
      }
    },
    {
      id: 3,
      author: 'Sarah',
      text: 'We decided to use PostgreSQL for our database',
      timestamp: '2:22 PM',
      isCurrentUser: false,
      analysis: {
        blockers: [],
        decisions: [{ text: 'Use PostgreSQL confirmed', impact: 'strategic', context: 'database choice' }],
        actions: [],
        risks: []
      }
    },
    {
      id: 4,
      author: 'Aditya',
      text: 'Database migration is having issues with timing constraints',
      timestamp: '2:28 PM',
      isCurrentUser: false,
      analysis: {
        blockers: [],
        decisions: [],
        actions: [],
        risks: [{ text: 'Database migration timing issues', level: 'medium', context: 'migration' }]
      }
    },
    {
      id: 5,
      author: 'Rahul',
      text: 'Sarah should start testing the API endpoints now',
      timestamp: '2:30 PM',
      isCurrentUser: false,
      analysis: {
        blockers: [],
        decisions: [],
        actions: [{ text: 'Test API endpoints', assignee: 'Sarah', context: 'API validation' }],
        risks: []
      }
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [alertNotification, setAlertNotification] = useState<{ type: string; message: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for real-time Socket.io events
  useEffect(() => {
    if (!socket) return;

    // Receive new message
    socket.on('receive_message', (data: {
      id: number;
      author: string;
      text: string;
      timestamp: string;
      analysis?: Message['analysis'];
    }) => {
      const newMessage: Message = {
        ...data,
        isCurrentUser: data.author === 'You'
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    // Blocker alert
    socket.on('blocker_alert', (data: { blocker: string; from: string }) => {
      setAlertNotification({
        type: 'blocker',
        message: `🚨 Blocker detected from ${data.from}: ${data.blocker}`
      });
      setTimeout(() => setAlertNotification(null), 4000);
    });

    // Decision logged
    socket.on('decision_logged', (data: { decision: string; by: string }) => {
      setAlertNotification({
        type: 'decision',
        message: `✅ Decision by ${data.by}: ${data.decision}`
      });
      setTimeout(() => setAlertNotification(null), 4000);
    });

    return () => {
      socket.off('receive_message');
      socket.off('blocker_alert');
      socket.off('decision_logged');
    };
  }, [socket]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    setSending(true);

    const newMessage: Message = {
      id: messages.length + 1,
      author: 'You',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true
    };

    // Add message to UI immediately
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');

    try {
      // Send to backend for analysis
      const response = await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: 'You',
          text: inputMessage,
          project_id: 1
        })
      });

      const data = await response.json();

      // Update message with analysis
      if (data.analysis) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id
              ? { ...msg, analysis: data.analysis }
              : msg
          )
        );
      }

      // Emit via Socket.io
      if (socket) {
        socket.emit('send_message', {
          author: 'You',
          text: inputMessage,
          project_id: 1
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      {/* Header */}
      <div
        className="p-4 rounded-t-lg flex items-center justify-between"
        style={{
          background: darkMode
            ? 'linear-gradient(90deg, #1e3a8a 0%, #581c87 100%)'
            : 'linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)'
        }}
      >
        <h2 className="text-xl font-bold text-white">💬 Team Chat</h2>
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <Wifi className="w-4 h-4 text-green-300" />
                <span className="text-xs text-white/90">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-300" />
                <span className="text-xs text-red-300">Disconnected</span>
              </>
            )}
          </div>
          {/* Clear History Button */}
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
            title="Clear history"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {alertNotification && (
        <div
          className={`p-3 m-4 rounded-lg text-white font-medium text-sm animate-slideDown ${
            alertNotification.type === 'blocker'
              ? 'bg-red-500'
              : 'bg-green-500'
          }`}
        >
          {alertNotification.message}
        </div>
      )}

      {/* Message List */}
      <div
        className={`overflow-y-auto p-4 space-y-3 ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}
        style={{ maxHeight: '400px', minHeight: '400px' }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.isCurrentUser ? 'items-end' : 'items-start'} animate-fadeIn`}
          >
            {/* Message Bubble */}
            <div
              className={`rounded-2xl px-4 py-3 max-w-[70%] ${
                message.isCurrentUser
                  ? 'text-white'
                  : darkMode
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
              style={
                message.isCurrentUser
                  ? { background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)' }
                  : undefined
              }
            >
              {!message.isCurrentUser && (
                <p className="text-xs font-bold mb-1 opacity-80">{message.author}</p>
              )}
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p className={`text-xs mt-1 ${message.isCurrentUser ? 'text-white/70' : 'text-gray-500'}`}>
                {message.timestamp}
              </p>
            </div>

            {/* Analysis Badges */}
            {message.analysis && (
              <div className="flex flex-wrap gap-2 mt-2 max-w-[70%]">
                {/* Blocker Badges */}
                {message.analysis.blockers.map((blocker, idx) => (
                  <button
                    key={`blocker-${idx}`}
                    className={`px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-all duration-300 hover:shadow-lg animate-fadeIn ${
                      blocker.severity === 'high' ? 'animate-pulse' : ''
                    }`}
                    style={{ background: '#ef4444', animationDelay: `${idx * 100}ms` }}
                    title="Click to add to Blocker Dashboard"
                  >
                    🚨 Blocker: {blocker.text}
                  </button>
                ))}

                {/* Decision Badges */}
                {message.analysis.decisions.map((decision, idx) => (
                  <button
                    key={`decision-${idx}`}
                    className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium transition-all duration-300 hover:shadow-lg animate-fadeIn"
                    style={{ animationDelay: `${idx * 100}ms` }}
                    title="Click to add to Decision Log"
                  >
                    ✅ Decision: {decision.text}
                  </button>
                ))}

                {/* Action Badges */}
                {message.analysis.actions.map((action, idx) => (
                  <button
                    key={`action-${idx}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium transition-all duration-300 hover:shadow-lg animate-fadeIn"
                    style={{ animationDelay: `${idx * 100}ms` }}
                    title="Click to create task"
                  >
                    📝 Action: {action.text} → {action.assignee}
                  </button>
                ))}

                {/* Risk Badges */}
                {message.analysis.risks.map((risk, idx) => (
                  <button
                    key={`risk-${idx}`}
                    className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium transition-all duration-300 hover:shadow-lg animate-fadeIn"
                    style={{ animationDelay: `${idx * 100}ms` }}
                    title="Click to escalate"
                  >
                    ⚠️ Risk: {risk.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type message (type 'waiting for' to see analysis)..."
            className={`flex-1 px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            }`}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sending}
            className="px-4 py-3 rounded-lg text-white font-medium text-sm transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)' }}
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </button>
          <button
            className={`p-3 rounded-lg transition-all duration-200 ${
              darkMode
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title="Emoji picker"
          >
            <Smile className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          💡 Try typing: &quot;We are blocked waiting for...&quot; or &quot;We decided to...&quot; to see AI analysis
        </p>
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
