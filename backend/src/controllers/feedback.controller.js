// backend/src/controllers/feedback.controller.js
// Controller for instructor feedback feature (FR-I4)

const feedbackQueries = require('../db/queries/feedback.queries');
const logger = require('../utils/logger');

const feedbackController = {
  // POST /api/instructor/courses/:courseId/feedback
  createFeedback: async (req, res, next) => {
    try {
      const { courseId } = req.params;
      const instructorId = req.session.user.user_id;
      const { studentId, feedbackType, message } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Feedback message is required'
        });
      }

      // Verify instructor teaches this course
      const pool = require('../db/pool');
      const courseCheck = await pool.query(
        'SELECT * FROM courses WHERE course_id = $1 AND instructor_id = $2',
        [courseId, instructorId]
      );

      if (courseCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to add feedback to this course'
        });
      }

      const feedback = await feedbackQueries.createFeedback({
        instructorId,
        courseId,
        studentId: studentId || null,
        feedbackType: feedbackType || 'GENERAL',
        message: message.trim()
      });

      logger.info('Feedback created', {
        feedbackId: feedback.feedback_id,
        instructorId,
        courseId,
        studentId: studentId || 'course-wide'
      });

      res.json({
        success: true,
        data: feedback,
        message: 'Feedback added successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/instructor/courses/:courseId/feedback
  getCourseFeedback: async (req, res, next) => {
    try {
      const { courseId } = req.params;
      const instructorId = req.session.user.user_id;

      // Verify instructor teaches this course
      const pool = require('../db/pool');
      const courseCheck = await pool.query(
        'SELECT * FROM courses WHERE course_id = $1 AND instructor_id = $2',
        [courseId, instructorId]
      );

      if (courseCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view feedback for this course'
        });
      }

      const feedback = await feedbackQueries.getFeedbackByCourse(courseId);

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/student/feedback (all feedback for logged-in student)
  getStudentFeedback: async (req, res, next) => {
    try {
      const studentId = req.session.user.user_id;
      const feedback = await feedbackQueries.getAllFeedbackForStudent(studentId);

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/student/courses/:courseId/feedback
  getStudentCourseFeedback: async (req, res, next) => {
    try {
      const { courseId } = req.params;
      const studentId = req.session.user.user_id;

      // Verify student is enrolled in this course
      const pool = require('../db/pool');
      const enrollmentCheck = await pool.query(
        'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
        [studentId, courseId]
      );

      if (enrollmentCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }

      const feedback = await feedbackQueries.getFeedbackForStudent(studentId, courseId);

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/instructor/feedback/:feedbackId
  deleteFeedback: async (req, res, next) => {
    try {
      const { feedbackId } = req.params;
      const instructorId = req.session.user.user_id;

      // Verify this feedback belongs to the instructor
      const pool = require('../db/pool');
      const feedbackCheck = await pool.query(
        'SELECT * FROM instructor_feedback WHERE feedback_id = $1 AND instructor_id = $2',
        [feedbackId, instructorId]
      );

      if (feedbackCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this feedback'
        });
      }

      await feedbackQueries.deleteFeedback(feedbackId);

      logger.info('Feedback deleted', { feedbackId, instructorId });

      res.json({
        success: true,
        message: 'Feedback deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = feedbackController;

