// src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return sendSuccess(res, result, 200);
  } catch (err) {
    return next(err);
  }
}

async function registerStudent(req, res, next) {
  try {
    const payload = req.body; // { name, email, password, studentNumber, ... }
    const result = await authService.registerStudent(payload);
    return sendSuccess(res, result, 201);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  login,
  registerStudent,
};
