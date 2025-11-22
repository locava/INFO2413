// backend/src/services/ai/index.js
// Person 4 - AI Module: Main AI Service Export
// Aggregates all AI services for easy import

const patternAnalysis = require('./patternAnalysis.service');
const focusModel = require('./focusModel.service');
const reportGeneration = require('./reportGeneration.service');
const focusMonitoring = require('./focusMonitoring.service');

module.exports = {
  // Pattern Analysis
  analyzeStudyPatterns: patternAnalysis.analyzeStudyPatterns,

  // Focus Model
  buildFocusModel: focusModel.buildFocusModel,
  getFocusModel: focusModel.getFocusModel,

  // Report Generation
  generateStudentWeeklyReport: reportGeneration.generateStudentWeeklyReport,
  saveReport: reportGeneration.saveReport,

  // Focus Monitoring
  startSessionMonitoring: focusMonitoring.startSessionMonitoring,
  stopSessionMonitoring: focusMonitoring.stopSessionMonitoring,
  checkActiveSessions: focusMonitoring.checkActiveSessions,
  createFocusLossAlert: focusMonitoring.createFocusLossAlert
};

