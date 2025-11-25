// backend/src/db/queries/user.queries.js
const pool = require('../pool');
const bcrypt = require('bcrypt');

const userQueries = {
  findUserByEmail: async (email) => {
    const query = `SELECT * FROM users WHERE email = $1 AND status = 'Active'`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  findUserById: async (id) => {
    const query = `SELECT user_id, name, email, role, status, password_hash FROM users WHERE user_id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  create: async (userData) => {
    // Extract fields needed for users table
    const { name, first_name, last_name, email, password, role, phone } = userData; 
    
    // Extract fields needed for instructor/student profiles (passed from admin service form data)
    const { studentNumber, program, workingId, department } = userData; // ✅ EXTRACT PROFILE DATA

    const fullName = name || `${first_name || ''} ${last_name || ''}`.trim();

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password_hash, role, status, phone)
      VALUES ($1, $2, $3, $4, 'Active', $5)
      RETURNING user_id, name, email, role
    `;

    // 1. Insert into users table
    const user = await pool.query(query, [fullName, email, hashedPassword, role, phone || null]);
    const newUser = user.rows[0];

    // 2. Insert into profile-specific tables based on role
    if (role === 'Student') {
      const studentNum = studentNumber || `B00${Math.floor(Math.random() * 900000 + 100000)}`;
      const studentQuery = `
        INSERT INTO students (user_id, student_number, program)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      await pool.query(studentQuery, [newUser.user_id, studentNum, program || null]);
    } 
    
    // ✅ FIX: Implement Instructor profile creation
    else if (role === 'Instructor') {
        const instructorQuery = `
            INSERT INTO instructors (user_id, working_id, department)
            VALUES ($1, $2, $3)
            RETURNING user_id
        `;
        // Ensure workingId is used, as it's required for NOT NULL constraint
        await pool.query(instructorQuery, [
            newUser.user_id, 
            workingId, // Must use workingId as passed from Admin form
            department || null // Use department if available, otherwise set null
        ]);
    }

    // Return the user exactly as it is in the DB
    return newUser;
    },

  getAllUsers: async (roleFilter = null) => {
    let query = `
      SELECT user_id, name, email, role, created_at, status 
      FROM users 
      WHERE status = 'Active'
    `;
    const params = [];
    
    if (roleFilter) {
      query += ` AND role = $1`;
      params.push(roleFilter);
    }
    
    query += ` ORDER BY created_at DESC`;
    const result = await pool.query(query, params);
    return result.rows;
  },

  softDeleteUser: async (userId) => {
    const query = `
      UPDATE users 
      SET status = 'Inactive' 
      WHERE user_id = $1 
      RETURNING user_id
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  },

  updateUser: async (userId, userData) => {
    // 1. Prepare data for dynamic update
    const fields = [];
    const values = [];
    let index = 1;

    // 2. Iterate over the data payload to build the query dynamically
    if (userData.name !== undefined) {
        fields.push(`name = $${index++}`);
        values.push(userData.name);
    }
    if (userData.email !== undefined) {
        fields.push(`email = $${index++}`);
        values.push(userData.email);
    }

    if (userData.phone !== undefined) {
        fields.push(`phone = $${index++}`);
        values.push(userData.phone);
    }
    
    // 3. Check for errors
    if (fields.length === 0) {
        throw new Error("No fields provided for user update.");
    }

    // 4. Final Query construction
    const setClause = fields.join(', ');
    
    // Add the user ID to the end of the values list for the WHERE clause
    values.push(userId);
    
    const query = `
      UPDATE users 
      SET ${setClause}
      WHERE user_id = $${index}
      RETURNING user_id, name, email, role, status, phone
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  updatePassword: async (userId, hashedPassword) => {
    const query = `
      UPDATE users
      SET password_hash = $1
      WHERE user_id = $2
      RETURNING user_id
    `;
    const result = await pool.query(query, [hashedPassword, userId]);
    return result.rows[0];
  },
};

// Aliases
userQueries.createUser = userQueries.create;
userQueries.findByEmail = userQueries.findUserByEmail;
userQueries.findById = userQueries.findUserById;
userQueries.updateUser = userQueries.updateUser;
userQueries.updatePassword = userQueries.updatePassword;

module.exports = userQueries;