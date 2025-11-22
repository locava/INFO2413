#!/bin/bash

# Smart Study Tracker - Quick Start Script
# This script starts all services in the correct order

echo "🎓 Smart Study & Productivity Tracker"
echo "======================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo ""
    echo "📋 Please install Docker Desktop:"
    echo "   https://www.docker.com/products/docker-desktop"
    echo ""
    echo "After installing Docker, run this script again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start database (try both docker compose syntaxes)
echo "📊 Starting PostgreSQL database..."
if docker compose up -d > /dev/null 2>&1; then
    echo "✅ Database container started"
elif docker-compose up -d > /dev/null 2>&1; then
    echo "✅ Database container started"
else
    echo "❌ Failed to start database"
    echo "Please check Docker installation"
    exit 1
fi

echo "⏳ Waiting for database to initialize (15 seconds)..."
sleep 15

# Check if database is ready
if docker exec smart_study_db pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database is ready"
else
    echo "⚠️  Database is still initializing, waiting 10 more seconds..."
    sleep 10
fi

echo ""
echo "🚀 Starting backend and frontend..."
echo ""
echo "Backend will run on: http://localhost:5001"
echo "Frontend will run on: http://localhost:5173"
echo ""
echo "📋 Demo Accounts:"
echo "  Student:    emran@example.com / password123"
echo "  Instructor: carol@example.com / password123"
echo "  Admin:      admin@example.com / password123"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start backend and frontend concurrently
npx concurrently \
  --names "BACKEND,FRONTEND" \
  --prefix-colors "blue,green" \
  "cd backend && npm run dev" \
  "cd frontend/smart-study-tracker && npm run dev"

