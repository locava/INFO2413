// backend/src/services/ai/reportGeneration.service.js
// Person 4 - AI Module: Report Generation Service
// Generates weekly/monthly reports for students, instructors, and admins
// Aligned with JSON templates in AI and Reports/Report-Templets/

const pool = require('../../db/pool');
const { analyzeStudyPatterns } = require('./patternAnalysis.service');
const { getFocusModel } = require('./focusModel.service');

/**
 * Calculate focus score based on session data
 * Focus score = weighted average of:
 * - Session completion (did they finish?)
 * - Distraction level (fewer distractions = higher score)
 * - Mood quality (positive moods = higher score)
 */
function calculateFocusScore(sessions) {
  if (sessions.length === 0) return 0;

  const moodScores = {
    'Very Productive': 100,
    'Productive': 85,
    'Focused': 90,
    'Neutral': 70,
    'Tired': 50,
    'Distracted': 40,
    'Stressed': 45
  };

  let totalScore = 0;
  sessions.forEach(session => {
    let score = 70; // Base score

    // Mood contribution (40% weight)
    if (session.mood && moodScores[session.mood]) {
      score = moodScores[session.mood] * 0.4 + score * 0.6;
    }

    // Distraction penalty (reduce score based on number of distractions)
    if (session.distractions) {
      const distractionCount = session.distractions.split(',').filter(d => d.trim()).length;
      score -= Math.min(distractionCount * 5, 20); // Max 20 point penalty
    }

    // Duration bonus (longer focused sessions = better)
    if (session.duration_minutes >= 60) {
      score += 10;
    } else if (session.duration_minutes < 30) {
      score -= 10;
    }

    totalScore += Math.max(0, Math.min(100, score));
  });

  return Math.round(totalScore / sessions.length);
}

