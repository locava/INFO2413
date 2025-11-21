const express = require('express');
const router = express.Router();
// Use requireAuth for general access (any logged-in user)
const { requireAuth } = require('../middleware/auth.middleware'); 

// If you have an alerts controller, require it here. 
// If not, I have provided a placeholder below to prevent crashes.
let alertsController;
try {
  alertsController = require('../controllers/alerts.controller');
} catch (e) {
  // Fallback if controller doesn't exist yet
  alertsController = {
    createTestAlert: (req, res) => res.json({ message: "Alert test endpoint works!" })
  };
}

// ✅ FIX: Use requireAuth instead of authenticateJWT
router.use(requireAuth);

// Routes
router.post('/test', alertsController.createTestAlert);

module.exports = router;