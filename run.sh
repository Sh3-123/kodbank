#!/bin/bash
# Start backend
cd frontend
npm run dev &
FRONTEND_PID=$!

cd ../backend
node server.js &
BACKEND_PID=$!

echo "Systems are running. Frontend on http://localhost:5173, Backend on http://localhost:5000"

# Wait for both processes
wait $FRONTEND_PID $BACKEND_PID
