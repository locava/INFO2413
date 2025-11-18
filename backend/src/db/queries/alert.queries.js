// src/db/queries/alert.queries.js
const { query } = require('../../config/db');

async function createAlert({
  type,
  message,
  studentId,
  courseId,
  triggeredByUserId,
}) {
  const res = await query(
    `
    INSERT INTO alerts (type, message, student_id, course_id, triggered_by_user_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [type, message, studentId, courseId, triggeredByUserId]
  );

  return res.rows[0];
}

// Optional helpers for later if you want them
async function getAlertsForStudent(studentId) {
  const res = await query(
    `
    SELECT *
    FROM alerts
    WHERE student_id = $1
    ORDER BY created_at DESC
    `,
    [studentId]
  );
  return res.rows;
}

async function getAlertsForCourse(courseId) {
  const res = await query(
    `
    SELECT *
    FROM alerts
    WHERE course_id = $1
    ORDER BY created_at DESC
    `,
    [courseId]
  );
  return res.rows;
}

module.exports = {
  createAlert,
  getAlertsForStudent,
  getAlertsForCourse,
};
