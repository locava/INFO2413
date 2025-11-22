// src/controllers/student.controller.js
const studySessionService = require('../services/studySession.service');
const studentQueries = require('../db/queries/student.queries'); 
const { sendSuccess } = require('../utils/response');

async function createStudySession(req, res, next) {
  try {
    const userId = req.session.user.user_id;

    const student = await studentQueries.getStudentByUserId(userId);

    if (!student) {
        return res.status(400).json({ 
            success: false, 
            message: "Student profile not found. Please contact admin." 
        });
    }

    const payload = req.body;

    // ✅ FIX: Use user_id if student_id is missing
    const realStudentId = student.student_id || student.user_id;

    const session = await studySessionService.createSession(realStudentId, payload);

    return sendSuccess(res, session, 201);
  } catch (err) {
    next(err);
  }
}

async function getStudySessions(req, res, next) {
  try {
    const userId = req.session.user.user_id;

    const student = await studentQueries.getStudentByUserId(userId);
    if (!student) {
        return sendSuccess(res, [], 200); 
    }

    // ✅ FIX: Added fallback here
    const realStudentId = student.student_id || student.user_id;
    const sessions = await studySessionService.getSessionsByStudent(realStudentId);

    return sendSuccess(res, sessions, 200);
  } catch (err) {
    next(err);
  }
}

async function updateStudySession(req, res, next) {
  try {
    const userId = req.session.user.user_id;
    const sessionId = req.params.id;
    
    const student = await studentQueries.getStudentByUserId(userId);
    if (!student) throw new Error("Student not found");

    const payload = req.body;

    // ✅ FIX: Added fallback here
    const realStudentId = student.student_id || student.user_id;

    const session = await studySessionService.updateSession(
      realStudentId,
      sessionId,
      payload
    );

    return sendSuccess(res, session, 200);
  } catch (err) {
    next(err);
  }
}

async function softDeleteStudySession(req, res, next) {
  try {
    const userId = req.session.user.user_id;
    const sessionId = req.params.id;

    const student = await studentQueries.getStudentByUserId(userId);
    if (!student) throw new Error("Student not found");

    // ✅ FIX: Added fallback here
    const realStudentId = student.student_id || student.user_id;

    await studySessionService.softDeleteSession(realStudentId, sessionId);

    return sendSuccess(res, { deleted: true }, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createStudySession,
  getStudySessions,
  updateStudySession,
  softDeleteStudySession,
};