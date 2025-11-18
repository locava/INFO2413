// src/middleware/error.middleware.js
const { sendError } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  return sendError(res, message, status);
}

module.exports = {
  errorHandler,
};
