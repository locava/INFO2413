// backend/src/routes/ai.routes.js
// Person 4 - AI Module: AI Routes
// Routes for AI features (pattern analysis, focus models, reports, monitoring)

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

// All AI routes require authentication
router.use(requireAuth);

// ============================================
// PATTERN ANALYSIS
// ============================================
// GET /api/ai/patterns/:studentId - Analyze study patterns
router.get('/patterns/:studentId', aiController.getStudyPatterns);

// ============================================
// FOCUS MODELS
// ============================================
// GET /api/ai/focus-model/:studentId - Get focus model
router.get('/focus-model/:studentId', aiController.getFocusModel);

// POST /api/ai/focus-model/:studentId - Build/rebuild focus model
router.post('/focus-model/:studentId', aiController.buildFocusModel);

// ============================================
// REPORTS
// ============================================
// GET /api/ai/reports/weekly/:studentId - Generate weekly report
router.get('/reports/weekly/:studentId', aiController.generateWeeklyReport);

// ============================================
// SESSION MONITORING
// ============================================
// POST /api/ai/monitoring/start - Start monitoring a session
router.post('/monitoring/start', aiController.startMonitoring);

// POST /api/ai/monitoring/stop - Stop monitoring a session
router.post('/monitoring/stop', aiController.stopMonitoring);

// GET /api/ai/monitoring/check - Check all active sessions (admin/cron)
router.get('/monitoring/check', requireRole('Administrator'), aiController.checkActiveSessions);

module.exports = router;

