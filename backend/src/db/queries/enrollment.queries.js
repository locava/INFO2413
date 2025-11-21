const pool = require('../pool');

const enrollmentQueries = {
  // Enroll a student in a course
  enrollStudent: async (studentId, courseId) => {
    const query = `
      INSERT INTO enrollments (student_id, course_id)
      VALUES ($1, $2)
      ON CONFLICT (student_id, course_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [studentId, courseId]);
    return result.rows[0];
  },

  // Get courses a student is enrolled in
  getStudentEnrollments: async (studentId) => {
    const query = `
      SELECT c.course_id, c.code, c.title, c.description, c.instructor_id
      FROM enrollments e
      JOIN courses c ON e.course_id = c.course_id
      WHERE e.student_id = $1 AND c.is_deleted = false
    `;
    const result = await pool.query(query, [studentId]);
    return result.rows;
  }
};

module.exports = enrollmentQueries;