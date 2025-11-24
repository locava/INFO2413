// backend/src/services/studySession.service.js
const studyQueries = require('../db/queries/studySession.queries');

async function createSession(studentId, data) {
  // ✅ Robust Check: Look for duration in all possible field names
  const durationValue = data.duration || data.durationMinutes || data.duration_minutes || 0;

  const payload = {
    studentId,
    courseId: data.courseId,
    date: data.date || (data.startTime ? new Date(data.startTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
    startTime: data.startTime,
    endTime: data.endTime,
    // ✅ Ensure we parse it to an integer
    durationMinutes: parseInt(durationValue), 
    mood: data.mood || null,
    distractions: data.distractions || null,
  };

  // Extra safety: Ensure duration is at least 1 minute to satisfy the DB check
  if (payload.durationMinutes <= 0) {
    throw new Error("Duration must be at least 1 minute");
  }

  return studyQueries.createStudySession(payload);
}

async function getSessionsByStudent(studentId, filters) { // ✅ ACCEPT filters
  return studyQueries.getStudySessionsByStudent(studentId, filters); // ✅ PASS filters
}

async function updateSession(studentId, sessionId, data) {
  // ✅ Same robust check for updates
  const durationValue = data.duration || data.durationMinutes || data.duration_minutes || 0;

  const payload = {
    studentId,
    sessionId,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    durationMinutes: parseInt(durationValue),
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