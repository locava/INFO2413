// src/services/admin.service.js
const bcrypt = require('bcryptjs');
const courseService = require('./course.service');
const userQueries = require('../db/queries/user.queries');
const instructorQueries = require('../db/queries/instructor.queries');

async function createCourse(data) {
  // Delegate to course service
  return courseService.createCourse(data);
}

async function updateCourse(courseId, data) {
  return courseService.updateCourse(courseId, data);
}

async function deleteCourse(courseId) {
  return courseService.deleteCourse(courseId);
}

/**
 * Admin-created users
 * Allowed roles here: 'Instructor', 'Administrator'
 * (Students self-register via /auth/register)
 */
async function createUser(data) {
  const { name, email, password, role, instructorNumber, department } = data;

  if (!['Instructor', 'Administrator'].includes(role)) {
    const error = new Error('Invalid role for admin-created user');
    error.status = 400;
    throw error;
  }

  const existing = await userQueries.findUserByEmail(email);
  if (existing) {
    const error = new Error('Email already in use');
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await userQueries.insertUser({
    name,
    email,
    passwordHash,
    role,
  });

  // If instructor, also add to instructors table
  if (role === 'Instructor') {
    await instructorQueries.insertInstructor({
      userId: user.id,
      instructorNumber: instructorNumber || null,
      department: department || null,
    });
  }

  return user;
}

module.exports = {
  createCourse,
  updateCourse,
  deleteCourse,
  createUser,
};
