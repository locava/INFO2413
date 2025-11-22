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
--   admin@example.com / password123
--   emran@example.com / password123
--   carol@example.com / password123
--   bob@example.com / password123

INSERT INTO users (user_id, name, email, password_hash, role, phone, dob, status, created_at) VALUES
-- Admin
('a0000000-0000-0000-0000-000000000001', 'System Administrator', 'admin@example.com', '$2b$10$u.5/ZdrlOiGZLsMvTS36fu/lp58aY3PcKqkBT56wDjygILeu78Afu', 'Administrator', '555-0001', '1985-01-01', 'Active', NOW()),

-- Instructors
('a0000000-0000-0000-0000-000000000002', 'Carol White', 'carol@example.com', '$2b$10$9iRAD/5NJgTAFoDTVxl1DOVCbrYNnGxOWa9mOhb3n7FNOr0Bp8u9K', 'Instructor', '555-0002', '1980-05-15', 'Active', NOW()),
('a0000000-0000-0000-0000-000000000003', 'Dave Brown', 'dave@example.com', '$2b$10$K0MYxAudSD.6ANpWRE24cuUnTFXCxiw/1J//rsk0YCi0y0HAC1Ubm', 'Instructor', '555-0003', '1978-08-22', 'Active', NOW()),

-- Students
('a0000000-0000-0000-0000-000000000004', 'Emran', 'emran@example.com', '$2b$10$ihGpCo.QEO0/F8sJWe.zeuIQKipHy5j07AQqMY.4PzEvy.Z79nER.', 'Student', '555-0004', '2002-03-10', 'Active', NOW()),
('a0000000-0000-0000-0000-000000000005', 'Matvii', 'matvii@example.com', '$2b$10$pcxVWqeV5orhk/nQMGrqaOYidXGzjt7g7nZLkqETF7v5h./jv8zNS', 'Student', '555-0005', '2001-07-18', 'Active', NOW()),
('a0000000-0000-0000-0000-000000000006', 'Divam', 'divam@example.com', '$2b$10$.Cs8FKpNBQUm4HucEN8pTu.GueWYcSoOMkJs4g/uhQkY6nUH7z1VC', 'Student', '555-0006', '2003-11-25', 'Active', NOW()),
('a0000000-0000-0000-0000-000000000007', 'Sep', 'sep@example.com', '$2b$10$rH3p7FZ3yGHxH3p7FZ3yGOqH3p7FZ3yGHxH3p7FZ3yGHxH3p7FZ3yG', 'Student', '555-0007', '2002-09-14', 'Active', NOW());

-- ============================================
-- 2. INSTRUCTORS
-- ============================================
INSERT INTO instructors (user_id, working_id, department) VALUES
('a0000000-0000-0000-0000-000000000002', 'INST001', 'Computer Science'),
('a0000000-0000-0000-0000-000000000003', 'INST002', 'Information Systems');

-- ============================================
-- 3. STUDENTS
-- ============================================
INSERT INTO students (user_id, student_number, program) VALUES
('a0000000-0000-0000-0000-000000000004', 'S2024001', 'Computer Science'),
('a0000000-0000-0000-0000-000000000005', 'S2024002', 'Information Technology'),
('a0000000-0000-0000-0000-000000000006', 'S2024003', 'Software Engineering'),
('a0000000-0000-0000-0000-000000000007', 'S2024004', 'Computer Science');

-- ============================================
-- 4. COURSES
-- ============================================
INSERT INTO courses (course_id, course_code, course_name, instructor_id, is_active) VALUES
('c0000000-0000-0000-0000-000000000001', 'CS101', 'Introduction to Programming', 'a0000000-0000-0000-0000-000000000002', true),
('c0000000-0000-0000-0000-000000000002', 'CS201', 'Data Structures', 'a0000000-0000-0000-0000-000000000002', true),
('c0000000-0000-0000-0000-000000000003', 'INFO2413', 'Systems Analysis and Design', 'a0000000-0000-0000-0000-000000000003', true),
('c0000000-0000-0000-0000-000000000004', 'CS301', 'Database Systems', 'a0000000-0000-0000-0000-000000000003', true);

-- ============================================
-- 5. ENROLLMENTS
-- ============================================
INSERT INTO enrollments (student_id, course_id) VALUES
-- Emran enrolled in 3 courses
('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001'),
('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002'),
('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003'),

-- Matvii enrolled in 2 courses
('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002'),
('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004'),

-- Divam enrolled in 2 courses
('a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001'),
('a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003'),

-- Sep enrolled in 2 courses
('a0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000001'),
('a0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000002');

-- ============================================
-- 6. STUDY SESSIONS
-- ============================================
INSERT INTO study_sessions (session_id, student_id, course_id, date, start_time, duration_minutes, mood, distractions, is_deleted) VALUES
-- Emran's sessions (last 2 weeks)
('s0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', '2024-11-15', '2024-11-15 14:00:00', 90, 'Focused', 'Phone', false),
('s0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', '2024-11-16', '2024-11-16 10:00:00', 120, 'Productive', NULL, false),
('s0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', '2024-11-17', '2024-11-17 20:00:00', 60, 'Tired', 'Social Media', false),
('s0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', '2024-11-18', '2024-11-18 15:30:00', 75, 'Focused', NULL, false),
('s0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', '2024-11-19', '2024-11-19 13:00:00', 150, 'Very Productive', NULL, false),
('s0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', '2024-11-20', '2024-11-20 18:00:00', 45, 'Distracted', 'Friends, Phone', false),

-- Matvii's sessions
('s0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', '2024-11-15', '2024-11-15 09:00:00', 100, 'Productive', NULL, false),
('s0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004', '2024-11-16', '2024-11-16 16:00:00', 80, 'Focused', 'Music', false),
('s0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', '2024-11-18', '2024-11-18 11:00:00', 120, 'Very Productive', NULL, false),
('s0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004', '2024-11-20', '2024-11-20 14:00:00', 90, 'Focused', NULL, false),

-- Divam's sessions
('s0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', '2024-11-17', '2024-11-17 19:00:00', 60, 'Neutral', 'Phone', false),
('s0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', '2024-11-19', '2024-11-19 22:00:00', 50, 'Tired', 'Work', false),
('s0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', '2024-11-20', '2024-11-20 16:00:00', 70, 'Focused', NULL, false);

-- ============================================
-- 7. SYSTEM THRESHOLDS
-- ============================================
INSERT INTO system_thresholds (name, value_numeric, value_text, is_critical) VALUES
('min_weekly_hours', 10.00, 'Minimum recommended study hours per week', false),
('focus_loss_percentage', 75.00, 'Percentage of typical focus time before alert', true),
('low_mood_threshold', 3.00, 'Mood score below this triggers concern', false),
('max_distraction_count', 5.00, 'Maximum distractions before intervention', false),
('session_min_duration', 15.00, 'Minimum session duration in minutes to count', false);

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

