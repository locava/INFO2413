// src/routes/student.routes.js
const express = require('express');
const studentController = require('../controllers/student.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = express.Router();

// All student routes require: JWT + Student role
router.use(authenticateJWT, requireRole('Student'));

// POST /api/student/study-sessions
router.post('/study-sessions', studentController.createStudySession);

// GET /api/student/study-sessions
router.get('/study-sessions', studentController.getStudySessions);

// PUT /api/student/study-sessions/:id
router.put('/study-sessions/:id', studentController.updateStudySession);

// DELETE /api/student/study-sessions/:id  (soft delete)
router.delete('/study-sessions/:id', studentController.softDeleteStudySession);

module.exports = router;
