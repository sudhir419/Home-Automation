#!/bin/bash
cd "$(dirname "$0")"

echo "=========================================================="
echo " Starting Full Smart Home System (Backend + Frontend)..."
echo "=========================================================="

# 1. Start Backend in background if not already running
if ! lsof -i:5001 > /dev/null 2>&1; then
    echo "Starting Central ESP32 Backend Server on port 5001 & MQTT broker on 1883..."
    (cd backend && npm start) &
    sleep 2
else
    echo "Backend already running on port 5001."
fi

# 2. Start Frontend Dev Server
echo "Starting Vite Frontend on http://localhost:5173/..."
open "http://localhost:5173/" 2>/dev/null || true
npm run dev -- --host 0.0.0.0
