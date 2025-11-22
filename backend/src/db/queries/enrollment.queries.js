// backend/src/db/queries/enrollment.queries.js
const pool = require('../pool');

const enrollmentQueries = {
  // Used by: Student Dashboard (Register for a course)
  enrollStudent: async (studentId, courseId) => {
    const query = `
      INSERT INTO enrollments (student_id, course_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await pool.query(query, [studentId, courseId]);
    return result.rows[0];
  },

  // Used by: Middleware (Check if already enrolled)
  checkEnrollment: async (studentId, courseId) => {
    const query = `
      SELECT * FROM enrollments 
      WHERE student_id = $1 AND course_id = $2
    `;
    const result = await pool.query(query, [studentId, courseId]);
    return result.rows[0];
  },

  // Used by: Student Dashboard (List my courses)
  getStudentEnrollments: async (studentId) => {
    const query = `
      SELECT 
        c.course_id, 
        c.course_code, 
        c.course_name, 
        c.description,
        u.name as instructor_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.course_id
      LEFT JOIN instructors i ON c.instructor_id = i.user_id
      LEFT JOIN users u ON i.user_id = u.user_id
      WHERE e.student_id = $1 AND c.is_deleted = false
    `;
    const result = await pool.query(query, [studentId]);
    return result.rows;
  },

  // Used by: Student (Drop a course)
  removeEnrollment: async (studentId, courseId) => {
    const query = `
      DELETE FROM enrollments 
      WHERE student_id = $1 AND course_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [studentId, courseId]);
    return result.rows[0];
  }
};

module.exports = enrollmentQueries;