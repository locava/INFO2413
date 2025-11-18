// src/services/studySession.service.js
const studyQueries = require('../db/queries/studySession.queries');

async function createSession(studentId, data) {
  const payload = {
    studentId,
    courseId: data.courseId,
    startTime: data.startTime,
    endTime: data.endTime,
    mood: data.mood || null,
    distractions: data.distractions || null,
  };

  return studyQueries.createStudySession(payload);
}

async function getSessionsByStudent(studentId) {
  return studyQueries.getStudySessionsByStudent(studentId);
}

async function updateSession(studentId, sessionId, data) {
  const payload = {
    studentId,
    sessionId,
    startTime: data.startTime,
    endTime: data.endTime,
    mood: data.mood || null,
    distractions: data.distractions || null,
  };

  return studyQueries.updateStudySession(payload);
}

async function softDeleteSession(studentId, sessionId) {
  return studyQueries.softDeleteStudySession(studentId, sessionId);
}

module.exports = {
  createSession,
  getSessionsByStudent,
  updateSession,
  softDeleteSession,
};
