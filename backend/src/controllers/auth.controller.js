// backend/src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const userQueries = require('../db/queries/user.queries');
const enrollmentQueries = require('../db/queries/enrollment.queries');
const { validatePassword } = require('../utils/passwordValidator');
const { sanitizeEmail, sanitizeString } = require('../utils/sanitizer');

exports.register = async (req, res, next) => {
  try {
    const { email, password, name, phone, dob, courseIds } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Validate course selection (1-3 courses required for students)
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length < 1 || courseIds.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Please select between 1 and 3 courses'
      });
    }

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email);

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors
      });
    }

    // Sanitize name
    const sanitizedName = sanitizeString(name);

    // Register user with sanitized data
    const user = await authService.register({
      ...req.body,
      email: sanitizedEmail,
      name: sanitizedName
    });

    // Enroll student in selected courses
    if (user.role === 'Student' && courseIds && courseIds.length > 0) {
      for (const courseId of courseIds) {
        try {
          await enrollmentQueries.enrollStudent(user.user_id, courseId);
        } catch (enrollError) {
          console.error(`Failed to enroll in course ${courseId}:`, enrollError);
          // Continue with other enrollments even if one fails
        }
      }
    }

    // Auto-login after register
    req.session.user = user;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email);

    const user = await authService.login(sanitizedEmail, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // ✅ THE CHANGE: Save user to Session (This sets the Cookie automatically)
    req.session.user = user;

    // ✅ Send simple response (No token needed)
    res.json({
      success: true,
      message: 'Login successful',
      data: user
    });

  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.json({ success: true, message: 'Logged out successfully' });
  });
};

exports.getCurrentUser = (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      success: true,
      data: req.session.user
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.session.user.user_id;
    const updates = req.body;

    // 🛡️ SECURITY: Prevent users from changing sensitive fields
    delete updates.role;     // Cannot make themselves Admin
    delete updates.password; // Password changes require a different flow (hashing)
    delete updates.user_id;  // Cannot change their ID
    delete updates.email;    // Email changes should be handled separately with verification

    // Sanitize string inputs
    if (updates.name) {
      updates.name = sanitizeString(updates.name);
    }
    if (updates.phone) {
      updates.phone = sanitizeString(updates.phone);
    }

    // Call the query to update the user in the database
    const updatedUser = await userQueries.updateUser(userId, updates);

    // ✅ CRITICAL: Update the active session with new data
    // This ensures the name updates immediately in the header
    req.session.user = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password endpoint
 */
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.session.user.user_id;
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'New password does not meet security requirements',
        errors: passwordValidation.errors
      });
    }

    // Change password through auth service
    await authService.changePassword(userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};