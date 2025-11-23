// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const { requireAuth } = require('../middleware/auth.middleware');
const { authLimiter, registerLimiter, passwordChangeLimiter } = require('../middleware/rateLimiter');
const courseQueries = require('../db/queries/course.queries');

// Public route to get available courses for registration
router.get('/courses', async (req, res, next) => {
  try {
    const courses = await courseQueries.getAllCourses();
    res.json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
});

// Apply rate limiting to authentication endpoints
router.post('/register', registerLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);
router.put('/profile', requireAuth, authController.updateProfile);
router.put('/change-password', requireAuth, passwordChangeLimiter, authController.changePassword);

module.exports = router;