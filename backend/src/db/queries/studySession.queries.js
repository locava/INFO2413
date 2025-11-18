// src/db/queries/studySession.queries.js
const { query } = require('../../config/db');

// CREATE
async function createStudySession({ studentId, courseId, startTime, endTime, mood, distractions }) {
  const res = await query(
    `
    INSERT INTO study_sessions
      (student_id, course_id, start_time, end_time, mood, distractions)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [studentId, courseId, startTime, endTime, mood, distractions]
  );

  return res.rows[0];
}

// READ (student)
async function getStudySessionsByStudent(studentId) {
  const res = await query(
    `
    SELECT *
    FROM study_sessions
    WHERE student_id = $1
      AND deleted_at IS NULL
    ORDER BY start_time DESC
    `,
    [studentId]
  );

  return res.rows;
}

// UPDATE
async function updateStudySession({ studentId, sessionId, startTime, endTime, mood, distractions }) {
  const res = await query(
    `
    UPDATE study_sessions
    SET
      start_time = $3,
      end_time = $4,
      mood = $5,
      distractions = $6
    WHERE id = $1
      AND student_id = $2
    RETURNING *
    `,
    [sessionId, studentId, startTime, endTime, mood, distractions]
  );

  return res.rows[0];
}

// SOFT DELETE
async function softDeleteStudySession(studentId, sessionId) {
  await query(
    `
    UPDATE study_sessions
    SET deleted_at = NOW()
    WHERE id = $1
      AND student_id = $2
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
