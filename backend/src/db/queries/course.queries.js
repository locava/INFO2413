const pool = require('../pool');

const courseQueries = {
  createCourse: async (courseData) => {
    // ✅ FIX: Use the key name sent by the frontend payload
    const { course_code, course_name, instructor_id } = courseData; 

    const query = `
      INSERT INTO courses (course_code, course_name, instructor_id, is_active)
      VALUES ($1, $2, $3, true)
      RETURNING *
    `;
    // Pass the correct values
    const result = await pool.query(query, [course_code, course_name, instructor_id]); 
    return result.rows[0];
    },

  getAllCourses: async () => {
    const query = `
      SELECT
        c.course_id,
        c.course_code as code,
        c.course_name as title,
        u.name as instructor_name,
        c.instructor_id,
        c.is_active,
        COUNT(DISTINCT e.student_id) as student_count
      FROM courses c
      LEFT JOIN instructors i ON c.instructor_id = i.user_id
      LEFT JOIN users u ON i.user_id = u.user_id
      LEFT JOIN enrollments e ON c.course_id = e.course_id
      WHERE c.is_active = true
      GROUP BY c.course_id, c.course_code, c.course_name, u.name, c.instructor_id, c.is_active
      ORDER BY c.course_code ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  getCourseById: async (courseId) => {
    const query = `SELECT * FROM courses WHERE course_id = $1 AND is_active = true`;
    const result = await pool.query(query, [courseId]);
    return result.rows[0];
  },

  updateCourse: async (courseId, data) => {
    const { code, title } = data;
    const query = `
      UPDATE courses 
      SET course_code = $1, course_name = $2
      WHERE course_id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [code, title, courseId]);
    return result.rows[0];
  },

  deleteCourse: async (courseId) => {
    const query = `
      UPDATE courses
      SET is_active = false
      WHERE course_id = $1
      RETURNING course_id
    `;
    const result = await pool.query(query, [courseId]);
    return result.rows[0];
  },

  getCoursesByInstructor: async (instructorId) => {
    const query = `
      SELECT course_id, course_code, course_name, instructor_id
      FROM public.courses
      WHERE instructor_id = $1 AND is_active = true
      ORDER BY course_code ASC;
    `;
    const result = await pool.query(query, [instructorId]);
    return result.rows;
  },

  getEnrolledCoursesByStudent: async (studentId) => {
        const query = `
            SELECT c.course_id, c.course_code, c.course_name, c.instructor_id, e.enrolled_at
            FROM courses c
            JOIN enrollments e ON c.course_id = e.course_id
            WHERE e.student_id = $1
            ORDER BY c.course_code;
        `;
        const result = await pool.query(query, [studentId]);
        return result.rows;
    },
};

module.exports = courseQueries;