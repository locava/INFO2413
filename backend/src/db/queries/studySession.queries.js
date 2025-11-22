const pool = require('../pool');

async function createStudySession({ studentId, courseId, startTime, endTime, mood, distractions }) {
  const res = await pool.query(
    `
    INSERT INTO study_sessions (student_id, course_id, start_time, end_time, mood, distractions)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [studentId, courseId, startTime, endTime, mood, distractions]
  );
  return res.rows[0];
}

async function getStudySessionsByStudent(studentId) {
  const res = await pool.query(
    `
    SELECT * FROM study_sessions
    WHERE student_id = $1 AND is_deleted = false
    ORDER BY start_time DESC
    `,
    [studentId]
  );
  return res.rows;
}

async function updateStudySession({ studentId, sessionId, startTime, endTime, mood, distractions }) {
  const res = await pool.query(
    `
    UPDATE study_sessions
    SET start_time = $3, end_time = $4, mood = $5, distractions = $6
    WHERE session_id = $1 AND student_id = $2
    RETURNING *
    `,
    [sessionId, studentId, startTime, endTime, mood, distractions]
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