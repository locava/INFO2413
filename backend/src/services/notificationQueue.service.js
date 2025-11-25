// src/services/notificationQueue.service.js
const queueQueries = require('../db/queries/notificationQueue.queries');
const alertQueries = require('../db/queries/alert.queries');
const pool = require('../db/pool');
const { sendFocusLossAlert, sendWeeklyReportEmail } = require('../utils/emailService');
const logger = require('../utils/logger');

/**
 * Enqueue a notification for an alert.
 * Assumes notification_queue table has:
 *   id, alert_id, recipient_user_id, channel, status, attempts, created_at, sent_at
 */
async function enqueueNotification({ alertId, recipientUserId, channel }) {
  // Check for duplicate (idempotency)
  const existing = await queueQueries.findExistingQueueItem(alertId, recipientUserId, channel);
  if (existing) {
    logger.logNotification('duplicate_prevented', {
      alertId,
      recipientUserId,
      channel,
      existingId: existing.queue_id
    });
    return existing;
  }

  return queueQueries.createQueueItem({
    alertId,
    recipientUserId,
    channel,
  });
}

/**
 * Dispatch pending notifications from the queue.
 * Sends actual emails for EMAIL channel.
 */
async function dispatchPendingNotifications() {
  const pendingItems = await queueQueries.getPendingQueueItems();

  logger.logNotification('dispatch_started', {
    pendingCount: pendingItems.length
  });

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (const item of pendingItems) {
    try {
      if (item.channel === 'EMAIL') {
        // Get alert details and user email
        const alertDetails = await getAlertDetails(item.alert_id);

        if (!alertDetails || !alertDetails.email) {
          logger.warn('Cannot send email - missing alert details or email', {
            queueId: item.queue_id,
            alertId: item.alert_id
          });
          await queueQueries.markQueueItemFailed(item.queue_id, 'Missing email address');
          failureCount++;
          continue;
        }

        // Send email based on alert type
        let emailResult;
        if (alertDetails.alert_type === 'FOCUS_LOSS') {
          emailResult = await sendFocusLossAlert({
            to: alertDetails.email,
            studentName: alertDetails.student_name,
            courseName: alertDetails.course_name,
            elapsedMinutes: alertDetails.elapsed_minutes,
            thresholdMinutes: alertDetails.threshold_minutes
          });
        } else {
          // Generic alert email
          emailResult = await sendFocusLossAlert({
            to: alertDetails.email,
            studentName: alertDetails.student_name || 'Student',
            courseName: alertDetails.course_name || 'your course',
            elapsedMinutes: alertDetails.elapsed_minutes || 60,
            thresholdMinutes: alertDetails.threshold_minutes || 75
          });
        }

        if (emailResult.success) {
          await queueQueries.markQueueItemSent(item.queue_id, emailResult.messageId);
          successCount++;
          logger.logNotification('email_dispatched', {
            queueId: item.queue_id,
            alertId: item.alert_id,
            messageId: emailResult.messageId,
            simulated: emailResult.simulated
          });
        } else {
          await queueQueries.markQueueItemFailed(item.queue_id, emailResult.error);
          failureCount++;
        }
      } else {
        // IN_APP notifications are handled differently (just mark as sent)
        await queueQueries.markQueueItemSent(item.queue_id, null);
        successCount++;
      }

      results.push(item);
    } catch (error) {
      logger.error('Error dispatching notification', {
        queueId: item.queue_id,
        error: error.message
      });
      await queueQueries.markQueueItemFailed(item.queue_id, error.message);
      failureCount++;
    }
  }

  logger.logNotification('dispatch_completed', {
    total: pendingItems.length,
    success: successCount,
    failed: failureCount
  });

  return {
    processed: results.length,
    success: successCount,
    failed: failureCount,
    items: results,
  };
}

/**
 * Get alert details including user email
 */
async function getAlertDetails(alertId) {
  const query = `
    SELECT
      a.alert_id,
      a.alert_type,
      a.trigger_detail,
      u.email,
      u.name as student_name,
      c.course_name,
      a.trigger_detail->>'elapsed_minutes' as elapsed_minutes,
      a.trigger_detail->>'threshold_minutes' as threshold_minutes
    FROM alerts a
    JOIN users u ON a.recipient_user_id = u.user_id
    LEFT JOIN courses c ON a.course_id = c.course_id
    WHERE a.alert_id = $1
  `;

  const result = await pool.query(query, [alertId]);
  return result.rows[0] || null;
}

module.exports = {
  enqueueNotification,
  dispatchPendingNotifications,
};
