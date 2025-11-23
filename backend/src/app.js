const express = require('express');
const cors = require('cors');
const session = require('express-session');
const routes = require('./routes'); // This imports index.js from routes
require('dotenv').config();

const app = express();

// 1. CORS Middleware (Must be first) - Enhanced Security
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,               // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));

// 2. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Session Middleware - Enhanced Security
// This creates 'req.session' on every request
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_key_change_in_production',
  resave: false,
  saveUninitialized: false, // Don't create session until something is stored
  name: 'sessionId', // Custom name instead of default 'connect.sid'
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,      // Prevents client-side JS from accessing the cookie
    sameSite: 'lax',     // CSRF protection
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// 4. Mount API Routes
app.use('/api', routes);

// 5. Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;