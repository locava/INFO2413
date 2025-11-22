const pool = require('../pool');

async function createQueueItem({ alertId, recipientUserId, channel }) {
  const res = await pool.query(
    `
    INSERT INTO notification_queue (alert_id, recipient_user_id, channel, status, attempts)
    VALUES ($1, $2, $3, 'PENDING', 0)
    RETURNING *
    `,
    [alertId, recipientUserId, channel]
  );

  return res.rows[0];
}

async function getPendingQueueItems() {
  const res = await pool.query(
    `
    SELECT *
    FROM notification_queue
    WHERE status = 'PENDING'
    ORDER BY created_at ASC
    `
  );

  return res.rows;
}

async function markQueueItemSent(id) {
  const res = await pool.query(
    `
    UPDATE notification_queue
    SET status = 'SENT',
        attempts = attempts + 1,
        sent_at = NOW()
    WHERE id = $1
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
