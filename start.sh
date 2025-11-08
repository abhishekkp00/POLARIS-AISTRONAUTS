#!/bin/bash

# TaskMuse Quick Start Script
# Run this to start both servers at once

echo "🚀 Starting TaskMuse..."
echo ""

# Start backend in background
cd backend
echo "📡 Starting backend server..."
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend running (PID: $BACKEND_PID) - Logs: backend.log"
cd ..

# Wait for backend to start
sleep 3

# Start frontend in background  
cd frontend
echo "🎨 Starting frontend server..."
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend running (PID: $FRONTEND_PID) - Logs: frontend.log"
cd ..

echo ""
echo "============================================================"
echo "🎉 TaskMuse is running!"
echo "============================================================"
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "📝 View logs:"
echo "  tail -f backend.log"
echo "  tail -f frontend.log"
echo ""
echo "🛑 To stop servers:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo "  or run: ./stop.sh"
echo "============================================================"
echo ""
echo "🎯 Ready to demo! Open http://localhost:3000"
echo ""

# Save PIDs for stop script
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid
