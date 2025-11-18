// src/routes/index.js
const express = require('express');
const authRouter = require('./auth.routes');
// later: const studentRouter = require('./student.routes'); etc.

const router = express.Router();

// Auth routes
router.use('/auth', authRouter);

// TODO: later
// router.use('/student', studentRouter);
// router.use('/instructor', instructorRouter);
// router.use('/admin', adminRouter);
// router.use('/alerts', alertsRouter);

module.exports = router;
