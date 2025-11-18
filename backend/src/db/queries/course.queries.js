// src/db/queries/course.queries.js
const { query } = require('../../config/db');

// Used by instructors
async function getCoursesByInstructor(instructorUserId) {
  const res = await query(
    `
    SELECT c.*
    FROM courses c
    JOIN instructors i ON c.instructor_id = i.id
    WHERE i.user_id = $1
    `,
    [instructorUserId]
  );
  return res.rows;
}

// Ensure an instructor really owns that course
async function ensureInstructorOwnsCourse(instructorUserId, courseId) {
  const res = await query(
    `
    SELECT 1
    FROM courses c
    JOIN instructors i ON c.instructor_id = i.id
    WHERE c.id = $1
      AND i.user_id = $2
    `,
    [courseId, instructorUserId]
  );

  if (res.rowCount === 0) {
    const error = new Error('Unauthorized: course does not belong to this instructor');
    error.status = 403;
    throw error;
  }
}

// ---- Admin operations ----

// Create new course
async function createCourse({
  title,
  code,
  description,
  instructorId, // instructors.id
  term,
  startDate,
  endDate,
}) {
  const res = await query(
    `
    INSERT INTO courses (title, code, description, instructor_id, term, start_date, end_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [title, code, description, instructorId, term, startDate, endDate]
  );

  return res.rows[0];
}

// Update existing course
async function updateCourse(courseId, data) {
  const {
    title,
    code,
    description,
    instructorId,
    term,
    startDate,
    endDate,
  } = data;

  const res = await query(
    `
    UPDATE courses
    SET
      title = COALESCE($2, title),
      code = COALESCE($3, code),
      description = COALESCE($4, description),
      instructor_id = COALESCE($5, instructor_id),
      term = COALESCE($6, term),
      start_date = COALESCE($7, start_date),
      end_date = COALESCE($8, end_date)
    WHERE id = $1
    RETURNING *
    `,
    [courseId, title, code, description, instructorId, term, startDate, endDate]
  );

  return res.rows[0];
}

// Hard delete course (you can change to soft-delete if your schema supports it)
async function deleteCourse(courseId) {
  await query(
    `
    DELETE FROM courses
    WHERE id = $1
    `,
    [courseId]
  );
  return true;
}

module.exports = {
  getCoursesByInstructor,
  ensureInstructorOwnsCourse,
  createCourse,
  updateCourse,
  deleteCourse,
};
