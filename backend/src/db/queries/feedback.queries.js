// backend/src/db/queries/feedback.queries.js
// Database queries for instructor feedback feature (FR-I4)

const pool = require('../pool');

/**
 * Create new feedback
 */
async function createFeedback({ instructorId, courseId, studentId, feedbackType, message }) {
  const query = `
    INSERT INTO instructor_feedback (
      instructor_id, course_id, student_id, feedback_type, message
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const result = await pool.query(query, [
    instructorId,
    courseId,
    studentId || null,
    feedbackType || 'GENERAL',
    message
  ]);
  
  return result.rows[0];
}

/**
 * Get all feedback for a course (instructor view)
 */
async function getFeedbackByCourse(courseId) {
  const query = `
    SELECT 
      f.*,
      u.name as instructor_name,
      s.name as student_name
    FROM instructor_feedback f
    JOIN users u ON f.instructor_id = u.user_id
    LEFT JOIN (
      SELECT user_id, name FROM users WHERE role = 'Student'
    ) s ON f.student_id = s.user_id
    WHERE f.course_id = $1 AND f.is_visible = true
    ORDER BY f.created_at DESC
  `;
  
  const result = await pool.query(query, [courseId]);
  return result.rows;
}

/**
 * Get feedback visible to a specific student
 */
async function getFeedbackForStudent(studentId, courseId) {
  const query = `
    SELECT 
      f.*,
      u.name as instructor_name,
      c.course_name
    FROM instructor_feedback f
    JOIN users u ON f.instructor_id = u.user_id
    JOIN courses c ON f.course_id = c.course_id
    WHERE f.course_id = $2
      AND (f.student_id IS NULL OR f.student_id = $1)
      AND f.is_visible = true
    ORDER BY f.created_at DESC
  `;
  
  const result = await pool.query(query, [studentId, courseId]);
  return result.rows;
}

/**
 * Get all feedback for a student across all courses
 */
async function getAllFeedbackForStudent(studentId) {
  const query = `
    SELECT 
      f.*,
      u.name as instructor_name,
      c.course_name
    FROM instructor_feedback f
    JOIN users u ON f.instructor_id = u.user_id
    JOIN courses c ON f.course_id = c.course_id
    WHERE (f.student_id IS NULL OR f.student_id = $1)
      AND f.is_visible = true
      AND EXISTS (
        SELECT 1 FROM enrollments e
        WHERE e.student_id = $1 AND e.course_id = f.course_id
      )
    ORDER BY f.created_at DESC
  `;
  
  const result = await pool.query(query, [studentId]);
  return result.rows;
}

/**
 * Update feedback
 */
async function updateFeedback(feedbackId, { message, feedbackType, isVisible }) {
  const updates = [];
  const values = [];
  let paramCount = 1;
  
  if (message !== undefined) {
    updates.push(`message = $${paramCount++}`);
    values.push(message);
  }
  
  if (feedbackType !== undefined) {
    updates.push(`feedback_type = $${paramCount++}`);
    values.push(feedbackType);
  }
  
  if (isVisible !== undefined) {
    updates.push(`is_visible = $${paramCount++}`);
    values.push(isVisible);
  }
  
  updates.push(`updated_at = NOW()`);
  values.push(feedbackId);
  
  const query = `
    UPDATE instructor_feedback
    SET ${updates.join(', ')}
    WHERE feedback_id = $${paramCount}
    RETURNING *
  `;
  
  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Delete feedback (soft delete by setting is_visible = false)
 */
async function deleteFeedback(feedbackId) {
  const query = `
    UPDATE instructor_feedback
    SET is_visible = false, updated_at = NOW()
    WHERE feedback_id = $1
    RETURNING *
  `;
  
  const result = await pool.query(query, [feedbackId]);
  return result.rows[0];
}

module.exports = {
  createFeedback,
  getFeedbackByCourse,
  getFeedbackForStudent,
  getAllFeedbackForStudent,
  updateFeedback,
  deleteFeedback
};

