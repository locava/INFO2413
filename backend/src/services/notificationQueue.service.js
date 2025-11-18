// src/services/notificationQueue.service.js
const queueQueries = require('../db/queries/notificationQueue.queries');

/**
 * Enqueue a notification for an alert.
 * Assumes notification_queue table has:
 *   id, alert_id, recipient_user_id, channel, status, attempts, created_at, sent_at
 */
async function enqueueNotification({ alertId, recipientUserId, channel }) {
  return queueQueries.createQueueItem({
    alertId,
    recipientUserId,
    channel,
  });
}

/**
 * Placeholder for background dispatcher.
 * In a real app this might:
 * - select PENDING items
 * - send emails
 * - mark as SENT / FAILED
 */
async function dispatchPendingNotifications() {
  const pendingItems = await queueQueries.getPendingQueueItems();

  // For Monday, you can just log them or simulate sending.
  // Here we'll just mark them as SENT.
  const results = [];

  for (const item of pendingItems) {
    // TODO: actually send email/sms etc.
    const updated = await queueQueries.markQueueItemSent(item.id);
    results.push(updated);
  }

  return {
    processed: results.length,
    items: results,
  };
}

module.exports = {
  enqueueNotification,
  dispatchPendingNotifications,
};
