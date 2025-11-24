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
  getStudents: async (req, res, next) => {
    try {
      const courseId = req.params.id;
      const students = await instructorQueries.getCourseStudents(courseId);
      
      res.json({
        success: true,
        data: students
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