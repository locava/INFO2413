const pool = require('../pool');

const courseQueries = {
  createCourse: async (courseData) => {
    // Schema check: Ensure your DB actually uses "course_name". 
    // If it uses just "name", change it below.
    const { code, title, description, instructor_id } = courseData;

    const query = `
      INSERT INTO courses (course_code, course_name, instructor_id, is_deleted)
      VALUES ($1, $2, $3, false)
      RETURNING *
    `;
    // Note: If schema has 'description', add it. If not, this is correct.
    const result = await pool.query(query, [code, title, instructor_id]);
    return result.rows[0];
  },

  getAllCourses: async () => {
    const query = `
      SELECT c.course_id, c.course_code as code, c.course_name as title, 
             u.name as instructor_name
      FROM courses c
      LEFT JOIN instructors i ON c.instructor_id = i.user_id
      LEFT JOIN users u ON i.user_id = u.user_id
      WHERE c.is_deleted = false
      ORDER BY c.course_code ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  getCourseById: async (courseId) => {
    const query = `SELECT * FROM courses WHERE course_id = $1 AND is_deleted = false`;
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
      SET is_deleted = true 
      WHERE course_id = $1 
      RETURNING course_id
    `;
    const result = await pool.query(query, [courseId]);
    return result.rows[0];
  }
};

module.exports = courseQueries;