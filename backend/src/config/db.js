// src/config/db.js
const { Pool } = require('pg');
const { DATABASE_URL } = require('./env');

const pool = new Pool({
  connectionString: DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected PG pool error', err);
  process.exit(-1);
});

async function query(text, params) {
  return pool.query(text, params);
}

function getPool() {
  return pool;
}

module.exports = {
  query,
  getPool,
};
