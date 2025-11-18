// src/routes/instructor.routes.js
const express = require('express');
const instructorController = require('../controllers/instructor.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = express.Router();

// All instructor routes require: JWT + Instructor role
router.use(authenticateJWT, requireRole('Instructor'));

// GET /api/instructor/courses
router.get('/courses', instructorController.getInstructorCourses);

// GET /api/instructor/course/:id/students
router.get('/course/:id/students', instructorController.getCourseStudents);

// GET /api/instructor/reports/course/:id
router.get('/reports/course/:id', instructorController.getCourseReport);

module.exports = router;
