#!/usr/bin/env bash
# start.sh — launch backend + frontend for local development
set -e

# Ensure backend .env exists
if [ ! -f backend/.env ]; then
  echo "[start] backend/.env not found — creating from .env.example"
  cp backend/.env.example backend/.env
  SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  sed -i "s/change_this_to_a_long_random_secret/$SECRET/" backend/.env
  echo "[start] Generated JWT_SECRET in backend/.env"
fi

# Install deps if node_modules are missing
if [ ! -d backend/node_modules ]; then
  echo "[start] Installing backend dependencies..."
  (cd backend && npm install)
fi

if [ ! -d frontend/node_modules ]; then
  echo "[start] Installing frontend dependencies..."
  (cd frontend && npm install)
fi

echo ""
echo "  Backend  → http://localhost:4000"
echo "  Frontend → http://localhost:5173"
echo ""

trap 'kill 0' SIGINT SIGTERM
(cd backend  && npm run dev) &
(cd frontend && npm run dev) &
wait
