// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

function authenticateJWT(req, res, next) {
  const header = req.headers['authorization'];

  if (!header) {
    return res.status(401).json({ message: 'Missing Authorization header' });
  }

  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return res
      .status(401)
      .json({ message: 'Authorization header must be: Bearer <token>' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { userId, role }
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = {
  authenticateJWT,
};
