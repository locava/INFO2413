// backend/src/db/queries/instructor.queries.js
const pool = require('../pool');

const instructorQueries = {
  // ✅ NEW: Used by Dropdowns (Student & Admin)
  getAllCourses: async () => {
    const query = `
      SELECT * FROM courses 
      ORDER BY course_code ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Used by: Instructor Dashboard (Get my courses)
  getCoursesByInstructorId: async (userId) => {
    const query = `
      SELECT * FROM courses 
      WHERE instructor_id = $1
      ORDER BY course_code ASC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  // Used by: Instructor Dashboard (Get students in my course)
  getStudentsByCourseId: async (courseId, filters = {}) => { // ✅ MODIFIED to accept filters
    let baseQuery = `
      SELECT
        s.user_id as student_id,
        s.student_number,
        u.name,
        u.email,
        e.enrolled_at
      FROM enrollments e
      JOIN students s ON e.student_id = s.user_id
      JOIN users u ON s.user_id = u.user_id
      WHERE e.course_id = $1
    `;
    const values = [courseId];
    let paramIndex = 2;
    
    // ✅ NEW: Name Search Filter
    if (filters.name) {
        baseQuery += ` AND u.name ILIKE $${paramIndex}`;
        values.push(`%${filters.name}%`);
        paramIndex++;
    }
    
    // NOTE: Academic performance search logic would be added here (e.g., JOIN performance_records)

    baseQuery += ` ORDER BY u.name ASC`;

    const result = await pool.query(baseQuery, values);
    return result.rows;
  },

  getStudentSessionsForCourse: async (studentId, courseId) => {
    const query = `
        SELECT
            ss.session_id,
            ss.date,
            ss.start_time,
            ss.duration_minutes,
            ss.mood,
            ss.distractions
        FROM study_sessions ss
        WHERE ss.student_id = $1 AND ss.course_id = $2 AND ss.is_deleted = false
        ORDER BY ss.date DESC;
    `;
    const result = await pool.query(query, [studentId, courseId]);
    return result.rows;
  },

  // Used by: Instructor Reports (Get aggregate data)
  getCourseStats: async (courseId) => {
    const query = `
      SELECT COUNT(*) as student_count 
      FROM enrollments 
      WHERE course_id = $1
    `;
    const result = await pool.query(query, [courseId]);
    return result.rows[0];
  }
};

// ✅ FIX: Create the missing alias
// The controller asks for 'getInstructorCourses', so we point it to 'getAllCourses'
// This ensures Students see ALL courses in the dropdown.
instructorQueries.getInstructorCourses = instructorQueries.getAllCourses;

// ✅ FIX: Create alias for getCourseStudents
instructorQueries.getCourseStudents = instructorQueries.getStudentsByCourseId;

// ✅ FIX: Create alias for getCourseReport
instructorQueries.getCourseReport = instructorQueries.getCourseStats;

instructorQueries.getStudentSessions = instructorQueries.getStudentSessionsForCourse;

module.exports = instructorQueries;