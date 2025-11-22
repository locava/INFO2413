# 🎓 Smart Study & Productivity Tracker

**INFO2413 University Project** - A comprehensive study tracking and productivity analysis system with AI-powered insights.

## ✨ Features

- 📊 **Study Session Tracking** - Log and monitor study sessions with mood and distraction tracking
- 🤖 **AI-Powered Reports** - Weekly and monthly reports with personalized recommendations
- 👨‍🎓 **Student Dashboard** - Real-time stats, focus scores, and study patterns
- 👨‍🏫 **Instructor Dashboard** - Course analytics and at-risk student identification
- 🔔 **Smart Alerts** - Real-time notifications for focus loss and study patterns
- 📈 **Analytics & Insights** - Comprehensive data visualization and trend analysis

---

## 🚀 Quick Start (3 Steps)

### Prerequisites
- **Node.js** (v16 or higher)
- **Docker Desktop** (for database)
- **Git**

### Step 1: Clone & Install
```bash
git clone https://github.com/locava/INFO2413.git
cd INFO2413
npm run install:all
```

### Step 2: Start Database
```bash
npm run dev:db
```
Wait 10 seconds for database to initialize with schema and sample data.

### Step 3: Start Application
```bash
# Option A: Start backend and frontend separately
npm run dev:backend    # Terminal 1
npm run dev:frontend   # Terminal 2

# Option B: Start everything together
npm run dev:all
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001

---

## 🔑 Demo Accounts

### Student Account
- **Email**: `emran@example.com`
- **Password**: `password123`

### Instructor Account
- **Email**: `carol@example.com`
- **Password**: `password123`

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `password123`

---

## 📁 Project Structure

```
INFO2413/
├── frontend/smart-study-tracker/    # React + Vite frontend
├── backend/                         # Node.js + Express API
├── database/                        # PostgreSQL schema & seed data
├── AI and Reports/                  # AI design docs & templates
├── docker-compose.yml               # Database setup
└── package.json                     # Root dev scripts
```

---

## 🛠️ Available Commands

### Database
```bash
npm run dev:db          # Start PostgreSQL in Docker
npm run dev:db:stop     # Stop database
npm run dev:db:reset    # Reset database (delete all data)
npm run db:logs         # View database logs
npm run db:shell        # Open PostgreSQL shell
```

### Development
```bash
npm run dev:backend     # Start backend server (port 5001)
npm run dev:frontend    # Start frontend dev server (port 5173)
npm run dev:all         # Start everything together
```

### Installation
```bash
npm run install:all     # Install all dependencies (root + backend + frontend)
```

---

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` in the root and backend directories:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Default configuration works out of the box with Docker. No changes needed for local development.

### Database Configuration
The Docker setup automatically:
- ✅ Creates PostgreSQL database
- ✅ Runs schema migrations
- ✅ Seeds sample data
- ✅ Configures user accounts

**No pgAdmin or manual database setup required!**

---

## 📊 Tech Stack

### Frontend
- React 19
- React Router v7
- Vite
- CSS3

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Session Management

### Database
- PostgreSQL 14
- Docker containerized

### AI & Reports
- Custom focus score algorithm
- Weekly/monthly report generation
- Real-time alert system

---

## 🧪 Testing the Application

1. **Login** as student (emran@example.com)
2. **View Dashboard** - See weekly stats and focus scores
3. **Log Session** - Click "Quick Log Session" and add a study session
4. **View Reports** - Navigate to Reports page for AI insights
5. **Test Instructor** - Login as carol@example.com to see course analytics
6. **Test Admin** - Login as admin@example.com for system diagnostics

---

## 🐛 Troubleshooting

### Database won't start
```bash
# Check if Docker is running
docker ps

# Reset database
npm run dev:db:reset
```

### Backend can't connect to database
```bash
# Check database is running
npm run db:logs

# Verify .env file exists in backend/
ls -la backend/.env
```

### Port already in use
```bash
# Kill process on port 5001 (backend)
lsof -ti:5001 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

---

## 👥 Team

**INFO2413 Project Team**
- Person 1: Frontend Development
- Person 2: Database Design & Implementation
- Person 3: Backend API Development
- Person 4: AI & Reports Module

---

## 📄 License

MIT License - Academic Project for INFO2413

---

## 🎯 Project Status

✅ **100% Complete and Demo-Ready**

All features implemented and tested:
- ✅ User authentication and authorization
- ✅ Study session logging and tracking
- ✅ AI-powered weekly/monthly reports
- ✅ Student, Instructor, and Admin dashboards
- ✅ Real-time focus alerts
- ✅ Comprehensive analytics
- ✅ Docker-based database setup
- ✅ One-command deployment

**Ready for demonstration and grading!** 🎉

