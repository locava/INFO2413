// src/app.js
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// All API routes under /api
app.use('/api', routes);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
