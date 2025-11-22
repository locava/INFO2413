// backend/src/services/ai/focusModel.service.js
// Person 4 - AI Module: Focus Model Service
// Builds and maintains per-student focus prediction models

const pool = require('../../db/pool');
const { analyzeStudyPatterns } = require('./patternAnalysis.service');

/**
 * Build or update focus model for a student
 * @param {string} studentId - UUID of the student
 * @param {string} courseId - Optional UUID of specific course (null for global model)
 * @returns {Object} Focus model
 */
async function buildFocusModel(studentId, courseId = null) {
  // Get recent study sessions (last 60 days)
  const patterns = await analyzeStudyPatterns(studentId, courseId, 60);

  if (patterns.sessionsAnalyzed < 3) {
    // Not enough data - return default model
    return createDefaultModel(studentId, courseId);
  }

  // Estimate typical focus loss point
  const typicalFocusLossMinutes = estimateFocusLossWindow(patterns);
  
  // Calculate preferred start hour
  const preferredStartHour = patterns.peakStudyHours.length > 0 
    ? patterns.peakStudyHours[0].hour 
    : 14; // Default to 2 PM

  // Build confidence score
  const confidence = calculateConfidence(patterns);

  // Save or update the model
  const model = await saveFocusModel({
    studentId,
    courseId,
    typicalFocusLossMinutes,
    confidence
  });

  return {
    ...model,
    preferredStartHour,
    averageSessionMinutes: patterns.averageSessionDuration,
    patterns
  };
}

/**
 * Estimate when focus typically drops based on session patterns
 */
function estimateFocusLossWindow(patterns) {
  const { averageSessionDuration, sessionsAnalyzed } = patterns;

  // Heuristic: Focus typically drops at 75% of average session length
  // But cap between 30-120 minutes for safety
  let focusLoss = Math.round(averageSessionDuration * 0.75);
  
  // Apply bounds
  focusLoss = Math.max(30, Math.min(120, focusLoss));

  return focusLoss;
}

/**
 * Calculate confidence score based on data quality
 */
function calculateConfidence(patterns) {
  const { sessionsAnalyzed } = patterns;
  
  // Base confidence on number of sessions
  // 3 sessions = 0.60, 10 sessions = 0.75, 20+ sessions = 0.90+
  let confidence = 0.50 + (sessionsAnalyzed / 50);
  
  // Cap at 0.95
  confidence = Math.min(0.95, confidence);
  
  return parseFloat(confidence.toFixed(2));
}

/**
 * Create default model when insufficient data
 */
function createDefaultModel(studentId, courseId) {
  return {
    studentId,
    courseId,
    typicalFocusLossMinutes: 60,
    confidence: 0.50,
    preferredStartHour: 14,
    averageSessionMinutes: 60,
    isDefault: true
  };
}

/**
 * Save or update focus model in database
 */
async function saveFocusModel({ studentId, courseId, typicalFocusLossMinutes, confidence }) {
  // Check if model exists
  const checkQuery = `
    SELECT focus_model_id 
    FROM focus_models 
    WHERE student_id = $1 
      AND ($2::uuid IS NULL AND course_id IS NULL OR course_id = $2)
  `;
  
  const existing = await pool.query(checkQuery, [studentId, courseId]);

  if (existing.rows.length > 0) {
    // Update existing model
    const updateQuery = `
      UPDATE focus_models
      SET typical_focus_loss_minutes = $1,
          confidence = $2,
          updated_at = NOW()
      WHERE focus_model_id = $3
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [
      typicalFocusLossMinutes,
      confidence,
      existing.rows[0].focus_model_id
    ]);
    
    return result.rows[0];
  } else {
    // Insert new model
    const insertQuery = `
      INSERT INTO focus_models (student_id, course_id, typical_focus_loss_minutes, confidence)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      studentId,
      courseId,
      typicalFocusLossMinutes,
      confidence
    ]);
    
    return result.rows[0];
  }
}

/**
 * Get focus model for a student
 */
async function getFocusModel(studentId, courseId = null) {
  const query = `
    SELECT * 
    FROM focus_models 
    WHERE student_id = $1 
      AND ($2::uuid IS NULL AND course_id IS NULL OR course_id = $2)
  `;
  
  const result = await pool.query(query, [studentId, courseId]);
  
  if (result.rows.length === 0) {
    // Build model if it doesn't exist
    return await buildFocusModel(studentId, courseId);
  }
  
  return result.rows[0];
}

module.exports = {
  buildFocusModel,
  getFocusModel,
  estimateFocusLossWindow
};

