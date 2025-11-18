// src/db/queries/enrollment.queries.js
const { query } = require('../../config/db');

async function getStudentsInCourse(courseId) {
  const res = await query(
    `
    SELECT s.id AS student_id, u.name, u.email, s.student_number
    FROM enrollments e
    JOIN students s ON e.student_id = s.id
    JOIN users u ON s.user_id = u.id
    WHERE e.course_id = $1
    `,
    [courseId]
  );
  return res.rows;
}

module.exports = {
  getStudentsInCourse,
};
