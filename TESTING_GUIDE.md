# 🧪 Complete Testing Guide - Smart Study & Productivity Tracker

## 🚀 Quick Start

### **Step 1: Start All Services**

Open 3 terminal windows:

#### **Terminal 1: Database**
```bash
cd database
./setup.sh
# Wait for "Database setup complete!"
```

#### **Terminal 2: Backend**
```bash
cd backend
npm run dev
# Wait for "Server listening on port 5001"
```

#### **Terminal 3: Frontend**
```bash
cd frontend/smart-study-tracker
npm run dev
# Wait for "Local: http://localhost:5173"
```

---

## 🧪 **Test Scenarios**

### **✅ Test 1: Student Complete Flow (5 minutes)**

#### **1.1 Login as Student**
1. Open browser: http://localhost:5173
2. Click "Login" (or you're already on login page)
3. Enter credentials:
   - Email: `emran@example.com`
   - Password: `password123`
4. Click "Login"

**Expected Result:**
- ✅ Redirects to `/student/dashboard`
- ✅ Shows "Welcome, Emran"
- ✅ Shows weekly stats (hours, sessions, focus score)
- ✅ Shows recent sessions table
- ✅ Shows weekly hours chart
- ✅ Shows AI recommendations

#### **1.2 Log a New Study Session**
1. Click "Quick Log Session" button
2. Fill in the form:
   - Course: Select "INFO 2413"
   - Date: Today's date
   - Start Time: "14:00"
   - Duration: "60" minutes
   - Mood: "Focused"
   - Distractions: "None"
   - Notes: "Completed assignment 3"
3. Click "Save Session"

**Expected Result:**
- ✅ Shows success message
- ✅ Redirects to dashboard
- ✅ Dashboard updates with new session
- ✅ Weekly stats update

#### **1.3 View Weekly Report**
1. Click "Reports" in sidebar
2. Ensure "Weekly" is selected

**Expected Result:**
- ✅ Shows summary cards (total hours, sessions, focus score)
- ✅ Shows daily breakdown with dates and focus scores
- ✅ Shows top courses chart
- ✅ Shows distractions list
- ✅ Shows AI recommendations (purple gradient boxes)

#### **1.4 View Monthly Report**
1. Click "Monthly" tab
2. Select current month from dropdown

**Expected Result:**
- ✅ Shows monthly overview (total hours, trend, mood trend)
- ✅ Shows hours per week bar chart
- ✅ Shows weekly focus scores (color-coded: green ≥75, yellow ≥50, red <50)
- ✅ Shows common distractions
- ✅ Shows monthly recommendations
- ✅ Shows analysis notes

---

### **✅ Test 2: Instructor Complete Flow (3 minutes)**

#### **2.1 Logout and Login as Instructor**
1. Click "Logout" button
2. Login with:
   - Email: `carol@example.com`
   - Password: `password123`

**Expected Result:**
- ✅ Redirects to `/instructor/dashboard`
- ✅ Shows "Welcome, Carol White"

#### **2.2 View Course Analytics**
1. See course selector dropdown
2. Select "INFO 2413 - Database Systems"

**Expected Result:**
- ✅ Shows average hours per student
- ✅ Shows average focus score
- ✅ Shows at-risk students (if any)
- ✅ Shows daily engagement chart
- ✅ Shows common distractions
- ✅ Shows AI action suggestions

#### **2.3 Test Privacy Protection**
1. If course has < 5 students:
   - ✅ Shows privacy notice
   - ✅ Hides detailed analytics

---

### **✅ Test 3: Admin Complete Flow (3 minutes)**

#### **3.1 Logout and Login as Admin**
1. Click "Logout" button
2. Login with:
   - Email: `admin@example.com`
   - Password: `password123`

**Expected Result:**
- ✅ Redirects to `/admin/dashboard`
- ✅ Shows "Welcome, System Administrator"

#### **3.2 View System Diagnostics**

**Expected Result:**
- ✅ Shows total users count
- ✅ Shows students count
- ✅ Shows instructors count
- ✅ Shows AI system status:
  - AI version
  - Models trained
  - Last training run
  - Avg check latency
- ✅ Shows alerts (last 7 days)
- ✅ Shows notification queue:
  - Sent (green)
  - Pending (yellow)
  - Failed (red)
- ✅ Shows data quality metrics
- ✅ Shows system notes

---

### **✅ Test 4: Role-Based Access Control (2 minutes)**

#### **4.1 Test Student Access**
1. Login as student (`emran@example.com`)
2. Try to access: http://localhost:5173/instructor/dashboard

**Expected Result:**
- ✅ Automatically redirects to `/student/dashboard`

#### **4.2 Test Instructor Access**
1. Login as instructor (`carol@example.com`)
2. Try to access: http://localhost:5173/admin/dashboard

**Expected Result:**
- ✅ Automatically redirects to `/instructor/dashboard`

---

### **✅ Test 5: Registration Flow (2 minutes)**

#### **5.1 Register New Student**
1. Logout
2. Click "Register" link
3. Fill in form:
   - First Name: "Test"
   - Last Name: "Student"
   - Email: "test@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
   - Role: "Student"
   - Student Number: (leave blank for auto-generation)
4. Check "I agree to Terms"
5. Click "Register"

**Expected Result:**
- ✅ Shows success message
- ✅ Redirects to login page
- ✅ Can login with new credentials

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: Backend not connecting**
**Solution:**
```bash
cd backend
npm install
npm run dev
```

### **Issue 2: Frontend not loading**
**Solution:**
```bash
cd frontend/smart-study-tracker
npm install
npm run dev
```

### **Issue 3: Database connection error**
**Solution:**
```bash
cd database
./setup.sh
```

### **Issue 4: "No data available"**
**Solution:**
- Make sure seed data is loaded
- Check backend console for errors
- Verify database is running

---

## ✅ **Checklist for Demo**

Before presenting to professor:

- [ ] All 3 services running (database, backend, frontend)
- [ ] Can login as student
- [ ] Can login as instructor
- [ ] Can login as admin
- [ ] Student dashboard shows real data
- [ ] Student can log sessions
- [ ] Student reports show AI insights
- [ ] Instructor sees course analytics
- [ ] Admin sees system diagnostics
- [ ] No console errors
- [ ] All pages responsive
- [ ] Role-based routing works

---

## 📊 **Test Accounts**

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Student | emran@example.com | password123 | Student Dashboard |
| Student | bob@example.com | password123 | Student Dashboard |
| Instructor | carol@example.com | password123 | Instructor Dashboard |
| Instructor | dave@example.com | password123 | Instructor Dashboard |
| Admin | admin@example.com | password123 | Admin Dashboard |

---

## 🎉 **Success!**

If all tests pass, your project is **100% complete and demo-ready!**

