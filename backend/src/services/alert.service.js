// src/services/alert.service.js
const alertQueries = require('../db/queries/alert.queries');
const notificationQueueService = require('./notificationQueue.service');
const aiClient = require('../integration/aiReports.client');

/**
 * For /api/alerts/test
 * - Create an alert row
 * - Enqueue a notification with status = PENDING
 */
async function createTestAlert({
  triggeredByUserId,
  message,
  type,
  studentId,
  courseId,
}) {
  // Use triggeredByUserId as studentId if not provided
  const finalStudentId = studentId || triggeredByUserId;

  // 1) Create alert in alerts table
  const alert = await alertQueries.createAlert({
    type,
    message,
    studentId: finalStudentId,
    courseId,
    triggeredByUserId,
  });

  // 2) Enqueue notification for this alert
  const queueItem = await notificationQueueService.enqueueNotification({
    alertId: alert.alert_id,
    channel: 'EMAIL', // placeholder – could be 'SMS' or 'IN_APP'
    recipientUserId: finalStudentId,
  });

  return {
    alert,
    queueItem,
  };
}

/**
 * For /api/alerts/run-focus-check
 * In final version:
 * - ask AI/logic (Person 4) to compute focus-loss alerts
 * - write them into alerts + notification_queue
 *
 * For now:
 * - call runFocusAlertCheck() stub
 * - return its result (no DB write, or minimal placeholder)
 */
async function runFocusAlertCheck() {
  // This is where you'd pass active sessions etc.
  const result = await aiClient.runFocusAlertCheck();

  // Example structure you might implement later:
  // result = [{ studentId, courseId, message, type }, ...]

  // For now just return the stub output
  return {
    status: 'FOCUS_CHECK_CALLED',
    data: result,
  };
}

module.exports = {
  createTestAlert,
  runFocusAlertCheck,
};
