// backend/src/controllers/admin.controller.js
const userQueries = require('../db/queries/user.queries');
const courseQueries = require('../db/queries/course.queries');

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
  }


};

module.exports = adminController;