#!/bin/bash

# ============================================
# Database Population Script
# ============================================
# This script populates the database with seed data
# Usage: ./populate.sh

echo "🗄️  Populating Smart Study Tracker Database..."
echo ""

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running!"
    echo "Please start PostgreSQL and try again."
    exit 1
fi

# Database connection details
DB_NAME="study_tracker"
DB_USER="postgres"

echo "📊 Database: $DB_NAME"
echo "👤 User: $DB_USER"
echo ""

# Check if database exists
if ! psql -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "❌ Database '$DB_NAME' does not exist!"
    echo "Please create it first:"
    echo "  psql -U postgres -c \"CREATE DATABASE $DB_NAME;\""
    exit 1
fi

# Run seed data
echo "🌱 Inserting seed data..."
psql -U $DB_USER -d $DB_NAME -f seed_data.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database populated successfully!"
    echo ""
    echo "📝 Sample Login Credentials:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Admin:"
    echo "  Email: admin@studytracker.com"
    echo "  Password: password123"
    echo ""
    echo "Instructor:"
    echo "  Email: sarah.johnson@studytracker.com"
    echo "  Password: password123"
    echo ""
    echo "Student:"
    echo "  Email: john.smith@student.com"
    echo "  Password: password123"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo ""
    echo "❌ Failed to populate database!"
    echo "Check the error messages above."
    exit 1
fi

