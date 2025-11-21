# 🗄️ Database Setup Guide

## Smart Study & Productivity Tracker - PostgreSQL Database

---

## 📋 **Quick Start**

### **Option 1: Automated Setup (Recommended)**

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE study_tracker;"

# 2. Run the schema
psql -U postgres -d study_tracker -f schema.sql

# 3. Populate with seed data
./populate.sh
```

### **Option 2: Manual Setup**

```bash
# 1. Create database
psql -U postgres
CREATE DATABASE study_tracker;
\q

# 2. Run schema
psql -U postgres -d study_tracker -f schema.sql

# 3. Run seed data
psql -U postgres -d study_tracker -f seed_data.sql
```

---

## 🔑 **Sample Login Credentials**

All passwords are: `password123`

| Role | Email | Password |
|------|-------|----------|
| **Administrator** | admin@studytracker.com | password123 |
| **Instructor** | sarah.johnson@studytracker.com | password123 |
| **Instructor** | michael.chen@studytracker.com | password123 |
| **Student** | john.smith@student.com | password123 |
| **Student** | emily.davis@student.com | password123 |
| **Student** | alex.martinez@student.com | password123 |

---

## 📊 **Database Schema Overview**

### **Core Tables:**
- `users` - User accounts (Admin, Instructor, Student)
- `students` - Student-specific data
- `instructors` - Instructor-specific data
- `courses` - Course catalog
- `enrollments` - Student-course relationships
- `study_sessions` - Study session logs

### **AI & Monitoring:**
- `active_sessions` - Currently running sessions
- `focus_models` - AI focus prediction models
- `performance_records` - Student performance tracking

### **Notifications:**
- `alerts` - System alerts
- `notification_queue` - Notification delivery queue
- `notification_preferences` - User notification settings

### **Configuration:**
- `system_thresholds` - Configurable system thresholds
- `reports` - Generated reports storage

---

## 📦 **Seed Data Contents**

### **Users (6 total):**
- 1 Administrator
- 2 Instructors
- 3 Students

### **Courses (4 total):**
- CS101: Introduction to Programming
- CS201: Data Structures
- INFO2413: Systems Analysis and Design
- CS301: Database Systems

### **Enrollments (7 total):**
- John Smith: 3 courses
- Emily Davis: 2 courses
- Alex Martinez: 2 courses

### **Study Sessions (13 total):**
- Recent sessions from last 2 weeks
- Various moods and distractions
- Different durations (45-150 minutes)

### **System Thresholds (5 total):**
- Minimum weekly hours: 10
- Focus loss percentage: 75%
- Low mood threshold: 3
- Max distraction count: 5
- Session minimum duration: 15 minutes

---

## 🔧 **Useful Commands**

### **Verify Data:**
```sql
-- Check all tables
SELECT 'Users:', COUNT(*) FROM users;
SELECT 'Instructors:', COUNT(*) FROM instructors;
SELECT 'Students:', COUNT(*) FROM students;
SELECT 'Courses:', COUNT(*) FROM courses;
SELECT 'Enrollments:', COUNT(*) FROM enrollments;
SELECT 'Study Sessions:', COUNT(*) FROM study_sessions;
```

### **Reset Database:**
```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE IF EXISTS study_tracker;"
psql -U postgres -c "CREATE DATABASE study_tracker;"
psql -U postgres -d study_tracker -f schema.sql
psql -U postgres -d study_tracker -f seed_data.sql
```

### **Backup Database:**
```bash
pg_dump -U postgres study_tracker > backup_$(date +%Y%m%d).sql
```

### **Restore Database:**
```bash
psql -U postgres -d study_tracker < backup_20241121.sql
```

---

## 🐛 **Troubleshooting**

### **"Database does not exist"**
```bash
psql -U postgres -c "CREATE DATABASE study_tracker;"
```

### **"Permission denied"**
```bash
# Make sure you're using the correct PostgreSQL user
psql -U postgres
```

### **"Relation already exists"**
```bash
# Drop all tables first
psql -U postgres -d study_tracker -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
# Then run schema.sql again
```

### **"Password authentication failed"**
```bash
# Update your PostgreSQL password or use trust authentication
# Edit pg_hba.conf and change 'md5' to 'trust' for local connections
```

---

## 📝 **Notes for Person 3 (Backend Developer)**

✅ **Database is ready!** The schema is populated with:
- Real bcrypt password hashes (10 rounds)
- Sample users for all roles
- Sample courses and enrollments
- Sample study sessions with realistic data
- System thresholds configured

🔗 **Connection String:**
```
postgres://postgres:YOUR_PASSWORD@localhost:5432/study_tracker
```

Or use individual env vars (as in your current setup):
```
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=study_tracker
```

---

## 📞 **Need Help?**

Contact Person 2 (Database) or check the main project README.

