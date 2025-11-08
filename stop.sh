#!/bin/bash

# Stop all TaskMuse servers

echo "🛑 Stopping TaskMuse servers..."

if [ -f .backend.pid ]; then
  BACKEND_PID=$(cat .backend.pid)
  kill $BACKEND_PID 2>/dev/null
  echo "✅ Backend stopped (PID: $BACKEND_PID)"
  rm .backend.pid
fi

if [ -f .frontend.pid ]; then
  FRONTEND_PID=$(cat .frontend.pid)
  kill $FRONTEND_PID 2>/dev/null
  echo "✅ Frontend stopped (PID: $FRONTEND_PID)"
  rm .frontend.pid
fi

# Cleanup any remaining processes
pkill -f "node server.js" 2>/dev/null
pkill -f "next dev" 2>/dev/null

echo "✅ All servers stopped"
