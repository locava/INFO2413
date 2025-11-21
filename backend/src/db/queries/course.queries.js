// backend/src/db/queries/course.queries.js
const pool = require('../pool');

const courseQueries = {
  createCourse: async (courseData) => {
    // Schema check: "course_name", "course_code". Backend used "title", "code".
    const { code, title, description, instructor_id } = courseData;
    
    // ✅ FIX: Map backend variables to Schema columns
    const query = `
      INSERT INTO courses (course_code, course_name, instructor_id, is_active)
      VALUES ($1, $2, $3, true)
      RETURNING *
    `;
    // Note: Schema has no 'description' column, so we skip saving it to avoid crash.
    const result = await pool.query(query, [code, title, instructor_id]);
    return result.rows[0];
  },

  getAllCourses: async () => {
    // ✅ FIX: Use 'is_active' and correct column aliases
    const query = `
      SELECT c.course_id, c.course_code as code, c.course_name as title, 
             u.name as instructor_name
      FROM courses c
      LEFT JOIN instructors i ON c.instructor_id = i.user_id
      LEFT JOIN users u ON i.user_id = u.user_id
      WHERE c.is_active = true
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
    // ✅ FIX: Update 'is_active' instead of 'is_deleted'
    const query = `
      UPDATE courses 
      SET is_active = false 
      WHERE course_id = $1 
      RETURNING course_id
    `;
    const result = await pool.query(query, [courseId]);
    return result.rows[0];
  }
};

module.exports = courseQueries;