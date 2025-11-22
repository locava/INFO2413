// backend/src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const userQueries = require('../db/queries/user.queries');

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    
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
    const user = await authService.login(email, password);

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

    // Call the query to update the user in the database
    const updatedUser = await userQueries.updateUser(userId, updates);

    // ✅ CRITICAL: Update the active session with new data
    // This ensures the name updates immediately in the header
    req.session.user = updatedUser;
    // req.session.save(); // Save is often implicit, but calling it is safer

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};