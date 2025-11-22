// backend/src/db/queries/threshold.queries.js
const pool = require('../pool');

const thresholdQueries = {
  getAllThresholds: async () => {
    const query = `SELECT * FROM system_thresholds ORDER BY id ASC`;
    const result = await pool.query(query);
    return result.rows;
  },

  updateThreshold: async (id, value) => {
    const query = `
      UPDATE system_thresholds 
      SET value = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [value, id]);
    return result.rows[0];
  },

  getThresholdByName: async (settingName) => {
    const query = `SELECT * FROM system_thresholds WHERE setting_name = $1`;
    const result = await pool.query(query, [settingName]);
    return result.rows[0];
  }
};

module.exports = thresholdQueries;