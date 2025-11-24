// backend/src/controllers/instructor.controller.js

// Try to require from the queries folder. 
// If you put your queries in 'src/db/queries', change this path to '../db/queries/instructor.queries'
const instructorQueries = require('../db/queries/instructor.queries');
const courseService = require('../services/course.service');

const instructorController = {
  // GET /api/instructor/courses
  getCourses: async (req, res, next) => {
    try {
      // The user_id comes from the session
      const instructorId = req.session.user.user_id;
      
      // ✅ FIX: Call the secure service function that filters by instructorId
      const courses = await courseService.getCoursesByInstructor(instructorId);
      
      res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      next(error);
    }
    },

  // GET /api/instructor/course/:id/students
  getStudents: async (req, res, next) => { // ✅ MODIFIED
      try {
        const courseId = req.params.id;
        // ✅ NEW: Extract search filters from query string
        const filters = {
            name: req.query.name,
            // academicPerformance: req.query.performance // future filter
        };

        const students = await instructorQueries.getCourseStudents(courseId, filters);
        
        res.json({
          success: true,
          data: students
        });
      } catch (error) {
        next(error);
      }
    },

    getStudentSessions: async (req, res, next) => {
      try {
        const instructorId = req.session.user.user_id; // Check permissions if needed
        const { studentId, courseId } = req.params;
        
        // NOTE: For true security, you should verify if instructorId is the course instructor.
        
        const sessions = await instructorQueries.getStudentSessions(studentId, courseId);
        
        res.json({
            success: true,
            data: sessions
        });
      } catch (error) {
        next(error);
      }
    },

  // GET /api/instructor/reports/course/:id
  getCourseReport: async (req, res, next) => {
    try {
      const courseId = req.params.id;
      const report = await instructorQueries.getCourseReport(courseId);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = instructorController;