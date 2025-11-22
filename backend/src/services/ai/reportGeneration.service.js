// backend/src/services/ai/reportGeneration.service.js
// Person 4 - AI Module: Report Generation Service
// Generates weekly/monthly reports for students, instructors, and admins

const pool = require('../../db/pool');
const { analyzeStudyPatterns } = require('./patternAnalysis.service');
const { getFocusModel } = require('./focusModel.service');

/**
 * Generate weekly report for a student
 * @param {string} studentId - UUID of the student
 * @param {Date} weekStart - Start of the week (optional, defaults to last Monday)
 * @returns {Object} Weekly report data
 */
async function generateStudentWeeklyReport(studentId, weekStart = null) {
  // Calculate week boundaries
  if (!weekStart) {
    weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Last Monday
  }
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Sunday

  // Get study sessions for the week
  const sessionsQuery = `
    SELECT 
      ss.session_id,
      ss.course_id,
      ss.date,
      ss.start_time,
      ss.duration_minutes,
      ss.mood,
      ss.distractions,
      c.course_name,
      c.course_code
    FROM study_sessions ss
    JOIN courses c ON ss.course_id = c.course_id
    WHERE ss.student_id = $1
      AND ss.is_deleted = false
      AND ss.date >= $2
      AND ss.date <= $3
    ORDER BY ss.date, ss.start_time
  `;

  const result = await pool.query(sessionsQuery, [
    studentId,
    weekStart.toISOString().split('T')[0],
    weekEnd.toISOString().split('T')[0]
  ]);

  const sessions = result.rows;

  // Calculate statistics
  const totalStudyTime = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalSessions = sessions.length;
  const averageSessionDuration = totalSessions > 0 ? Math.round(totalStudyTime / totalSessions) : 0;

  // Group by course
  const byCourse = {};
  sessions.forEach(session => {
    const courseKey = session.course_id;
    if (!byCourse[courseKey]) {
      byCourse[courseKey] = {
        courseId: session.course_id,
        courseName: session.course_name,
        courseCode: session.course_code,
        sessions: 0,
        totalMinutes: 0
      };
    }
    byCourse[courseKey].sessions++;
    byCourse[courseKey].totalMinutes += session.duration_minutes;
  });

  const courseBreakdown = Object.values(byCourse);

  // Mood analysis
  const moodCounts = {};
  sessions.forEach(s => {
    if (s.mood) {
      moodCounts[s.mood] = (moodCounts[s.mood] || 0) + 1;
    }
  });

  // Distraction analysis
  const distractionCounts = {};
  sessions.forEach(s => {
    if (s.distractions) {
      const distractions = s.distractions.split(',').map(d => d.trim()).filter(d => d);
      distractions.forEach(d => {
        distractionCounts[d] = (distractionCounts[d] || 0) + 1;
      });
    }
  });

  // Get focus model for recommendations
  const focusModel = await getFocusModel(studentId);

  // Generate insights
  const insights = generateInsights({
    totalStudyTime,
    totalSessions,
    averageSessionDuration,
    focusModel,
    moodCounts,
    distractionCounts
  });

  const reportData = {
    studentId,
    reportType: 'STUDENT_WEEKLY',
    period: {
      start: weekStart.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0]
    },
    summary: {
      totalStudyTime,
      totalSessions,
      averageSessionDuration,
      totalStudyHours: parseFloat((totalStudyTime / 60).toFixed(1))
    },
    courseBreakdown,
    moodDistribution: moodCounts,
    topDistractions: Object.entries(distractionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([distraction, count]) => ({ distraction, count })),
    insights,
    focusModel: {
      typicalFocusLossMinutes: focusModel.typical_focus_loss_minutes,
      confidence: focusModel.confidence
    }
  };

  // Save report to database
  await saveReport({
    reportType: 'STUDENT',
    ownerId: studentId,
    periodStart: weekStart,
    periodEnd: weekEnd,
    data: reportData
  });

  return reportData;
}

/**
 * Generate insights based on report data
 */
function generateInsights({ totalStudyTime, totalSessions, averageSessionDuration, focusModel, moodCounts, distractionCounts }) {
  const insights = [];

  // Study time insights
  const weeklyGoal = 600; // 10 hours per week (from thresholds)
  if (totalStudyTime < weeklyGoal) {
    insights.push({
      type: 'warning',
      message: `You studied ${Math.round(totalStudyTime / 60)} hours this week. Try to reach ${Math.round(weeklyGoal / 60)} hours.`
    });
  } else {
    insights.push({
      type: 'success',
      message: `Great job! You met your weekly study goal of ${Math.round(weeklyGoal / 60)} hours.`
    });
  }

  // Session duration insights
  if (averageSessionDuration < 30) {
    insights.push({
      type: 'tip',
      message: 'Your sessions are quite short. Try studying for at least 45-60 minutes for better retention.'
    });
  }

  // Mood insights
  const totalMoodEntries = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
  const negativeMoods = ['Tired', 'Distracted', 'Stressed'].reduce((sum, mood) => sum + (moodCounts[mood] || 0), 0);
  
  if (totalMoodEntries > 0 && (negativeMoods / totalMoodEntries) > 0.5) {
    insights.push({
      type: 'concern',
      message: 'You reported negative moods in over half your sessions. Consider taking breaks or adjusting study times.'
    });
  }

  return insights;
}

/**
 * Save report to database
 */
async function saveReport({ reportType, ownerId, courseId = null, periodStart, periodEnd, data }) {
  const query = `
    INSERT INTO reports (report_type, owner_id, course_id, period_start, period_end, data)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING report_id, created_at
  `;

  const result = await pool.query(query, [
    reportType,
    ownerId,
    courseId,
    periodStart.toISOString().split('T')[0],
    periodEnd.toISOString().split('T')[0],
    JSON.stringify(data)
  ]);

  return result.rows[0];
}

module.exports = {
  generateStudentWeeklyReport,
  saveReport
};

