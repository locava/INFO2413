const pool = require('../pool');

async function createStudySession({ studentId, courseId, date, startTime, durationMinutes, mood, distractions }) {
  const res = await pool.query(
    `
    INSERT INTO study_sessions (student_id, course_id, date, start_time, duration_minutes, mood, distractions)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [studentId, courseId, date, startTime, durationMinutes, mood, distractions]
  );
  return res.rows[0];
}

async function getStudySessionsByStudent(studentId) {
  const res = await pool.query(
    `
    SELECT
      ss.*,
      c.course_name,
      c.course_code
    FROM study_sessions ss
    LEFT JOIN courses c ON ss.course_id = c.course_id
    WHERE ss.student_id = $1 AND ss.is_deleted = false
    ORDER BY ss.date DESC, ss.start_time DESC
    `,
    [studentId]
  );
  return res.rows;
}

async function updateStudySession({ studentId, sessionId, date, startTime, durationMinutes, mood, distractions }) {
  const res = await pool.query(
    `
    UPDATE study_sessions
    SET date = $3, start_time = $4, duration_minutes = $5, mood = $6, distractions = $7
    WHERE session_id = $1 AND student_id = $2
    RETURNING *
    `,
    [sessionId, studentId, date, startTime, durationMinutes, mood, distractions]
  );
  return res.rows[0];
}

async function softDeleteStudySession(studentId, sessionId) {
  await pool.query(
    `
    UPDATE study_sessions
    SET is_deleted = true
    WHERE session_id = $1 AND student_id = $2
    `,
    [sessionId, studentId]
  );
  return true;
}

module.exports = {
  createStudySession,
  getStudySessionsByStudent,
  updateStudySession,
  softDeleteStudySession,
};