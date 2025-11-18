// src/routes/alerts.routes.js
const express = require('express');
const alertsController = require('../controllers/alerts.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

const router = express.Router();

// All alert routes require authentication (any role)
router.use(authenticateJWT);

// POST /api/alerts/test
router.post('/test', alertsController.createTestAlert);

// POST /api/alerts/run-focus-check
// This simulates the background focus-loss alert logic (placeholder)
router.post('/run-focus-check', alertsController.runFocusAlertCheck);

module.exports = router;
