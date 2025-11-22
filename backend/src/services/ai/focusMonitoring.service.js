// backend/src/services/ai/focusMonitoring.service.js
// Person 4 - AI Module: Real-Time Focus Monitoring Service
// Monitors active study sessions and triggers focus-loss alerts at 75% threshold

const pool = require('../../db/pool');
const { getFocusModel } = require('./focusModel.service');

/**
 * Start monitoring a study session
 * @param {string} studentId - UUID of the student
 * @param {string} courseId - UUID of the course
 * @param {string} sessionId - UUID of the study session
 * @returns {Object} Active session record
 */
async function startSessionMonitoring(studentId, courseId, sessionId) {
  // Check if active session already exists
  const checkQuery = `
    SELECT * FROM active_sessions 
    WHERE session_id = $1 AND is_active = true
  `;
  
  const existing = await pool.query(checkQuery, [sessionId]);
  
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Create new active session
  const insertQuery = `
    INSERT INTO active_sessions (student_id, course_id, session_id, start_time, is_active)
    VALUES ($1, $2, $3, NOW(), true)
    RETURNING *
  `;

  const result = await pool.query(insertQuery, [studentId, courseId, sessionId]);
  return result.rows[0];
}

/**
 * Stop monitoring a study session
 * @param {string} sessionId - UUID of the study session
 */
async function stopSessionMonitoring(sessionId) {
  const query = `
    UPDATE active_sessions
    SET is_active = false, end_time = NOW()
    WHERE session_id = $1
    RETURNING *
  `;

  const result = await pool.query(query, [sessionId]);
  return result.rows[0];
}

/**
 * Check all active sessions and trigger alerts if needed
 * This should be called periodically (e.g., every 5 minutes via cron)
 */
async function checkActiveSessions() {
  // Get all active sessions
  const query = `
    SELECT 
      as_table.active_session_id,
      as_table.student_id,
      as_table.course_id,
      as_table.session_id,
      as_table.start_time,
      as_table.last_alert_sent_at,
      EXTRACT(EPOCH FROM (NOW() - as_table.start_time)) / 60 AS elapsed_minutes,
      u.email,
      u.name AS student_name,
      c.course_name,
      c.instructor_id
    FROM active_sessions as_table
    JOIN users u ON as_table.student_id = u.user_id
    JOIN courses c ON as_table.course_id = c.course_id
    WHERE as_table.is_active = true
  `;

  const result = await pool.query(query);
  const activeSessions = result.rows;

  const alertsTriggered = [];

  for (const session of activeSessions) {
    // Get focus model for this student/course
    const focusModel = await getFocusModel(session.student_id, session.course_id);
    
    const focusLossThreshold = focusModel.typical_focus_loss_minutes || 60;
    const alertThreshold = focusLossThreshold * 0.75; // 75% rule

    // Check if we should trigger an alert
    if (session.elapsed_minutes >= alertThreshold && !session.last_alert_sent_at) {
      // Trigger alert
      const alert = await createFocusLossAlert({
        studentId: session.student_id,
        courseId: session.course_id,
        sessionId: session.session_id,
        activeSessionId: session.active_session_id,
        elapsedMinutes: Math.round(session.elapsed_minutes),
        thresholdMinutes: alertThreshold,
        instructorId: session.instructor_id,
        studentName: session.student_name,
        courseName: session.course_name
      });

      alertsTriggered.push(alert);

      // Update active session to mark alert sent
      await pool.query(
        `UPDATE active_sessions SET last_alert_sent_at = NOW() WHERE active_session_id = $1`,
        [session.active_session_id]
      );
    }
  }

  return {
    sessionsChecked: activeSessions.length,
    alertsTriggered: alertsTriggered.length,
    alerts: alertsTriggered
  };
}

/**
 * Create focus-loss alert and notification
 */
async function createFocusLossAlert({
  studentId,
  courseId,
  sessionId,
  activeSessionId,
  elapsedMinutes,
  thresholdMinutes,
  instructorId,
  studentName,
  courseName
}) {
  // Create alert for student
  const studentAlertQuery = `
    INSERT INTO alerts (
      alert_type,
      recipient_user_id,
      student_id,
      course_id,
      trigger_detail,
      status
    )
    VALUES ($1, $2, $3, $4, $5, 'QUEUED')
    RETURNING *
  `;

  const triggerDetail = {
    sessionId,
    activeSessionId,
    elapsedMinutes,
    thresholdMinutes,
    message: `You've been studying for ${elapsedMinutes} minutes. Consider taking a break soon to maintain focus.`
  };

  const studentAlert = await pool.query(studentAlertQuery, [
    'FOCUS_LOSS_APPROACHING',
    studentId,
    studentId,
    courseId,
    JSON.stringify(triggerDetail)
  ]);

  // Create notification queue entry for student
  await pool.query(
    `INSERT INTO notification_queue (alert_id, channel, status) VALUES ($1, 'IN_APP', 'QUEUED')`,
    [studentAlert.rows[0].alert_id]
  );

  // Create alert for instructor
  const instructorTriggerDetail = {
    sessionId,
    activeSessionId,
    elapsedMinutes,
    thresholdMinutes,
    studentName,
    courseName,
    message: `Student ${studentName} has been studying ${courseName} for ${elapsedMinutes} minutes and may need a break.`
  };

  const instructorAlert = await pool.query(studentAlertQuery, [
    'STUDENT_FOCUS_LOSS_APPROACHING',
    instructorId,
    studentId,
    courseId,
    JSON.stringify(instructorTriggerDetail)
  ]);

  // Create notification queue entry for instructor
  await pool.query(
    `INSERT INTO notification_queue (alert_id, channel, status) VALUES ($1, 'IN_APP', 'QUEUED')`,
    [instructorAlert.rows[0].alert_id]
  );

  return {
    studentAlert: studentAlert.rows[0],
    instructorAlert: instructorAlert.rows[0],
    triggerDetail
  };
}

module.exports = {
  startSessionMonitoring,
  stopSessionMonitoring,
  checkActiveSessions,
  createFocusLossAlert
};

