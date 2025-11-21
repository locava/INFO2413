-- ============================================
-- SEED DATA FOR SMART STUDY TRACKER
-- ============================================
-- This file populates the database with sample data for testing
-- Run this AFTER schema.sql

-- Clear existing data (in correct order due to foreign keys)
TRUNCATE TABLE study_sessions, enrollments, courses, students, instructors, users CASCADE;

-- ============================================
-- 1. USERS (with bcrypt hashed passwords)
-- ============================================
-- Password for all users: "password123"
-- Login credentials:
--   admin@studytracker.com / password123
--   sarah.johnson@studytracker.com / password123
--   michael.chen@studytracker.com / password123
--   john.smith@student.com / password123
--   emily.davis@student.com / password123
--   alex.martinez@student.com / password123

INSERT INTO users (user_id, name, email, password_hash, role, phone, dob, status, created_at) VALUES
-- Admin
('a0000000-0000-0000-0000-000000000001', 'Admin User', 'admin@studytracker.com', '$2b$10$u.5/ZdrlOiGZLsMvTS36fu/lp58aY3PcKqkBT56wDjygILeu78Afu', 'Administrator', '555-0001', '1985-01-01', 'Active', NOW()),

-- Instructors
('a0000000-0000-0000-0000-000000000002', 'Dr. Sarah Johnson', 'sarah.johnson@studytracker.com', '$2b$10$9iRAD/5NJgTAFoDTVxl1DOVCbrYNnGxOWa9mOhb3n7FNOr0Bp8u9K', 'Instructor', '555-0002', '1980-05-15', 'Active', NOW()),
('a0000000-0000-0000-0000-000000000003', 'Prof. Michael Chen', 'michael.chen@studytracker.com', '$2b$10$K0MYxAudSD.6ANpWRE24cuUnTFXCxiw/1J//rsk0YCi0y0HAC1Ubm', 'Instructor', '555-0003', '1978-08-22', 'Active', NOW()),

-- Students
('a0000000-0000-0000-0000-000000000004', 'John Smith', 'john.smith@student.com', '$2b$10$ihGpCo.QEO0/F8sJWe.zeuIQKipHy5j07AQqMY.4PzEvy.Z79nER.', 'Student', '555-0004', '2002-03-10', 'Active', NOW()),
('a0000000-0000-0000-0000-000000000005', 'Emily Davis', 'emily.davis@student.com', '$2b$10$pcxVWqeV5orhk/nQMGrqaOYidXGzjt7g7nZLkqETF7v5h./jv8zNS', 'Student', '555-0005', '2001-07-18', 'Active', NOW()),
('a0000000-0000-0000-0000-000000000006', 'Alex Martinez', 'alex.martinez@student.com', '$2b$10$.Cs8FKpNBQUm4HucEN8pTu.GueWYcSoOMkJs4g/uhQkY6nUH7z1VC', 'Student', '555-0006', '2003-11-25', 'Active', NOW());

-- ============================================
-- 2. INSTRUCTORS
-- ============================================
INSERT INTO instructors (user_id, instructor_number, department, office_location) VALUES
('a0000000-0000-0000-0000-000000000002', 'INST001', 'Computer Science', 'Building A, Room 301'),
('a0000000-0000-0000-0000-000000000003', 'INST002', 'Information Systems', 'Building B, Room 205');

-- ============================================
-- 3. STUDENTS
-- ============================================
INSERT INTO students (user_id, student_number, program, year_of_study) VALUES
('a0000000-0000-0000-0000-000000000004', 'S2024001', 'Computer Science', 2),
('a0000000-0000-0000-0000-000000000005', 'S2024002', 'Information Technology', 3),
('a0000000-0000-0000-0000-000000000006', 'S2024003', 'Software Engineering', 1);

