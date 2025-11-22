// backend/src/services/ai/patternAnalysis.service.js
// Person 4 - AI Module: Pattern Analysis Service
// Analyzes study patterns to identify peak hours, common distractions, and mood trends

const pool = require('../../db/pool');

/**
 * Analyze study patterns for a student
 * @param {string} studentId - UUID of the student
 * @param {string} courseId - Optional UUID of specific course
 * @param {number} daysBack - Number of days to analyze (default: 30)
 * @returns {Object} Pattern analysis results
 */
async function analyzeStudyPatterns(studentId, courseId = null, daysBack = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  // Build query based on whether courseId is provided
  let query = `
    SELECT 
      session_id,
      course_id,
      date,
      start_time,
      duration_minutes,
      mood,
      distractions
    FROM study_sessions
    WHERE student_id = $1
      AND is_deleted = false
      AND date >= $2
  `;
  
  const params = [studentId, cutoffDate.toISOString().split('T')[0]];
  
  if (courseId) {
    query += ` AND course_id = $3`;
    params.push(courseId);
  }
  
  query += ` ORDER BY date DESC, start_time DESC`;

  const result = await pool.query(query, params);
  const sessions = result.rows;

  if (sessions.length === 0) {
    return {
      studentId,
      courseId,
      sessionsAnalyzed: 0,
      peakStudyHours: [],
      commonDistractions: [],
      moodTrends: {},
      averageSessionDuration: 0,
      totalStudyTime: 0,
      confidence: 0
    };
  }

  // 1. Identify peak study hours
  const hourCounts = {};
  const hourProductivity = {}; // duration per hour
  
  sessions.forEach(session => {
    const hour = new Date(session.start_time).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    hourProductivity[hour] = (hourProductivity[hour] || 0) + session.duration_minutes;
  });

  // Sort hours by productivity (total study time)
  const peakStudyHours = Object.entries(hourProductivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour, totalMinutes]) => ({
      hour: parseInt(hour),
      sessionCount: hourCounts[hour],
      totalMinutes: totalMinutes,
      averageMinutes: Math.round(totalMinutes / hourCounts[hour])
    }));

  // 2. Detect common distractions
  const distractionCounts = {};
  
  sessions.forEach(session => {
    if (session.distractions) {
      const distractions = session.distractions.split(',').map(d => d.trim()).filter(d => d);
      distractions.forEach(distraction => {
        distractionCounts[distraction] = (distractionCounts[distraction] || 0) + 1;
      });
    }
  });

  const commonDistractions = Object.entries(distractionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([distraction, count]) => ({
      distraction,
      count,
      percentage: Math.round((count / sessions.length) * 100)
    }));

  // 3. Track mood trends
  const moodCounts = {};
  
  sessions.forEach(session => {
    if (session.mood) {
      moodCounts[session.mood] = (moodCounts[session.mood] || 0) + 1;
    }
  });

  const moodTrends = Object.entries(moodCounts)
    .map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / sessions.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  // 4. Calculate statistics
  const totalStudyTime = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const averageSessionDuration = Math.round(totalStudyTime / sessions.length);

  // 5. Calculate confidence based on data availability
  const confidence = Math.min(0.95, 0.50 + (sessions.length / 100));

  return {
    studentId,
    courseId,
    sessionsAnalyzed: sessions.length,
    peakStudyHours,
    commonDistractions,
    moodTrends,
    averageSessionDuration,
    totalStudyTime,
    confidence: parseFloat(confidence.toFixed(2)),
    analyzedPeriod: {
      from: cutoffDate.toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0],
      days: daysBack
    }
  };
}

module.exports = {
  analyzeStudyPatterns
};

