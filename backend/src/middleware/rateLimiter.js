const rateLimit = require('express-rate-limit');

// Rate Limiter for Authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' }
});

// Rate Limiter for Security Scanner endpoint
const scanLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 scans per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Scan rate limit exceeded. Please wait a moment before sending more payloads.' }
});

module.exports = {
  authLimiter,
  scanLimiter
};
