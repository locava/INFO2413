// src/services/instructor.service.js
const courseQueries = require('../db/queries/course.queries');
const enrollmentQueries = require('../db/queries/enrollment.queries');
const studentQueries = require('../db/queries/student.queries');
const aiClient = require('../integration/aiReports.client');

async function getCourses(instructorId) {
  return courseQueries.getCoursesByInstructor(instructorId);
}

async function getCourseStudents(instructorId, courseId) {
  // Optionally verify instructor owns this course
  await courseQueries.ensureInstructorOwnsCourse(instructorId, courseId);

  return enrollmentQueries.getStudentsInCourse(courseId);
}

async function getCourseReport(instructorId, courseId) {
  await courseQueries.ensureInstructorOwnsCourse(instructorId, courseId);

  // AI-generated analytics
  return aiClient.generateClassReport(courseId);
}

module.exports = {
  getCourses,
  getCourseStudents,
  getCourseReport,
};
