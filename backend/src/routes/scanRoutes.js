const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const { scanLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/authMiddleware');

// Can scan with auth or guest demo token
router.post('/scan', scanLimiter, (req, res, next) => {
  // Optional auth middleware attachment
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
}, scanController.scanPayload);

module.exports = router;
