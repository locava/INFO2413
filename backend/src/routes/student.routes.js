// src/routes/student.routes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');

// ✅ FIX: Import the correct middleware we just created
const { requireRole } = require('../middleware/auth.middleware');

// ✅ FIX: Apply middleware to all routes in this file
// This checks if they are logged in AND if they are a 'Student'
router.use(requireRole('Student'));

// POST /api/student/study-sessions
router.post('/study-sessions', studentController.createStudySession);

// GET /api/student/study-sessions
router.get('/study-sessions', studentController.getStudySessions);

// PUT /api/student/study-sessions/:id
router.put('/study-sessions/:id', studentController.updateStudySession);

// DELETE /api/student/study-sessions/:id  (soft delete)
router.delete('/study-sessions/:id', studentController.softDeleteStudySession);

module.exports = router;