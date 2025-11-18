// src/config/env.js
require('dotenv').config();

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

if (!DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL is not set in .env');
}

module.exports = {
  PORT,
  NODE_ENV,
  DATABASE_URL,
  JWT_SECRET,
};
