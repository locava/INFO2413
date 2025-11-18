// src/db/queries/instructor.queries.js
const { query } = require('../../config/db');

/**
 * For admin-created instructors.
 * Assumes table:
 *   instructors (id, user_id, instructor_number, department, ...)
 */
async function insertInstructor({ userId, instructorNumber, department }) {
  await query(
    `
    INSERT INTO instructors (user_id, instructor_number, department)
    VALUES ($1, $2, $3)
    `,
    [userId, instructorNumber, department]
  );
}

module.exports = {
  insertInstructor,
};
