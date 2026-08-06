const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const { scanLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/authMiddleware');
const { scanRequestSchema, scanUrlRequestSchema, validateBody } = require('../middleware/validationMiddleware');

// Wire up Payload Security Scanner with Zod Validation
router.post(
  '/scan',
  scanLimiter,
  (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      return authenticateToken(req, res, next);
    }
    next();
  },
  validateBody(scanRequestSchema),
  scanController.scanPayload
);

// Wire up URL Phishing Scanner with Zod Validation
router.post(
  '/scan-url',
  scanLimiter,
  (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      return authenticateToken(req, res, next);
    }
    next();
  },
  validateBody(scanUrlRequestSchema),
  scanController.scanUrl
);

module.exports = router;
