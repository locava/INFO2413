// backend/src/db/queries/user.queries.js
const pool = require('../pool');
const bcrypt = require('bcrypt');

const userQueries = {
  findUserByEmail: async (email) => {
    const query = `SELECT * FROM users WHERE email = $1 AND status = 'Active'`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  // ✅ FIX 1: Select 'name' column, not 'first_name, last_name' (which don't exist)
  findUserById: async (id) => {
    const query = `SELECT user_id, name, email, role, status FROM users WHERE user_id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  create: async (userData) => {
    const { name, first_name, last_name, email, password, role } = userData;
    
    // ✅ FIX 2: Use 'name' if provided. If not, safely combine first/last.
    // This prevents "undefined undefined".
    const fullName = name || `${first_name || ''} ${last_name || ''}`.trim();
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES ($1, $2, $3, $4, 'Active')
      RETURNING user_id, name, email, role
    `;
    
    const result = await pool.query(query, [fullName, email, hashedPassword, role]);
    
    // Return the user exactly as it is in the DB
    return result.rows[0];
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

    // We must find the user first to preserve the name structure if needed
    // In this case, we skip the name parsing since the controller handles it.

    // 2. Iterate over the data payload to build the query dynamically
    if (userData.name !== undefined) {
        fields.push(`name = $${index++}`);
        values.push(userData.name);
    }
    if (userData.email !== undefined) {
        fields.push(`email = $${index++}`);
        values.push(userData.email);
    }
    // Note: The controller should have ensured role and status are NOT in userData 
    // unless you intend to update them. Since they are protected, they won't be here.
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
};

// Aliases
userQueries.createUser = userQueries.create;
userQueries.findByEmail = userQueries.findUserByEmail;
userQueries.findById = userQueries.findUserById;
userQueries.updateUser = userQueries.updateUser;

module.exports = userQueries;