/**
 * Generate weekly report for a student matching Student-weekly-report.json template
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
  const focusScore = calculateFocusScore(sessions);

  // Group by day for by_day breakdown
  const byDay = {};
  sessions.forEach(session => {
    const dateKey = session.date.toISOString().split('T')[0];
    if (!byDay[dateKey]) {
      byDay[dateKey] = {
        date: dateKey,
        minutes: 0,
        sessions: []
      };
    }
    byDay[dateKey].minutes += session.duration_minutes;
    byDay[dateKey].sessions.push(session);
  });

  const byDayArray = Object.values(byDay).map(day => ({
    date: day.date,
    minutes: day.minutes,
    focus_score: calculateFocusScore(day.sessions)
  }));

  // Group by course for top_courses
  const byCourse = {};
  sessions.forEach(session => {
    const courseKey = session.course_id;
    if (!byCourse[courseKey]) {
      byCourse[courseKey] = {
        course_id: session.course_code || session.course_id,
        course_name: session.course_name,
        hours: 0
      };
    }
    byCourse[courseKey].hours += session.duration_minutes / 60;
  });

  const topCourses = Object.values(byCourse)
    .sort((a, b) => b.hours - a.hours)
    .map(c => ({
      course_id: c.course_id,
      course_name: c.course_name,
      hours: parseFloat(c.hours.toFixed(1))
    }));

  // Distraction analysis
  const distractionCounts = {};
  sessions.forEach(s => {
    if (s.distractions) {
      const distractions = s.distractions.split(',').map(d => d.trim()).filter(d => d);
      distractions.forEach(d => {
        const normalized = d.toLowerCase().replace(/_/g, ' ');
        distractionCounts[normalized] = (distractionCounts[normalized] || 0) + 1;
      });
    }
  });

  // Get focus model for recommendations
  const focusModel = await getFocusModel(studentId);

  // Generate smart AI recommendations based on patterns
  const recommendations = [];

  // Peak hour recommendation
  const patterns = await analyzeStudyPatterns(studentId, null, 7);
  if (patterns.peakStudyHours && patterns.peakStudyHours.length > 0) {
    const peakHour = patterns.peakStudyHours[0].hour;
    recommendations.push(
      `⭐ Your peak focus window is ${peakHour}:00–${peakHour + 2}:00. Schedule your most challenging subjects during this time for maximum retention.`
    );
  }

  // Study time recommendations with emojis
  const weeklyGoal = 600; // 10 hours
  if (totalStudyTime < 300) { // Less than 5 hours
    recommendations.push('📚 Aim for 5-7 hours of weekly study time to improve retention and understanding.');
  } else if (totalStudyTime < weeklyGoal) {
    recommendations.push(
      `🎯 You're ${Math.round((weeklyGoal - totalStudyTime) / 60)} hours away from your ${Math.round(weeklyGoal / 60)}-hour weekly goal. You can do it!`
    );
  } else if (totalStudyTime > 1200) { // More than 20 hours
    recommendations.push('⚠️ You\'re studying over 20 hours/week. Remember to take breaks to avoid burnout!');
  } else {
    recommendations.push('✅ Excellent study time balance! You\'re hitting the sweet spot for effective learning.');
  }

  // Focus score recommendations
  if (focusScore < 50) {
    recommendations.push('🎯 Focus Alert: Try the Pomodoro Technique (25 min focus + 5 min break) to boost concentration.');
  } else if (focusScore < 70) {
    recommendations.push('💡 Good focus! Eliminate your top distraction to reach peak performance (75%+).');
  } else if (focusScore >= 85) {
    recommendations.push('🔥 Outstanding focus score! You\'re in the top 10% of students. Keep it up!');
  } else {
    recommendations.push('👍 Great focus! You\'re maintaining excellent concentration levels.');
  }

  // Distraction-specific recommendations
  const topDistraction = Object.entries(distractionCounts)
    .sort((a, b) => b[1] - a[1])[0];
  if (topDistraction && topDistraction[1] >= 3) {
    const distractionTips = {
      'phone': '📱 Put your phone in another room or use app blockers during study time.',
      'social_media': '🚫 Use website blockers like Freedom or Cold Turkey during study sessions.',
      'noise': '🎧 Try noise-cancelling headphones or study in a quieter location.',
      'fatigue': '😴 Ensure 7-8 hours of sleep and study during your peak energy hours.',
      'hunger': '🍎 Have healthy snacks ready before starting your study session.',
      'other': '🎯 Identify your main distraction and create a specific plan to minimize it.'
    };
    const distractionName = topDistraction[0].toLowerCase();
    const tip = distractionTips[distractionName] || distractionTips['other'];
    recommendations.push(`${tip} (${topDistraction[0]} occurred ${topDistraction[1]}x this week)`);
  }

  // Session duration recommendations
  if (averageSessionDuration < 25) {
    recommendations.push('⏱️ Your sessions are quite short. Try 45-60 minute blocks for deeper learning.');
  } else if (averageSessionDuration > 120) {
    recommendations.push('🧠 Long sessions detected. Break them into 60-90 min chunks with 10-15 min breaks.');
  } else {
    recommendations.push('✨ Perfect session length! 45-90 minutes is ideal for deep work.');
  }

  // Consistency recommendations
  if (byDayArray.filter(d => d.minutes > 0).length < 3) {
    recommendations.push('📅 Study at least 3-4 days per week for better consistency and retention.');
  } else if (byDayArray.filter(d => d.minutes > 0).length >= 5) {
    recommendations.push('🌟 Excellent consistency! Studying 5+ days/week builds strong habits.');
  }

  // Build report matching Student-weekly-report.json template
  const reportData = {
    report_type: 'student_weekly',
    student_id: studentId,
    week_start: weekStart.toISOString().split('T')[0],
    week_end: weekEnd.toISOString().split('T')[0],
    summary: {
      total_hours: parseFloat((totalStudyTime / 60).toFixed(1)),
      sessions_count: totalSessions,
      average_session_minutes: averageSessionDuration,
      focus_score: focusScore
    },
    by_day: byDayArray,
    top_courses: topCourses,
    distractions: distractionCounts,
    recommendations
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
 * Generate monthly report for a student matching Student-monthly-report.json template
 * @param {string} studentId - UUID of the student
 * @param {string} month - Month in YYYY-MM format
 * @returns {Object} Monthly report data
 */
