const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructor.controller');
const { requireRole } = require('../middleware/auth.middleware');

// ✅ FIX: Move this route UP (Before the 'Instructor' check)
// We want Students to be able to see the list of courses too.
router.get('/courses', instructorController.getCourses);

// ----------------------------------------------------
// 🔒 Protect all routes below this line - Instructor Only
// ----------------------------------------------------
router.use(requireRole('Instructor'));

// Get students for a specific course (now supports search query params)
router.get('/course/:id/students', instructorController.getStudents);

// ✅ NEW: Get individual student sessions for review
router.get('/student/:studentId/sessions/:courseId', instructorController.getStudentSessions);

// Get reports for a specific course
router.get('/reports/course/:id', instructorController.getCourseReport);

module.exports = router;