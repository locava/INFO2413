// src/config/env.js
require('dotenv').config();

const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Build DATABASE_URL from individual env vars or use provided URL
const DATABASE_URL = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'smart_study_tracker'}`;

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const SESSION_SECRET = process.env.SESSION_SECRET || 'study_tracker_secret_key_2024_info2413';

// Database config for pg Pool (used by pool.js)
const DB_CONFIG = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'smart_study_tracker',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
};

module.exports = {
  PORT,
  NODE_ENV,
  DATABASE_URL,
  JWT_SECRET,
  SESSION_SECRET,
  DB_CONFIG,
};
