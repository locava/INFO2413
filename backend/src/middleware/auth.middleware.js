const requireAuth = (req, res, next) => {
  // Check if the user is logged in (session exists)
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized: Please log in' });
};

const requireRole = (requiredRole) => {
  return (req, res, next) => {
    // 1. Ensure user is logged in first
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    // 2. Check if the user's role matches the required role
    // (We also allow 'Administrator' to access everything, just in case)
    if (req.session.user.role === requiredRole || req.session.user.role === 'Administrator') {
      return next();
    }

    // 3. If not, block access
    return res.status(403).json({ 
      message: `Forbidden: You need to be a ${requiredRole} to access this.` 
    });
  };
};

module.exports = { requireAuth, requireRole };