const pool = require('../pool');

const instructorQueries = {
  // Get all courses taught by a specific instructor
  getInstructorCourses: async (instructorId) => {
    const query = `
      SELECT c.course_id, c.code, c.title, c.description, 
             COUNT(e.student_id) as student_count
      FROM courses c
      LEFT JOIN enrollments e ON c.course_id = e.course_id
      WHERE c.instructor_id = $1 
      AND c.is_deleted = false
      GROUP BY c.course_id
      ORDER BY c.code ASC
    `;
    const result = await pool.query(query, [instructorId]);
    return result.rows;
  },

  // Get list of students enrolled in a specific course
  getCourseStudents: async (courseId) => {
    const query = `
      SELECT s.user_id, u.first_name, u.last_name, u.email, e.enrolled_at
      FROM enrollments e
      JOIN students s ON e.student_id = s.user_id
      JOIN users u ON s.user_id = u.user_id
      WHERE e.course_id = $1
      ORDER BY u.last_name ASC
    `;
    const result = await pool.query(query, [courseId]);
    return result.rows;
  },

  // Get detailed report for a specific course
  getCourseReport: async (courseId) => {
    const query = `
      SELECT COUNT(e.student_id) as total_students
      FROM enrollments e
      WHERE e.course_id = $1
    `;
    const result = await pool.query(query, [courseId]);
    return {
      courseId,
      stats: result.rows[0],
      message: "Detailed report logic pending AI module integration"
    };
  }
};

module.exports = instructorQueries;