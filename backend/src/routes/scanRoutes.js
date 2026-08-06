const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const { scanLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/authMiddleware');

// Can scan payload with auth or guest demo token
router.post('/scan', scanLimiter, (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
}, scanController.scanPayload);

// Can scan URL with auth or guest demo token
router.post('/scan-url', scanLimiter, (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
}, scanController.scanUrl);

module.exports = router;
