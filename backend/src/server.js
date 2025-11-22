// src/server.js
const app = require('./app');
const { PORT, DATABASE_URL } = require('./config/env');
const pool = require('./db/pool');

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    console.log(`📊 Database: ${process.env.DB_NAME || 'smart_study_tracker'}`);
    client.release();
    return true;
  } catch (err) {
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
    console.warn('⚠️  Server starting WITHOUT database connection');
    console.warn('⚠️  API endpoints will fail until database is available\n');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`🌐 API: http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

startServer();
