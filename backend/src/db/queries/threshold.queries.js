// backend/src/db/queries/threshold.queries.js
const pool = require('../pool');

const thresholdQueries = {
  getAllThresholds: async () => {
    const query = `SELECT * FROM system_thresholds ORDER BY name ASC`;
    const result = await pool.query(query);
    return result.rows;
  },

  updateThreshold: async (thresholdId, valueNumeric, valueText, updatedBy) => {
    const query = `
      UPDATE system_thresholds
      SET value_numeric = $1, value_text = $2, updated_by = $3, updated_at = NOW()
      WHERE threshold_id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [valueNumeric, valueText, updatedBy, thresholdId]);
    return result.rows[0];
  },

  getThresholdByName: async (name) => {
    const query = `SELECT * FROM system_thresholds WHERE name = $1`;
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }
};

module.exports = thresholdQueries;