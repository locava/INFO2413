// src/controllers/admin.controller.js
const adminService = require('../services/admin.service');
const { sendSuccess } = require('../utils/response');

// ---- Courses ----

async function createCourse(req, res, next) {
  try {
    const payload = req.body; // { title, code, description, instructorUserId, ... }
    const course = await adminService.createCourse(payload);
    return sendSuccess(res, course, 201);
  } catch (err) {
    next(err);
  }
}

async function updateCourse(req, res, next) {
  try {
    const courseId = req.params.id;
    const payload = req.body;
    const course = await adminService.updateCourse(courseId, payload);
    return sendSuccess(res, course, 200);
  } catch (err) {
    next(err);
  }
}

async function deleteCourse(req, res, next) {
  try {
    const courseId = req.params.id;
    await adminService.deleteCourse(courseId);
    return sendSuccess(res, { deleted: true }, 200);
  } catch (err) {
    next(err);
  }
}

// ---- Users ----

async function createUser(req, res, next) {
  try {
    const payload = req.body;
    // expected: { name, email, password, role, instructorNumber?, department? }
    const user = await adminService.createUser(payload);
    return sendSuccess(res, user, 201);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createCourse,
  updateCourse,
  deleteCourse,
  createUser,
};
