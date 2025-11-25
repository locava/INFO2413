// backend/src/utils/logger.js
// Structured logging utility using Winston

const winston = require('winston');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'study-tracker-backend' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: consoleFormat
    })
  ]
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error' 
  }));
  logger.add(new winston.transports.File({ 
    filename: 'logs/combined.log' 
  }));
}

// Helper methods for common logging patterns
logger.logAuth = (action, userId, success, details = {}) => {
  logger.info('Authentication event', {
    action,
    userId,
    success,
    ...details
  });
};

logger.logSecurity = (event, details = {}) => {
  logger.warn('Security event', {
    event,
    ...details
  });
};

logger.logAI = (operation, details = {}) => {
  logger.info('AI operation', {
    operation,
    ...details
  });
};

logger.logNotification = (action, details = {}) => {
  logger.info('Notification event', {
    action,
    ...details
  });
};

module.exports = logger;

