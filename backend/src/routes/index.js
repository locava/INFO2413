// src/routes/index.js
const express = require('express');
const authRouter = require('./auth.routes');
const studentRouter = require('./student.routes');
const instructorRouter = require('./instructor.routes');
const adminRouter = require('./admin.routes');
const alertsRouter = require('./alerts.routes');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/student', studentRouter);
router.use('/instructor', instructorRouter);
router.use('/admin', adminRouter);
router.use('/alerts', alertsRouter);

module.exports = router;