async function generateStudentMonthlyReport(studentId, month = null) {
  if (!month) {
    const now = new Date();
    month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  const [year, monthNum] = month.split('-');
  const monthStart = new Date(year, parseInt(monthNum) - 1, 1);
  const monthEnd = new Date(year, parseInt(monthNum), 0); // Last day of month

  // Get all sessions for the month
  const sessionsQuery = `
    SELECT
      ss.*,
      c.course_name,
      c.course_code,
      EXTRACT(WEEK FROM ss.date) as week_num
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
    monthStart.toISOString().split('T')[0],
    monthEnd.toISOString().split('T')[0]
  ]);

  const sessions = result.rows;

  // Group by week
  const weeklyData = {};
  sessions.forEach(session => {
    const weekKey = session.week_num;
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        hours: 0,
        sessions: []
      };
    }
    weeklyData[weekKey].hours += session.duration_minutes / 60;
    weeklyData[weekKey].sessions.push(session);
  });

  const hoursPerWeek = Object.values(weeklyData).map(w => parseFloat(w.hours.toFixed(1)));
  const weeklyFocusScores = Object.values(weeklyData).map(w => calculateFocusScore(w.sessions));

  // Determine trend
  let trend = 'stable';
  if (hoursPerWeek.length >= 2) {
    const lastWeek = hoursPerWeek[hoursPerWeek.length - 1];
    const prevWeek = hoursPerWeek[hoursPerWeek.length - 2];
    if (lastWeek < prevWeek * 0.8) {
      trend = 'slightly_down_in_last_week';
    } else if (lastWeek > prevWeek * 1.2) {
      trend = 'increasing';
    }
  }

  // Common distractions
  const distractionCounts = {};
  sessions.forEach(s => {
    if (s.distractions) {
      const distractions = s.distractions.split(',').map(d => d.trim().toLowerCase()).filter(d => d);
      distractions.forEach(d => {
        distractionCounts[d] = (distractionCounts[d] || 0) + 1;
      });
    }
  });

  const commonDistractions = Object.entries(distractionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([d]) => d);

  // Mood trend analysis
  const moodCounts = {};
  sessions.forEach(s => {
    if (s.mood) {
      moodCounts[s.mood] = (moodCounts[s.mood] || 0) + 1;
    }
  });

  const positiveMoods = ['Very Productive', 'Productive', 'Focused'].reduce((sum, m) => sum + (moodCounts[m] || 0), 0);
  const totalMoods = Object.values(moodCounts).reduce((sum, c) => sum + c, 0);
  const moodTrend = totalMoods > 0 && positiveMoods / totalMoods > 0.6 ? 'mostly_stable' : 'variable';

  const reportData = {
    report_type: 'student_monthly',
    student_id: studentId,
    month,
    hours_per_week: hoursPerWeek,
    weekly_focus_scores: weeklyFocusScores,
    trend,
    common_distractions: commonDistractions,
    mood_trend: moodTrend,
    notes: `Study pattern analysis for ${month}. ${trend === 'slightly_down_in_last_week' ? 'Consider maintaining consistent study hours.' : 'Keep up the good work!'}`,
    recommendations: [
      'Try to keep weekly study hours above 10 to stay on track.',
      'Maintain consistent start times around your peak focus window.',
      'Schedule short breaks every 45–60 minutes to avoid burnout.'
    ]
  };

  // Save to database
  await saveReport({
    reportType: 'STUDENT',
    ownerId: studentId,
    periodStart: monthStart,
    periodEnd: monthEnd,
    data: reportData
  });

  return reportData;
}

/**
 * Generate instructor summary report matching Instructor-summary-report.json template
 * @param {string} instructorId - UUID of the instructor
 * @param {string} courseId - UUID of the course
 * @param {string} range - 'weekly' or 'monthly'
 * @param {Date} weekStart - Start date for the range
 * @returns {Object} Instructor summary report
 */
async function generateInstructorSummaryReport(instructorId, courseId, range = 'weekly', weekStart = null) {
  if (!weekStart) {
    weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Last Monday
  }

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Get course info
  const courseQuery = `SELECT course_name, course_code FROM courses WHERE course_id = $1`;
  const courseResult = await pool.query(courseQuery, [courseId]);
  const course = courseResult.rows[0];

  // Get all students enrolled in this course
  const studentsQuery = `
    SELECT DISTINCT
      u.user_id,
      u.name,
      s.student_number
    FROM enrollments e
    JOIN students s ON e.student_id = s.user_id
    JOIN users u ON s.user_id = u.user_id
    WHERE e.course_id = $1
  `;
  const studentsResult = await pool.query(studentsQuery, [courseId]);
  const students = studentsResult.rows;

  // Privacy check: hide data if < 5 students
  if (students.length < 5) {
    return {
      report_type: 'instructor_summary',
      instructor_id: instructorId,
      course_id: courseId,
      course_name: course.course_name,
      range,
      week_start: weekStart.toISOString().split('T')[0],
      week_end: weekEnd.toISOString().split('T')[0],
      privacy_notice: 'Data hidden for privacy (fewer than 5 students enrolled)',
      students_enrolled: students.length
    };
  }

  // Get study sessions for all students in this course
  const sessionsQuery = `
    SELECT
      ss.*,
      u.name as student_name,
      s.student_number
    FROM study_sessions ss
    JOIN students s ON ss.student_id = s.user_id
    JOIN users u ON s.user_id = u.user_id
    WHERE ss.course_id = $1
      AND ss.is_deleted = false
      AND ss.date >= $2
      AND ss.date <= $3
    ORDER BY ss.date, ss.start_time
  `;

  const sessionsResult = await pool.query(sessionsQuery, [
    courseId,
    weekStart.toISOString().split('T')[0],
    weekEnd.toISOString().split('T')[0]
  ]);

  const sessions = sessionsResult.rows;

  // Calculate average hours per student
  const studentHours = {};
  sessions.forEach(session => {
    if (!studentHours[session.student_id]) {
      studentHours[session.student_id] = 0;
    }
    studentHours[session.student_id] += session.duration_minutes / 60;
  });

  const averageHoursPerStudent = students.length > 0
    ? parseFloat((Object.values(studentHours).reduce((sum, h) => sum + h, 0) / students.length).toFixed(1))
    : 0;

  // Calculate average focus score
  const averageFocusScore = calculateFocusScore(sessions);

  // Identify students at risk
  const studentsAtRisk = [];
  students.forEach(student => {
    const hours = studentHours[student.user_id] || 0;
    const studentSessions = sessions.filter(s => s.student_id === student.user_id);
    const focusScore = calculateFocusScore(studentSessions);

    if (hours < 3) {
      studentsAtRisk.push({
        student_id: student.student_number,
        display_name: student.name,
        reason: 'Low weekly hours (<3h)'
      });
    } else if (focusScore < 60 && studentSessions.length > 0) {
      studentsAtRisk.push({
        student_id: student.student_number,
        display_name: student.name,
        reason: 'Consistently low focus scores'
      });
    }
  });

  // Engagement by day
  const byDay = {};
  sessions.forEach(session => {
    const dateKey = session.date.toISOString().split('T')[0];
    if (!byDay[dateKey]) {
      byDay[dateKey] = { date: dateKey, total_hours: 0 };
    }
    byDay[dateKey].total_hours += session.duration_minutes / 60;
  });

  const engagementByDay = Object.values(byDay).map(day => ({
    date: day.date,
    total_hours: parseFloat(day.total_hours.toFixed(1))
  }));

  // Common distractions
  const distractionCounts = {};
  sessions.forEach(s => {
    if (s.distractions) {
      const distractions = s.distractions.split(',').map(d => d.trim().toLowerCase()).filter(d => d);
      distractions.forEach(d => {
        distractionCounts[d] = (distractionCounts[d] || 0) + 1;
      });
    }
  });

  const commonDistractions = Object.entries(distractionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([d]) => d);

  const reportData = {
    report_type: 'instructor_summary',
    instructor_id: instructorId,
    course_id: courseId,
    course_name: course.course_name,
    range,
    week_start: weekStart.toISOString().split('T')[0],
    week_end: weekEnd.toISOString().split('T')[0],
    average_hours_per_student: averageHoursPerStudent,
    average_focus_score: averageFocusScore,
    students_at_risk: studentsAtRisk,
    engagement_by_day: engagementByDay,
    common_distractions: commonDistractions,
    action_suggestions: [
      'Remind students about recommended weekly study hours.',
      studentsAtRisk.length > 0 ? 'Consider reaching out to at-risk students for support.' : 'Student engagement is healthy.',
      commonDistractions.length > 0 ? `Address common distractions: ${commonDistractions.slice(0, 2).join(', ')}.` : 'No major distraction patterns detected.'
    ]
  };

  // Save to database
  await saveReport({
    reportType: 'CLASS',
    ownerId: instructorId,
    courseId,
    periodStart: weekStart,
    periodEnd: weekEnd,
    data: reportData
  });

  return reportData;
}

/**
 * Generate system diagnostics report matching System-diagnotics-report.json template
 * @returns {Object} System diagnostics report
 */
async function generateSystemDiagnosticsReport() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Count focus models trained
  const modelsQuery = `SELECT COUNT(*) as count FROM focus_models`;
  const modelsResult = await pool.query(modelsQuery);
  const modelsTrained = parseInt(modelsResult.rows[0].count);

  // Get last training run (most recent focus model update)
  const lastTrainingQuery = `SELECT MAX(updated_at) as last_update FROM focus_models`;
  const lastTrainingResult = await pool.query(lastTrainingQuery);
  const lastTrainingRun = lastTrainingResult.rows[0].last_update || now;

  // Count alerts in last 7 days
  const alertsQuery = `
    SELECT COUNT(*) as count
    FROM alerts
    WHERE created_at >= $1
  `;
  const alertsResult = await pool.query(alertsQuery, [sevenDaysAgo]);
  const alertsLast7Days = parseInt(alertsResult.rows[0].count);

  // Notification stats
  const notifQuery = `
    SELECT
      status,
      COUNT(*) as count
    FROM notification_queue
    WHERE enqueued_at >= $1
    GROUP BY status
  `;
  const notifResult = await pool.query(notifQuery, [sevenDaysAgo]);

  const notifications = {
    sent: 0,
    pending: 0,
    failed: 0
  };

  notifResult.rows.forEach(row => {
    if (row.status === 'SENT') notifications.sent = parseInt(row.count);
    else if (row.status === 'QUEUED') notifications.pending = parseInt(row.count);
    else if (row.status === 'FAILED') notifications.failed = parseInt(row.count);
  });

  // Data quality checks
  const sessionsQuery = `
    SELECT COUNT(*) as total,
           COUNT(*) FILTER (WHERE mood IS NULL OR distractions IS NULL) as missing_fields
    FROM study_sessions
    WHERE date >= $1 AND is_deleted = false
  `;
  const sessionsResult = await pool.query(sessionsQuery, [sevenDaysAgo]);
  const dataQuality = {
    sessions_with_missing_fields: parseInt(sessionsResult.rows[0].missing_fields || 0),
    sessions_logged_last_7_days: parseInt(sessionsResult.rows[0].total || 0)
  };

  const reportData = {
    report_type: 'system_diagnostics',
    generated_at: now.toISOString(),
    ai_version: '1.0.0',
    models_trained: modelsTrained,
    last_training_run: lastTrainingRun.toISOString(),
    alerts_last_7_days: alertsLast7Days,
    avg_focus_check_latency_ms: 120, // Placeholder - would need actual monitoring
    notifications,
    data_quality: dataQuality,
    notes: notifications.failed > 0
      ? 'AI and alert pipeline functioning. Monitor failed notifications for possible email configuration issues.'
      : 'AI and alert pipeline functioning normally.'
  };

  // Save to database
  await saveReport({
    reportType: 'SYSTEM',
    ownerId: null,
    periodStart: sevenDaysAgo,
    periodEnd: now,
    data: reportData
  });

  return reportData;
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
  generateStudentMonthlyReport,
  generateInstructorSummaryReport,
  generateSystemDiagnosticsReport,
  saveReport
};

