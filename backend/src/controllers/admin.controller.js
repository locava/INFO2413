// backend/src/controllers/admin.controller.js
const userQueries = require('../db/queries/user.queries');
const courseQueries = require('../db/queries/course.queries');
const enrollmentQueries = require('../db/queries/enrollment.queries');

const adminController = {
  // 1. User Management
  getAllUsers: async (req, res, next) => {
    try {
      const roleFilter = req.query.role;
      const users = await userQueries.getAllUsers(roleFilter);
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  },

  createUser: async (req, res, next) => {
    try {
      const newUser = await userQueries.create(req.body);
      res.status(201).json({ success: true, data: newUser });
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const userId = req.params.id;
      const updatedUser = await userQueries.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      res.json({ success: true, data: updatedUser });
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const userId = req.params.id;
      const deletedUser = await userQueries.softDeleteUser(userId);
      
      if (!deletedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.json({ success: true, message: "User deactivated successfully" });
    } catch (error) {
      next(error);
    }
  },

  // 2. Course Management (Placeholders for Part 2)
  getAllCourses: async (req, res, next) => {
    try {
      const courses = await courseQueries.getAllCourses(); 
      res.json({ success: true, data: courses });
    } catch (error) {
      next(error);
    }
  },

  createCourse: async (req, res, next) => {
    try {
      const newCourse = await courseQueries.createCourse(req.body);
      res.status(201).json({ success: true, data: newCourse });
    } catch (error) {
      next(error);
    }
  },

  deleteCourse: async (req, res, next) => {
    try {
      const courseId = req.params.id;
      await courseQueries.deleteCourse(courseId);
      res.json({ success: true, message: "Course deleted" });
    } catch (error) {
      next(error);
    }
  },

  // 2.5 Enrollment Management
  getStudentEnrollments: async (req, res, next) => {
    try {
      const studentId = req.params.studentId;
      const enrollments = await enrollmentQueries.getEnrollmentsByStudent(studentId);
      res.json({ success: true, data: enrollments });
    } catch (error) {
      next(error);
    }
  },

  enrollStudent: async (req, res, next) => {
    try {
      const { studentId, courseId } = req.body;

      if (!studentId || !courseId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID and Course ID are required'
        });
      }

      // Check if already enrolled
      const existing = await enrollmentQueries.checkEnrollment(studentId, courseId);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Student is already enrolled in this course'
        });
      }

      const enrollment = await enrollmentQueries.enrollStudent(studentId, courseId);
      res.status(201).json({
        success: true,
        message: 'Student enrolled successfully',
        data: enrollment
      });
    } catch (error) {
      next(error);
    }
  },

  unenrollStudent: async (req, res, next) => {
    try {
      const { studentId, courseId } = req.params;

      const result = await enrollmentQueries.removeEnrollment(studentId, courseId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      res.json({
        success: true,
        message: 'Student unenrolled successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // 3. System Thresholds
  getThresholds: async (req, res, next) => {
    try {
      const thresholds = await require('../db/queries/threshold.queries').getAllThresholds();
      res.json({ success: true, data: thresholds });
    } catch (error) {
      next(error);
    }
  },

  updateThreshold: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { value } = req.body;
      
      const updated = await require('../db/queries/threshold.queries').updateThreshold(id, value);
      
      if (!updated) {
        return res.status(404).json({ success: false, message: "Threshold not found" });
      }

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  // 4. System Reports
  getSystemReports: async (req, res, next) => {
    try {
      // Import inline or at top
      const reportQueries = require('../db/queries/report.queries');
      const stats = await reportQueries.getSystemStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  // 5. Alerts & Notifications
  getAlerts: async (req, res, next) => {
    try {
      const pool = require('../db/pool');
      const limit = parseInt(req.query.limit) || 50;

      const query = `
        SELECT
          a.alert_id,
          a.alert_type,
          a.recipient_user_id,
          a.student_id,
          a.course_id,
          a.trigger_detail,
          a.status,
          a.created_at,
          u.name as recipient_name,
          s.name as student_name,
          c.course_name
        FROM alerts a
        LEFT JOIN users u ON a.recipient_user_id = u.user_id
        LEFT JOIN users s ON a.student_id = s.user_id
        LEFT JOIN courses c ON a.course_id = c.course_id
        ORDER BY a.created_at DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  getNotifications: async (req, res, next) => {
    try {
      const pool = require('../db/pool');
      const limit = parseInt(req.query.limit) || 50;

      const query = `
        SELECT
          nq.queue_id,
          nq.alert_id,
          nq.channel,
          nq.status,
          nq.enqueued_at,
          nq.sent_at,
          a.alert_type,
          a.recipient_user_id,
          u.name as recipient_name
        FROM notification_queue nq
        LEFT JOIN alerts a ON nq.alert_id = a.alert_id
        LEFT JOIN users u ON a.recipient_user_id = u.user_id
        ORDER BY nq.enqueued_at DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  // 6. Data Quality Monitoring
  getDataQuality: async (req, res, next) => {
    try {
      const pool = require('../db/pool');

      // Get various data quality metrics
      const queries = await Promise.all([
        // Sessions with missing fields
        pool.query(`
          SELECT COUNT(*) as count
          FROM study_sessions
          WHERE mood IS NULL OR distractions IS NULL
        `),

        // Sessions in last 7 days
        pool.query(`
          SELECT COUNT(*) as count
          FROM study_sessions
          WHERE date >= CURRENT_DATE - INTERVAL '7 days'
        `),

        // Users with no sessions
        pool.query(`
          SELECT COUNT(*) as count
          FROM users u
          WHERE u.role = 'Student'
          AND NOT EXISTS (
            SELECT 1 FROM study_sessions ss WHERE ss.student_id = u.user_id
          )
        `),

        // Courses with no enrollments
        pool.query(`
          SELECT COUNT(*) as count
          FROM courses c
          WHERE c.is_active = true
          AND NOT EXISTS (
            SELECT 1 FROM enrollments e WHERE e.course_id = c.course_id
          )
        `),

        // Average session duration
        pool.query(`
          SELECT AVG(duration_minutes) as avg_duration
          FROM study_sessions
          WHERE duration_minutes > 0
        `)
      ]);

      const dataQuality = {
        sessions_with_missing_fields: parseInt(queries[0].rows[0].count),
        sessions_last_7_days: parseInt(queries[1].rows[0].count),
        students_with_no_sessions: parseInt(queries[2].rows[0].count),
        courses_with_no_enrollments: parseInt(queries[3].rows[0].count),
        avg_session_duration_minutes: parseFloat(queries[4].rows[0].avg_duration || 0).toFixed(1)
      };

      res.json({ success: true, data: dataQuality });
    } catch (error) {
      next(error);
    }
  }

};

module.exports = adminController;