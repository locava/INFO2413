const userQueries = require('../db/queries/user.queries');
const courseQueries = require('../db/queries/course.queries');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const users = await userQueries.getAllUsers(role);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    // Simple wrapper around existing user create
    const newUser = await userQueries.create(req.body);
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userQueries.softDeleteUser(id);
    res.json({ success: true, message: "User deactivated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await courseQueries.getAllCourses();
    res.json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const newCourse = await courseQueries.createCourse(req.body);
    res.status(201).json({ success: true, data: newCourse });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    await courseQueries.deleteCourse(id);
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    next(error);
  }
};