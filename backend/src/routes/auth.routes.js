// src/routes/auth.routes.js
const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/register (student registration)
router.post('/register', authController.registerStudent);

module.exports = router;
