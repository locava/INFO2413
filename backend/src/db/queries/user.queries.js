// src/db/queries/user.queries.js
const { query } = require('../../config/db');

// Get user by email (for login)
async function findUserByEmail(email) {
  const res = await query(
    `SELECT id, name, email, password_hash, role
     FROM users
     WHERE email = $1`,
    [email]
  );
  return res.rows[0] || null;
}

// Insert new user
async function insertUser({ name, email, passwordHash, role }) {
  const res = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role`,
    [name, email, passwordHash, role]
  );
  return res.rows[0];
}

// Insert into students table
async function insertStudent({ userId, studentNumber }) {
  await query(
    `INSERT INTO students (user_id, student_number)
     VALUES ($1, $2)`,
    [userId, studentNumber]
  );
}

module.exports = {
  findUserByEmail,
  insertUser,
  insertStudent,
};
