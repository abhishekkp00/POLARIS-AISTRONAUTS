#!/bin/bash

echo "🚀 POLARIS - Starting Services"
echo "======================================\\"

# Change to project root
cd /home/abhishek/POLARIS

# Kill existing
pkill -9 -f "node.*server.js" 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
sleep 2

# Start backend
echo "📡 Starting Backend (Port 3001)..."
cd backend
nohup node server.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

sleep 3

# Start frontend
echo "🎨 Starting Frontend (Port 3000)..."
cd ../frontend
nohup npx next dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

sleep 5

echo ""
echo "======================================"
echo "✅ POLARIS IS RUNNING!"
echo "======================================"
echo ""
echo "🌐 Access:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001/api"
echo ""
echo "📝 Logs:"
echo "   tail -f logs/backend.log"
echo "   tail -f logs/frontend.log"
echo ""
echo "🔐 Login with:"
echo "   priya@taskmuse.com / password123"
echo ""
echo "======================================"
echo ""

# Test backend
if curl -s http://localhost:3001/api/health | grep -q '"success":true'; then
    echo "✅ Backend: ONLINE"
else
    echo "⚠️  Backend: Check logs/backend.log"
fi

# Test frontend (wait a bit more)
sleep 3
if lsof -i:3000 | grep -q LISTEN; then
    echo "✅ Frontend: ONLINE"
else
    echo "⚠️  Frontend: Still starting, check logs/frontend.log"
fi

echo ""
