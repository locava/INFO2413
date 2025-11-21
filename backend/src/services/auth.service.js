// backend/src/services/auth.service.js
const userQueries = require('../db/queries/user.queries');
const bcrypt = require('bcrypt');

const authService = {
  login: async (email, password) => {
    // 1. Find the user
    const user = await userQueries.findByEmail(email);
    
    if (!user) {
      return null; // User not found
    }

    // 2. Compare Password
    // 🔴 CRITICAL FIX: Use 'password_hash' (from DB) not 'password'
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return null; // Wrong password
    }

    // 3. Return user info (without the password hash)
    // We separate the hash from the rest of the data
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  register: async (userData) => {
    // Check if user exists
    const existingUser = await userQueries.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Create new user (hashing happens in userQueries.create now)
    const newUser = await userQueries.create(userData);
    return newUser;
  }
};

module.exports = authService;