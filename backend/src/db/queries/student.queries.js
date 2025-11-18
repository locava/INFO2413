// src/db/queries/student.queries.js
const { query } = require('../../config/db');

async function getStudentByUserId(userId) {
  const res = await query(
    `
    SELECT *
    FROM students
    WHERE user_id = $1
    `,
    [userId]
  );

  return res.rows[0];
}

module.exports = {
  getStudentByUserId,
};
