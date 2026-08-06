const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'trustguard_super_secret_jwt_key_2026_production_grade';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden. Role '${req.user.role}' lacks required permissions.` });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};
