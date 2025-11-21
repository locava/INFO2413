const express = require('express');
const cors = require('cors');
const session = require('express-session');
const routes = require('./routes'); // This imports index.js from routes
require('dotenv').config();

const app = express();

// 1. CORS Middleware (Must be first)
app.use(cors({
  origin: 'http://localhost:5173', // Your Frontend URL
  credentials: true,               // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// 2. Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Session Middleware (The Fix for your error)
// This creates 'req.session' on every request
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_key', // Change this in production
  resave: false,
  saveUninitialized: false, // Don't create session until something is stored
  cookie: {
    secure: false, // Set to true if using https
    httpOnly: true,
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