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
    // Check if we have a single name or need to combine parts
    const { name, first_name, last_name, email, role } = userData;
    
    // Prioritize the direct 'name', otherwise try to combine
    let fullName = name;
    if (!fullName && (first_name || last_name)) {
      fullName = `${first_name || ''} ${last_name || ''}`.trim();
    }

    const query = `
      UPDATE users 
      SET name = $1, email = $2, role = $3
      WHERE user_id = $4
      RETURNING user_id, name, email, role, status
    `;
    const result = await pool.query(query, [fullName, email, role, userId]);
    return result.rows[0];
  },
};

// Aliases
userQueries.createUser = userQueries.create;
userQueries.findByEmail = userQueries.findUserByEmail;
userQueries.findById = userQueries.findUserById;
userQueries.updateUser = userQueries.updateUser;

module.exports = userQueries;