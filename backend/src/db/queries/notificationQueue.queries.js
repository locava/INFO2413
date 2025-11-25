const pool = require('../pool');

async function createQueueItem({ alertId, recipientUserId, channel }) {
  const res = await pool.query(
    `
    INSERT INTO notification_queue (alert_id, channel, status)
    VALUES ($1, $2, 'QUEUED')
    RETURNING *
    `,
    [alertId, channel]
  );

  return res.rows[0];
}

async function getPendingQueueItems() {
  const res = await pool.query(
    `
    SELECT *
    FROM notification_queue
    WHERE status = 'QUEUED'
    ORDER BY enqueued_at ASC
    `
  );

  return res.rows;
}

async function markQueueItemSent(id, messageId = null) {
  const res = await pool.query(
    `
    UPDATE notification_queue
    SET status = 'SENT',
        sent_at = NOW(),
        provider_message_id = $2
    WHERE queue_id = $1
    RETURNING *
    `,
    [id, messageId]
  );

  return res.rows[0];
}

async function markQueueItemFailed(id, errorMessage) {
  const res = await pool.query(
    `
    UPDATE notification_queue
    SET status = 'FAILED',
        error_message = $2,
        attempts = attempts + 1
    WHERE queue_id = $1
    RETURNING *
    `,
    [id, errorMessage]
  );

  return res.rows[0];
}

async function findExistingQueueItem(alertId, recipientUserId, channel) {
  const res = await pool.query(
    `
    SELECT *
    FROM notification_queue
    WHERE alert_id = $1
      AND channel = $2
      AND status IN ('QUEUED', 'SENT')
    LIMIT 1
    `,
    [alertId, channel]
  );

  return res.rows[0] || null;
}

module.exports = {
  createQueueItem,
  getPendingQueueItems,
  markQueueItemSent,
  markQueueItemFailed,
  findExistingQueueItem,
};
