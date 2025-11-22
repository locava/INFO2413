# 🚀 Setup Guide - Smart Study Tracker

This guide provides detailed setup instructions for different scenarios.

---

## ✅ Option 1: Quick Setup with Docker (Recommended)

**Prerequisites:**
- Node.js (v16+)
- Docker Desktop

### Steps:

1. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and start Docker Desktop

2. **Clone and Install**
   ```bash
   git clone https://github.com/locava/INFO2413.git
   cd INFO2413
   npm run install:all
   ```

3. **Start Everything**
   ```bash
   ./start.sh
   ```
   
   Or manually:
   ```bash
   npm run dev:db          # Start database
   # Wait 10 seconds
   npm run dev:backend     # Terminal 1
   npm run dev:frontend    # Terminal 2
   ```

4. **Access Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5001

---

## 🔧 Option 2: Manual PostgreSQL Setup (Without Docker)

If you can't use Docker, you can install PostgreSQL directly.

### macOS:

```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL
brew services start postgresql@14

# Create database
createdb smart_study_tracker

# Run schema and seed
cd database
psql -d smart_study_tracker -f schema.sql
psql -d smart_study_tracker -f seed_data.sql
```

### Windows:

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Install with default settings (remember the password!)
3. Open pgAdmin or psql
4. Create database: `smart_study_tracker`
5. Run `database/schema.sql`
6. Run `database/seed_data.sql`

### Linux (Ubuntu/Debian):

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb smart_study_tracker

# Run schema and seed
cd database
sudo -u postgres psql -d smart_study_tracker -f schema.sql
sudo -u postgres psql -d smart_study_tracker -f seed_data.sql
```

### Update Backend Configuration:

Edit `backend/.env`:
```env
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_study_tracker
```

---

## 🧪 Verify Setup

### Check Database Connection:

```bash
# Using Docker
npm run db:shell

# Using local PostgreSQL
psql -U postgres -d smart_study_tracker
```

### Test Query:
```sql
SELECT COUNT(*) FROM users;
-- Should return 6 (3 students + 2 instructors + 1 admin)
```

### Check Backend:
```bash
cd backend
npm run dev
```

Look for:
```
✅ Database connected successfully
📊 Database: smart_study_tracker
🚀 Server listening on port 5001
```

### Check Frontend:
```bash
cd frontend/smart-study-tracker
npm run dev
```

Should open on http://localhost:5173

---

## 🔑 Test Login

Try logging in with:
- **Email**: `emran@example.com`
- **Password**: `password123`

You should see the student dashboard with:
- Weekly stats
- Recent sessions
- Focus score chart
- AI recommendations

---

## 🐛 Troubleshooting

### Database won't start (Docker)

```bash
# Check Docker status
docker ps

# View logs
npm run db:logs

# Reset database
npm run dev:db:reset
```

### Backend can't connect to database

1. Check `.env` file exists in `backend/`
2. Verify database credentials
3. Test connection:
   ```bash
   psql -U postgres -d smart_study_tracker
   ```

### Port already in use

```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Kill process on port 5432 (PostgreSQL)
lsof -ti:5432 | xargs kill -9
```

### Frontend shows "Backend coming soon"

This means the backend is not running or not connected to database.

1. Start backend: `npm run dev:backend`
2. Check backend logs for database connection
3. Verify database is running

### No data showing in dashboard

1. Check if seed data was loaded:
   ```bash
   npm run db:shell
   SELECT * FROM users;
   ```

2. If empty, reload seed data:
   ```bash
   # Docker
   npm run dev:db:reset
   
   # Manual
   psql -d smart_study_tracker -f database/seed_data.sql
   ```

---

## 📊 Database Schema

The database includes these tables:
- `users` - All user accounts
- `students` - Student-specific data
- `instructors` - Instructor-specific data
- `courses` - Course information
- `enrollments` - Student-course relationships
- `study_sessions` - Logged study sessions
- `active_sessions` - Currently active sessions
- `focus_models` - AI focus tracking models
- `alerts` - System alerts
- `notification_queue` - Pending notifications
- `reports` - Generated AI reports

---

## 🎯 Next Steps

After successful setup:

1. **Test Student Features**
   - Login as student
   - Log a study session
   - View weekly/monthly reports
   - Check AI recommendations

2. **Test Instructor Features**
   - Login as instructor (carol@example.com)
   - View course analytics
   - Check at-risk students

3. **Test Admin Features**
   - Login as admin (admin@example.com)
   - View system diagnostics
   - Monitor all users

---

## 📞 Need Help?

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review `README.md` for quick reference
3. Check backend logs for error messages
4. Verify all prerequisites are installed

---

**Happy Studying! 🎓**

