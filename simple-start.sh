#!/bin/bash

# Simple start script for POLARIS

# Clean up
pkill -9 -f "node.*server.js" 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
sleep 1

# Start backend
echo "Starting backend..."
cd /home/abhishek/POLARIS/backend
node server.js &
sleep 3

# Start frontend  
echo "Starting frontend..."
cd /home/abhishek/POLARIS/frontend
npx next dev &

wait
