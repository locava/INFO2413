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
    const query = `SELECT user_id, first_name, last_name, email, role FROM users WHERE user_id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  create: async (userData) => {
    // Note: Schema uses 'name', backend uses first/last.
    // We will combine them for the DB insert to avoid crashes if the schema only has 'name'.
    // If your schema DOES have first_name/last_name, keep it as is.
    // Based on your schema file: "name varchar(120)"
    
    const { first_name, last_name, email, password, role } = userData;
    const fullName = `${first_name} ${last_name}`; 
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ FIX: Insert into 'name' column if first/last don't exist
    // OR if your schema actually has first/last, swap this back.
    // STRICTLY following the schema.sql you sent:
    const query = `
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES ($1, $2, $3, $4, 'Active')
      RETURNING user_id, name, email, role
    `;
    const result = await pool.query(query, [fullName, email, hashedPassword, role]);
    
    // Split name back for the frontend response
    const user = result.rows[0];
    user.first_name = user.name.split(' ')[0];
    user.last_name = user.name.split(' ').slice(1).join(' ');
    return user;
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
    // ✅ FIX: Update 'status' instead of 'is_deleted'
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
    // Check if we need to combine names again (like in create)
    const { first_name, last_name, email, role } = userData;
    let fullName = userData.name;

    if (first_name && last_name) {
      fullName = `${first_name} ${last_name}`;
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