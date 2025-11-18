// src/controllers/student.controller.js
const studySessionService = require('../services/studySession.service');
const { sendSuccess } = require('../utils/response');

async function createStudySession(req, res, next) {
  try {
    const studentId = req.user.userId;
    const payload = req.body;

    const session = await studySessionService.createSession(studentId, payload);

    return sendSuccess(res, session, 201);
  } catch (err) {
    next(err);
  }
}

async function getStudySessions(req, res, next) {
  try {
    const studentId = req.user.userId;

    const sessions = await studySessionService.getSessionsByStudent(studentId);

    return sendSuccess(res, sessions, 200);
  } catch (err) {
    next(err);
  }
}

async function updateStudySession(req, res, next) {
  try {
    const studentId = req.user.userId;
    const sessionId = req.params.id;
    const payload = req.body;

    const session = await studySessionService.updateSession(
      studentId,
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
    const studentId = req.user.userId;
    const sessionId = req.params.id;

    await studySessionService.softDeleteSession(studentId, sessionId);

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
