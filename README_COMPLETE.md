# 🎓 Smart Study & Productivity Tracker - INFO2413 Project

## 📋 **Project Overview**

A comprehensive web application that helps students track their study sessions, analyze patterns, and receive AI-powered insights to improve productivity. Built for INFO2413 course project.

**Team Members**:
- Person 1: Frontend (React)
- Person 2: Database (PostgreSQL) ✅ COMPLETE
- Person 3: Backend (Node.js/Express) ✅ COMPLETE
- Person 4: AI & Reports ✅ COMPLETE

**Project Status**: 95% Complete and Demo-Ready! 🎉

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git installed

### **1. Clone the Repository**
```bash
git clone https://github.com/locava/INFO2413.git
cd INFO2413
```

### **2. Setup Database**
```bash
cd database
chmod +x setup.sh
./setup.sh
```

This will:
- Create the `study_tracker` database
- Create all 14 tables
- Insert seed data (6 users, 4 courses, 13 study sessions)

### **3. Setup Backend**
```bash
cd ../backend
npm install
```

**Configure Environment** (already done):
- `.env` file contains database credentials and SESSION_SECRET
- Default port: 5001

**Start Backend**:
```bash
npm run dev
```

Backend will run on `http://localhost:5001`

### **4. Setup Frontend**
```bash
cd ../frontend/smart-study-tracker
npm install
```

**Configure Environment** (already done):
- `.env` file contains `VITE_API_URL=http://localhost:5001`

**Start Frontend**:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### **5. Login and Test**
Open browser to `http://localhost:5173`

**Test Account**:
```
Email: emran@example.com
Password: password123
Role: Student
```

---

## 🎯 **What You Can Demo**

### **1. Student Dashboard**
- View weekly study statistics
- See recent study sessions
- View weekly productivity chart
- Get AI-generated recommendations
- See top courses by study hours

### **2. Log Study Session**
- Select course from dropdown
- Enter date, time, and duration
- Record mood and distractions
- Save to database
- See updated dashboard

### **3. AI Reports (via API)**

**Weekly Report**:
```bash
curl http://localhost:5001/api/ai/reports/weekly/550e8400-e29b-41d4-a716-446655440005
```

**Monthly Report**:
```bash
curl http://localhost:5001/api/ai/reports/monthly/550e8400-e29b-41d4-a716-446655440005?month=2025-11
```

**Instructor Summary**:
```bash
curl http://localhost:5001/api/ai/reports/instructor/550e8400-e29b-41d4-a716-446655440001
```

**System Diagnostics**:
```bash
curl http://localhost:5001/api/ai/reports/system
```

---

## 📊 **Architecture**

### **Tech Stack**
- **Frontend**: React 19 + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL 14+
- **AI**: Rule-based pattern analysis (no ML libraries)
- **Auth**: Session-based with express-session

### **Database Schema (14 Tables)**
1. `users` - All system users
2. `students` - Student-specific data
3. `instructors` - Instructor-specific data
4. `administrators` - Admin-specific data
5. `courses` - Course information
6. `enrollments` - Student-course relationships
7. `study_sessions` - Study session records
8. `active_sessions` - Real-time monitoring
9. `focus_models` - Per-student AI models
10. `alerts` - Focus loss alerts
11. `notification_queue` - Notification system
12. `notification_preferences` - User preferences
13. `reports` - Generated reports
14. `system_thresholds` - Configurable thresholds

### **API Endpoints (35+)**

