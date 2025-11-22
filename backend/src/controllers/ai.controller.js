// backend/src/controllers/ai.controller.js
// Person 4 - AI Module: AI Controllers
// Handles HTTP requests for AI features

const aiService = require('../services/ai');

const aiController = {
  /**
   * GET /api/ai/patterns/:studentId
   * Analyze study patterns for a student
   */
  getStudyPatterns: async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const { courseId, daysBack } = req.query;

      const patterns = await aiService.analyzeStudyPatterns(
        studentId,
        courseId || null,
        parseInt(daysBack) || 30
      );

      res.json({ success: true, data: patterns });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/ai/focus-model/:studentId
   * Get or build focus model for a student
   */
  getFocusModel: async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const { courseId } = req.query;

      const model = await aiService.getFocusModel(studentId, courseId || null);

      res.json({ success: true, data: model });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/ai/focus-model/:studentId
   * Build/rebuild focus model for a student
   */
  buildFocusModel: async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const { courseId } = req.body;

      const model = await aiService.buildFocusModel(studentId, courseId || null);

      res.json({ 
        success: true, 
        message: 'Focus model built successfully',
        data: model 
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/ai/reports/weekly/:studentId
   * Generate weekly report for a student
   */
  generateWeeklyReport: async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const { weekStart } = req.query;

      const weekStartDate = weekStart ? new Date(weekStart) : null;
      const report = await aiService.generateStudentWeeklyReport(studentId, weekStartDate);

      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/ai/reports/monthly/:studentId
   * Generate monthly report for a student
   */
  generateMonthlyReport: async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const { month } = req.query; // Format: YYYY-MM

      const report = await aiService.generateStudentMonthlyReport(studentId, month);

      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/ai/reports/instructor/:courseId
   * Generate instructor summary report for a course
   */
  generateInstructorReport: async (req, res, next) => {
    try {
      const { courseId } = req.params;
      const { range, weekStart } = req.query;

      // Get instructor ID from session
      const instructorId = req.session.user.user_id;

      const weekStartDate = weekStart ? new Date(weekStart) : null;
      const report = await aiService.generateInstructorSummaryReport(
        instructorId,
        courseId,
        range || 'weekly',
        weekStartDate
      );

      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/ai/reports/system
   * Generate system diagnostics report (admin only)
   */
  generateSystemReport: async (req, res, next) => {
    try {
      const report = await aiService.generateSystemDiagnosticsReport();

      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/ai/monitoring/start
   * Start monitoring a study session
   */
  startMonitoring: async (req, res, next) => {
    try {
      const { studentId, courseId, sessionId } = req.body;

      if (!studentId || !courseId || !sessionId) {
        return res.status(400).json({
          success: false,
          message: 'studentId, courseId, and sessionId are required'
        });
      }

      const activeSession = await aiService.startSessionMonitoring(
        studentId,
        courseId,
        sessionId
      );

      res.json({ 
        success: true, 
        message: 'Session monitoring started',
        data: activeSession 
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/ai/monitoring/stop
   * Stop monitoring a study session
   */
  stopMonitoring: async (req, res, next) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'sessionId is required'
        });
      }

      const result = await aiService.stopSessionMonitoring(sessionId);

      res.json({ 
        success: true, 
        message: 'Session monitoring stopped',
        data: result 
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/ai/monitoring/check
   * Check all active sessions (admin/cron endpoint)
   */
  checkActiveSessions: async (req, res, next) => {
    try {
      const result = await aiService.checkActiveSessions();

      res.json({ 
        success: true, 
        message: `Checked ${result.sessionsChecked} sessions, triggered ${result.alertsTriggered} alerts`,
        data: result 
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = aiController;

