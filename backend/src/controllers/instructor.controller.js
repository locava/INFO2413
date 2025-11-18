// src/controllers/instructor.controller.js
const instructorService = require('../services/instructor.service');
const { sendSuccess } = require('../utils/response');

async function getInstructorCourses(req, res, next) {
  try {
    const instructorId = req.user.userId;
    const courses = await instructorService.getCourses(instructorId);

    return sendSuccess(res, courses, 200);
  } catch (err) {
    next(err);
  }
}

async function getCourseStudents(req, res, next) {
  try {
    const instructorId = req.user.userId;
    const courseId = req.params.id;

    const students = await instructorService.getCourseStudents(
      instructorId,
      courseId
    );

    return sendSuccess(res, students, 200);
  } catch (err) {
    next(err);
  }
}

async function getCourseReport(req, res, next) {
  try {
    const instructorId = req.user.userId;
    const courseId = req.params.id;

    const report = await instructorService.getCourseReport(
      instructorId,
      courseId
    );

    return sendSuccess(res, report, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getInstructorCourses,
  getCourseStudents,
  getCourseReport,
};
