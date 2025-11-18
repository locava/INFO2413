// src/services/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const userQueries = require('../db/queries/user.queries');

async function login(email, password) {
  const user = await userQueries.findUserByEmail(email);

  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const tokenPayload = {
    userId: user.id,
    role: user.role, // 'Student' | 'Instructor' | 'Administrator'
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });

  // Don't send password hash to client
  delete user.password_hash;

  return {
    token,
    user,
  };
}

async function registerStudent(data) {
  const { name, email, password, studentNumber } = data;

  const existing = await userQueries.findUserByEmail(email);
  if (existing) {
    const error = new Error('Email already in use');
    error.status = 400;
    throw error;
  }

  const hash = await bcrypt.hash(password, 10);

  // create user record with role "Student"
  const user = await userQueries.insertUser({
    name,
    email,
    passwordHash: hash,
    role: 'Student',
  });

  // create student record
  await userQueries.insertStudent({
    userId: user.id,
    studentNumber,
  });

  return user;
}

module.exports = {
  login,
  registerStudent,
};