-- ============================================
-- 4. COURSES
-- ============================================
INSERT INTO courses (course_id, course_code, course_name, instructor_id, credits, is_active) VALUES
('c0000000-0000-0000-0000-000000000001', 'CS101', 'Introduction to Programming', 'a0000000-0000-0000-0000-000000000002', 3, true),
('c0000000-0000-0000-0000-000000000002', 'CS201', 'Data Structures', 'a0000000-0000-0000-0000-000000000002', 4, true),
('c0000000-0000-0000-0000-000000000003', 'INFO2413', 'Systems Analysis and Design', 'a0000000-0000-0000-0000-000000000003', 3, true),
('c0000000-0000-0000-0000-000000000004', 'CS301', 'Database Systems', 'a0000000-0000-0000-0000-000000000003', 4, true);

-- ============================================
-- 5. ENROLLMENTS
-- ============================================
INSERT INTO enrollments (student_id, course_id, enrollment_date, status) VALUES
-- John Smith enrolled in 3 courses
('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', '2024-09-01', 'Active'),
('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', '2024-09-01', 'Active'),
('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', '2024-09-01', 'Active'),

-- Emily Davis enrolled in 2 courses
('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', '2024-09-01', 'Active'),
('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004', '2024-09-01', 'Active'),

-- Alex Martinez enrolled in 2 courses
('a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', '2024-09-01', 'Active'),
('a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', '2024-09-01', 'Active');

-- ============================================
-- 6. STUDY SESSIONS
-- ============================================
INSERT INTO study_sessions (session_id, student_id, course_id, date, duration_minutes, mood, distractions, notes, is_deleted) VALUES
-- John Smith's sessions (last 2 weeks)
('s0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', '2024-11-15', 90, 'Focused', 'Phone', 'Completed chapter 3', false),
('s0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', '2024-11-16', 120, 'Productive', NULL, 'Worked on assignment 2', false),
('s0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', '2024-11-17', 60, 'Tired', 'Social Media', 'Quick review', false),
('s0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', '2024-11-18', 75, 'Focused', NULL, 'Practice problems', false),
('s0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', '2024-11-19', 150, 'Very Productive', NULL, 'Finished project', false),
('s0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', '2024-11-20', 45, 'Distracted', 'Friends,Phone', 'Struggled to focus', false),

-- Emily Davis's sessions
('s0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', '2024-11-15', 100, 'Productive', NULL, 'Algorithm practice', false),
('s0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004', '2024-11-16', 80, 'Focused', 'Music', 'SQL queries', false),
('s0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', '2024-11-18', 120, 'Very Productive', NULL, 'Midterm prep', false),
('s0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004', '2024-11-20', 90, 'Focused', NULL, 'Database design', false),

-- Alex Martinez's sessions
('s0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', '2024-11-17', 60, 'Neutral', 'Phone', 'First programming assignment', false),
('s0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', '2024-11-19', 50, 'Tired', 'Work', 'Late night study', false),
('s0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', '2024-11-20', 70, 'Focused', NULL, 'Debugging practice', false);

-- ============================================
-- 7. SYSTEM THRESHOLDS
-- ============================================
INSERT INTO system_thresholds (threshold_name, threshold_value, description) VALUES
('min_weekly_hours', 10, 'Minimum recommended study hours per week'),
('focus_loss_percentage', 75, 'Percentage of typical focus time before alert'),
('low_mood_threshold', 3, 'Mood score below this triggers concern'),
('max_distraction_count', 5, 'Maximum distractions before intervention'),
('session_min_duration', 15, 'Minimum session duration in minutes to count');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Uncomment to verify data was inserted correctly

-- SELECT 'Users:', COUNT(*) FROM users;
-- SELECT 'Instructors:', COUNT(*) FROM instructors;
-- SELECT 'Students:', COUNT(*) FROM students;
-- SELECT 'Courses:', COUNT(*) FROM courses;
-- SELECT 'Enrollments:', COUNT(*) FROM enrollments;
-- SELECT 'Study Sessions:', COUNT(*) FROM study_sessions;
-- SELECT 'Thresholds:', COUNT(*) FROM system_thresholds;

COMMIT;

