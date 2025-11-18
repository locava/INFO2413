// src/services/course.service.js
const courseQueries = require('../db/queries/course.queries');

async function createCourse(data) {
  // Example expected data shape:
  // { title, code, description, instructorId, term, startDate, endDate }
  return courseQueries.createCourse(data);
}

async function updateCourse(courseId, data) {
  return courseQueries.updateCourse(courseId, data);
}

async function deleteCourse(courseId) {
  return courseQueries.deleteCourse(courseId);
}

module.exports = {
  createCourse,
  updateCourse,
  deleteCourse,
};
