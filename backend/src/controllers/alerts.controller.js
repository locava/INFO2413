// src/controllers/alerts.controller.js
const alertService = require('../services/alert.service');
const { sendSuccess } = require('../utils/response');

// Simple test endpoint:
// - creates a dummy alert
// - enqueues a notification
async function createTestAlert(req, res, next) {
  try {
    const userId = req.user.userId; // whoever calls it
    const { message, type, studentId, courseId } = req.body;

    const result = await alertService.createTestAlert({
      triggeredByUserId: userId,
      message: message || 'Test alert from /api/alerts/test',
      type: type || 'TEST',
      studentId: studentId || null,
      courseId: courseId || null,
    });

    return sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

// Simulate running focus-loss alert logic over active sessions.
// For Monday, this just calls the AI stub and returns whatever it says.
async function runFocusAlertCheck(req, res, next) {
  try {
    const result = await alertService.runFocusAlertCheck();
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTestAlert,
  runFocusAlertCheck,
};
