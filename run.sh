#!/bin/bash

# POLARIS Quick Start Script
# Starts both backend and frontend servers

echo "🚀 Starting POLARIS..."
echo "======================================"
echo ""

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "node.*server.js" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 2

# Check if ports are free
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3001 still in use, killing..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 1
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 still in use, killing..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo "✅ Ports cleared"
echo ""

# Start backend
echo "📡 Starting Backend Server..."
cd /home/abhishek/POLARIS/backend
nohup npm start > /home/abhishek/POLARIS/backend.log 2>&1 &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"
echo "   Log: backend.log"

# Wait for backend
sleep 3

# Check backend health
BACKEND_CHECK=$(curl -s http://localhost:3001/api/health | grep -o '"success":true' || echo "")
if [ -n "$BACKEND_CHECK" ]; then
    echo "   ✅ Backend responding on http://localhost:3001"
else
    echo "   ⚠️  Backend may still be starting..."
fi
echo ""

# Start frontend
echo "🎨 Starting Frontend Server..."
cd /home/abhishek/POLARIS/frontend
nohup npm run dev > /home/abhishek/POLARIS/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"
echo "   Log: frontend.log"

# Wait for frontend
echo "   ⏳ Waiting for frontend to start..."
for i in {1..30}; do
    sleep 1
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "   ✅ Frontend responding on http://localhost:3000"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   ⚠️  Frontend taking longer than expected, check frontend.log"
    fi
done
echo ""

echo "======================================"
echo "🎉 POLARIS IS RUNNING!"
echo "======================================"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "📝 View Logs:"
echo "   tail -f backend.log"
echo "   tail -f frontend.log"
echo ""
echo "🔐 Demo Credentials:"
echo "   Email:    priya@taskmuse.com"
echo "   Password: password123"
echo ""
echo "🛑 To stop servers, run:"
echo "   ./stop.sh"
echo ""
echo "======================================"

# Save PIDs
echo $BACKEND_PID > /home/abhishek/POLARIS/.backend.pid
echo $FRONTEND_PID > /home/abhishek/POLARIS/.frontend.pid

cd /home/abhishek/POLARIS
