// backend/src/controllers/admin.controller.js
const userQueries = require('../db/queries/user.queries');
const courseQueries = require('../db/queries/course.queries'); // You will need this for Part 2

const adminController = {
  // 1. User Management
  getAllUsers: async (req, res, next) => {
    try {
      // Allow filtering by role (e.g., ?role=Instructor)
      const roleFilter = req.query.role;
      const users = await userQueries.getAllUsers(roleFilter);
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  },

  createUser: async (req, res, next) => {
    try {
      // req.body contains { first_name, last_name, email, password, role }
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
      // This calls your softDeleteUser function
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
      // We will build courseQueries.getAllCourses in the next step
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
  }
};

module.exports = adminController;