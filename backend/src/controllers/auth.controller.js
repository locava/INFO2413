// backend/src/controllers/auth.controller.js
const authService = require('../services/auth.service');

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

    // ✅ CRITICAL FIX: Save user to session
    req.session.user = user;
    
    // ✅ CRITICAL FIX: Send the user data in the response
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