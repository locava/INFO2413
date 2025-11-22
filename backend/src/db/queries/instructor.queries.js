// backend/src/db/queries/instructor.queries.js
const pool = require('../pool');

const instructorQueries = {
  // Used by: Instructor Dashboard (Get my courses)
  getCoursesByInstructorId: async (userId) => {
    const query = `
      SELECT * FROM courses 
      WHERE instructor_id = $1 AND is_deleted = false
      ORDER BY course_code ASC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  // Used by: Instructor Dashboard (Get students in my course)
  getStudentsByCourseId: async (courseId) => {
    const query = `
      SELECT 
        s.student_id,
        u.name,
        u.email,
        e.enrolled_at
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      WHERE e.course_id = $1
      ORDER BY u.name ASC
    `;
    const result = await pool.query(query, [courseId]);
    return result.rows;
  },

  // Used by: Instructor Reports (Get aggregate data)
  getCourseStats: async (courseId) => {
    // Placeholder for basic stats (count of students)
    const query = `
      SELECT COUNT(*) as student_count 
      FROM enrollments 
      WHERE course_id = $1
    `;
    const result = await pool.query(query, [courseId]);
    return result.rows[0];
  }
};

module.exports = instructorQueries;