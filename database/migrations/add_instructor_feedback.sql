-- Migration: Add instructor_feedback table for FR-I4
-- Allows instructors to provide feedback and study tips to students

CREATE TABLE IF NOT EXISTS instructor_feedback (
  feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES instructors(user_id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(user_id) ON DELETE CASCADE, -- NULL for course-wide feedback
  feedback_type VARCHAR(50) DEFAULT 'GENERAL' CHECK (feedback_type IN ('GENERAL', 'STUDY_TIP', 'ENCOURAGEMENT', 'CONCERN')),
  message TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_feedback_course ON instructor_feedback(course_id, is_visible);
CREATE INDEX IF NOT EXISTS idx_feedback_student ON instructor_feedback(student_id, is_visible) WHERE student_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feedback_instructor ON instructor_feedback(instructor_id, created_at DESC);

-- Comments
COMMENT ON TABLE instructor_feedback IS 'Stores feedback and study tips from instructors to students';
COMMENT ON COLUMN instructor_feedback.student_id IS 'NULL for course-wide feedback, specific student_id for individual feedback';
COMMENT ON COLUMN instructor_feedback.feedback_type IS 'Type of feedback: GENERAL, STUDY_TIP, ENCOURAGEMENT, CONCERN';

