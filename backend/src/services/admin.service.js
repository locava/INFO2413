// backend/src/services/admin.service.js
const bcrypt = require('bcryptjs');
const courseService = require('./course.service');
const userQueries = require('../db/queries/user.queries');
const instructorQueries = require('../db/queries/instructor.queries');

async function createCourse(data) {
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
 */
async function createUser(data) {
  // Extract all fields needed for both tables
  const { name, email, password, role, workingId, phone, department } = data; 

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

  // 1. Insert into users table
  const user = await userQueries.insertUser({
    name,
    email,
    passwordHash,
    role,
    phone, // Include phone number here
  });

  // 2. If instructor, create the profile in the 'instructors' table
  if (role === 'Instructor') {
    // We assume instructorQueries.insertInstructor accepts these three specific parameters:
    await instructorQueries.insertInstructor({
      userId: user.user_id,             // The UUID primary key from the new user record
      workingId: workingId || null,     // The required unique ID from the form
      department: department || null,   // Include department for the instructor profile
    });
  }

  // 3. Return the newly created base user object
  return user;
}

module.exports = {
  createCourse,
  updateCourse,
  deleteCourse,
  createUser,
};