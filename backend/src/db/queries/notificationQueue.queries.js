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

async function markQueueItemSent(id) {
  const res = await pool.query(
    `
    UPDATE notification_queue
    SET status = 'SENT',
        sent_at = NOW()
    WHERE queue_id = $1
    RETURNING *
    `,
    [id]
  );

  return res.rows[0];
}

module.exports = {
  createQueueItem,
  getPendingQueueItems,
  markQueueItemSent,
};
