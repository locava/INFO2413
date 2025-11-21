const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructor.controller');
const { requireRole } = require('../middleware/auth.middleware');

// Protect all routes - Instructor Only
router.use(requireRole('Instructor'));

// Get all courses for the logged-in instructor
router.get('/courses', instructorController.getCourses);

// Get students for a specific course
router.get('/course/:id/students', instructorController.getStudents);

// Get reports for a specific course
router.get('/reports/course/:id', instructorController.getCourseReport);

module.exports = router;