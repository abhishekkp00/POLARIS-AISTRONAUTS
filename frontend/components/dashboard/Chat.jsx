'use client'

import { useState, useEffect, useRef } from 'react'

const DEMO_MESSAGES = [
  {
    id: 1,
    author: 'Priya',
    text: 'Backend API is ready!',
    timestamp: '2:15 PM',
    isMe: false,
    analysis: { isDecision: true, type: 'decision', text: 'Backend API is ready!' }
  },
  {
    id: 2,
    author: 'Rahul',
    text: 'Waiting for API docs',
    timestamp: '2:18 PM',
    isMe: false,
    analysis: { isBlocker: true, type: 'blocker', blocker: 'API docs', severity: 'medium' }
  },
  {
    id: 3,
    author: 'Priya',
    text: 'Sarah should test API endpoints',
    timestamp: '2:22 PM',
    isMe: false,
    analysis: { isAction: true, type: 'action', assignee: 'Sarah', action: 'test API endpoints' }
  },
  {
    id: 4,
    author: 'David',
    text: 'Database issues found in production',
    timestamp: '2:28 PM',
    isMe: false,
    analysis: { isRisk: true, type: 'risk', risk: 'Database issues', severity: 'high' }
  },
  {
    id: 5,
    author: 'Rahul',
    text: 'All systems ready to go!',
    timestamp: '2:34 PM',
    isMe: false,
    analysis: { isDecision: true, type: 'decision', text: 'All systems ready to go!' }
  },
]

const analyzeMessage = (text) => {
  const analysis = {}
  const lowerText = text.toLowerCase()

  // Blocker detection
  const blockerKeywords = ['waiting for', 'blocked by', 'stuck on', 'need', 'missing', 'cant', "can't", 'unable to']
  if (blockerKeywords.some(keyword => lowerText.includes(keyword))) {
    analysis.isBlocker = true
    analysis.type = 'blocker'
    analysis.blocker = text
    analysis.severity = lowerText.includes('urgent') || lowerText.includes('critical') ? 'high' : 'medium'
  }

  // Decision detection
  const decisionKeywords = ['decided', 'will use', 'going with', 'approved', 'ready', 'done', 'completed', 'shipped']
  if (decisionKeywords.some(keyword => lowerText.includes(keyword))) {
    analysis.isDecision = true
    analysis.type = 'decision'
    analysis.text = text
  }

  // Action detection
  const actionKeywords = ['should', 'need to', 'must', 'have to', 'please', 'can you', 'could you']
  if (actionKeywords.some(keyword => lowerText.includes(keyword))) {
    analysis.isAction = true
    analysis.type = 'action'
    analysis.action = text
  }

  // Risk detection
  const riskKeywords = ['issue', 'problem', 'error', 'bug', 'broken', 'fail', 'crash', 'down', 'risk']
  if (riskKeywords.some(keyword => lowerText.includes(keyword))) {
    analysis.isRisk = true
    analysis.type = 'risk'
    analysis.risk = text
    analysis.severity = lowerText.includes('critical') || lowerText.includes('urgent') ? 'high' : 'medium'
  }

  return Object.keys(analysis).length > 0 ? analysis : null
}

export default function Chat({ darkMode, messages: socketMessages = [], onSendMessage, isConnected = true }) {
  const [localMessages, setLocalMessages] = useState(DEMO_MESSAGES)
  const [inputText, setInputText] = useState('')
  const [isExpanded, setIsExpanded] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Merge socket messages with demo messages
  useEffect(() => {
    if (socketMessages && socketMessages.length > 0) {
      setLocalMessages(prev => {
        const newMessages = socketMessages.filter(sm => 
          !prev.some(pm => pm.id === sm.id)
        )
        return [...prev, ...newMessages]
      })
    }
  }, [socketMessages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages])

  const handleSend = () => {
    if (!inputText.trim()) return

    const newMessage = {
      id: Date.now(),
      author: 'You',
      text: inputText,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      analysis: analyzeMessage(inputText)
    }

    setLocalMessages(prev => [...prev, newMessage])

    // Emit to Socket.io
    if (onSendMessage) {
      onSendMessage(inputText)
    }

    setInputText('')
    inputRef.current?.focus()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isExpanded) {
    return (
      <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg p-4 shadow-lg`}>
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-between hover:opacity-80 transition-all"
        >
          <span className="text-lg font-semibold">💬 Team Chat</span>
          <span className="text-2xl">⬆️</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden flex flex-col h-[500px]`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-slate-700' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <h3 className="font-semibold">Team Chat</h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-1 text-sm">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
            <span className="text-xs">{isConnected ? 'Connected' : 'Reconnecting...'}</span>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="hover:bg-white/20 rounded-full p-1 transition-all"
          >
            <span className="text-xl">⬇️</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        {localMessages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`max-w-[80%] ${message.isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              {/* Author & Time */}
              {!message.isMe && (
                <div className="flex items-center gap-2 px-2">
                  <span className="text-2xl">
                    {message.author === 'Priya' ? '👩‍💼' : 
                     message.author === 'Rahul' ? '👨‍💻' : 
                     message.author === 'Sarah' ? '👩‍🎨' : 
                     message.author === 'David' ? '👨‍💻' : '👤'}
                  </span>
                  <span className="text-xs font-medium text-gray-500">{message.author}</span>
                  <span className="text-xs text-gray-400">{message.timestamp}</span>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`px-4 py-2 rounded-2xl ${
                  message.isMe
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none'
                    : darkMode
                    ? 'bg-slate-700 text-white rounded-bl-none'
                    : 'bg-white text-gray-900 rounded-bl-none shadow'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>

              {/* Analysis Badges */}
              {message.analysis && (
                <div className="flex flex-wrap gap-2 px-2 animate-slide-in-up">
                  {message.analysis.isBlocker && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
                      🚨 BLOCKER
                    </span>
                  )}
                  {message.analysis.isDecision && (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                      ✅ DECISION
                    </span>
                  )}
                  {message.analysis.isAction && (
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full flex items-center gap-1">
                      📝 ACTION
                    </span>
                  )}
                  {message.analysis.isRisk && (
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full flex items-center gap-1">
                      ⚠️ RISK
                    </span>
                  )}
                </div>
              )}

              {message.isMe && (
                <div className="px-2">
                  <span className="text-xs text-gray-400">{message.timestamp}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-t p-4`}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type message (try: 'waiting for API docs')..."
            className={`flex-1 px-4 py-2 rounded-lg ${
              darkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
            disabled={!isConnected}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || !isConnected}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
          >
            ✉️
          </button>
        </div>
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2">⚠️ Chat is offline. Reconnecting...</p>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