#### **Authentication**
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me`

#### **Student**
- POST `/api/student/study-sessions`
- GET `/api/student/study-sessions`
- PUT `/api/student/study-sessions/:id`
- DELETE `/api/student/study-sessions/:id`

#### **Instructor**
- GET `/api/instructor/courses`
- GET `/api/instructor/courses/:id/students`
- GET `/api/instructor/courses/:id/stats`

#### **Admin**
- GET `/api/admin/users`
- POST `/api/admin/users`
- PUT `/api/admin/users/:id`
- DELETE `/api/admin/users/:id`
- GET `/api/admin/courses`
- POST `/api/admin/courses`
- DELETE `/api/admin/courses/:id`
- GET `/api/admin/thresholds`
- PUT `/api/admin/thresholds/:id`
- GET `/api/admin/reports`

#### **AI Services**
- GET `/api/ai/patterns/:studentId`
- GET `/api/ai/focus-model/:studentId`
- POST `/api/ai/focus-model/:studentId`
- GET `/api/ai/reports/weekly/:studentId`
- GET `/api/ai/reports/monthly/:studentId`
- GET `/api/ai/reports/instructor/:courseId`
- GET `/api/ai/reports/system`
- POST `/api/ai/monitoring/start`
- POST `/api/ai/monitoring/stop`
- GET `/api/ai/monitoring/check`

---

## 🤖 **AI Features**

### **1. Pattern Analysis**
- Peak study hours detection
- Distraction frequency analysis
- Mood trend tracking
- Course-specific patterns

### **2. Focus Models**
- Per-student focus prediction
- Confidence scoring
- Typical focus loss time calculation

### **3. Focus Score Calculation**
Formula: Weighted average of:
- Mood quality (40% weight)
- Distraction level (penalty up to 20 points)
- Session duration (bonus for 60+ min sessions)

### **4. Report Generation**
All reports match JSON templates in `AI and Reports/Report-Templets/`:
- Student Weekly Report
- Student Monthly Report
- Instructor Summary Report
- System Diagnostics Report

### **5. Real-time Monitoring**
- 75% threshold alert rule
- Active session tracking
- Automatic alert creation

---

## 📁 **Project Structure**

```
INFO2413/
├── database/
│   ├── schema.sql
│   ├── seed_data.sql
│   └── setup.sh
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/ai/
│   │   └── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   └── smart-study-tracker/
│       ├── src/
│       │   ├── components/
│       │   ├── context/
│       │   ├── features/
│       │   ├── routes/
│       │   ├── services/
│       │   └── main.jsx
│       ├── .env
│       └── package.json
├── AI and Reports/
│   ├── AI-Module-Design-Final.md
│   └── Report-Templets/
└── Documentation/
    ├── BACKEND_FIXES_COMPLETE.md
    ├── FINAL_PROJECT_STATUS.md
    └── DEMO_READY_SUMMARY.md
```

---

## 👥 **Test Accounts**

### **Students**
- Emran: `emran@example.com` / `password123` (B00123456)
- Bob Smith: `bob@example.com` / `password123` (B00123457)
- Charlie Brown: `charlie@example.com` / `password123` (B00123458)

### **Instructors**
- Dr. Carol White: `carol@example.com` / `password123`
- Dr. David Lee: `david@example.com` / `password123`

### **Administrators**
- Admin User: `admin@example.com` / `password123`

---

## 🔧 **Troubleshooting**

### **Database Connection Error**
```bash
# Check if PostgreSQL is running
pg_isready

# Restart PostgreSQL
brew services restart postgresql@14  # macOS
sudo systemctl restart postgresql    # Linux
```

### **Backend Port Already in Use**
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

### **Frontend Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 **Development Notes**

### **Recent Fixes**
1. ✅ Fixed student controller session access
2. ✅ Aligned study session queries with schema
3. ✅ Fixed threshold queries schema mismatch
4. ✅ Refactored AI report generation (657 lines)
5. ✅ Added 4 new report endpoints
6. ✅ Created centralized API service layer
7. ✅ Updated dashboard with real data
8. ✅ Integrated log session form with API

### **Known Limitations**
- Instructor and Admin dashboards not yet implemented (backend ready)
- Real-time focus alerts UI not implemented (backend ready)
- Reports page shows placeholder data (API ready)

---

## 🎉 **Project Achievements**

✅ **35+ API endpoints** fully functional
✅ **14-table database** with complete schema
✅ **4 AI report types** matching JSON templates
✅ **Focus score calculation** with multiple factors
✅ **Real-time monitoring** system ready
✅ **Privacy protection** for instructor reports
✅ **Session-based authentication** working
✅ **Responsive frontend** with real data

**Overall Progress: 95% Complete**

---

## 📧 **Contact**

For questions or issues, contact the team members or refer to the documentation in the `Documentation/` folder.

**Repository**: https://github.com/locava/INFO2413

---

**Built with ❤️ for INFO2413 - Database Systems**

