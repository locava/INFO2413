// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
// We don't need middleware for login/register, 
// but we might want to protect logout/me later. For now, this is fine.

// ✅ FIX: Use 'register' (new name) instead of 'registerStudent' (old name)
router.post('/register', authController.register);

// ✅ FIX: Use 'login'
router.post('/login', authController.login);

// ✅ NEW: Add Logout route (which you added to the controller)
router.post('/logout', authController.logout);

// ✅ NEW: Add Get Current User route (which you added to the controller)
router.get('/me', authController.getCurrentUser);

module.exports = router;