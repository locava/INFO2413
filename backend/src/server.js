// src/server.js
const app = require('./app');
const { PORT, DATABASE_URL } = require('./config/env');
const pool = require('./db/pool');
const logger = require('./utils/logger');
const { startScheduler, stopScheduler } = require('./services/scheduler.service');

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    logger.info('Database connected successfully', {
      database: process.env.DB_NAME || 'smart_study_tracker'
    });
    console.log('✅ Database connected successfully');
    console.log(`📊 Database: ${process.env.DB_NAME || 'smart_study_tracker'}`);
    client.release();
    return true;
  } catch (err) {
    logger.error('Database connection failed', { error: err.message });
    console.error('❌ Database connection failed!');
    console.error('Error:', err.message);
    console.error('\n📋 Setup Instructions:');
    console.error('1. Make sure Docker is running');
    console.error('2. Run: npm run dev:db');
    console.error('3. Wait 10 seconds for database to initialize');
    console.error('4. Run: npm run dev:backend\n');
    return false;
  }
}

// Start server
async function startServer() {
  // Test DB connection first
  const dbConnected = await testDatabaseConnection();

  if (!dbConnected) {
    logger.warn('Server starting WITHOUT database connection');
    console.warn('⚠️  Server starting WITHOUT database connection');
    console.warn('⚠️  API endpoints will fail until database is available\n');
  }

  const server = app.listen(PORT, () => {
    logger.info('Server started', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development'
    });
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`🌐 API: http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}\n`);

    // Start scheduler after server is running
    if (dbConnected) {
      startScheduler();
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    stopScheduler();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    stopScheduler();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });
}

startServer();
