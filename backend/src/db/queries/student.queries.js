const pool = require('../pool');

async function getStudentByUserId(userId) {
  const res = await pool.query(
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
