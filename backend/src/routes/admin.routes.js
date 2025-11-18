// src/routes/admin.routes.js
const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = express.Router();

// All admin routes require: JWT + Administrator role
router.use(authenticateJWT, requireRole('Administrator'));

// ---- Courses ----

// POST /api/admin/courses
router.post('/courses', adminController.createCourse);

// PUT /api/admin/courses/:id
router.put('/courses/:id', adminController.updateCourse);

// DELETE /api/admin/courses/:id
router.delete('/courses/:id', adminController.deleteCourse);

// ---- Users ----

// POST /api/admin/users  (admin creates instructor/admin users)
router.post('/users', adminController.createUser);

module.exports = router;
