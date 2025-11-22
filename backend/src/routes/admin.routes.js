const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireRole } = require('../middleware/auth.middleware');

// Protect all routes - Admin Only
router.use(requireRole('Administrator'));

// User Management
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id', adminController.updateUser);

// Course Management
router.get('/courses', adminController.getAllCourses);
router.post('/courses', adminController.createCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// System Thresholds
router.get('/thresholds', adminController.getThresholds);
router.put('/thresholds/:id', adminController.updateThreshold);

// System Reports
router.get('/reports', adminController.getSystemReports);

module.exports = router;