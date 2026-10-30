const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nexusai_jwt_secret_dev_key';

/**
 * Authentication Middleware
 * Validates JWT Bearer token and attaches req.user
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. No token provided.',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired authentication token.',
      });
    }

    // Attach user information strictly with id for data isolation queries
    req.user = {
      id: decoded.id,
      email: decoded.email,
      full_name: decoded.full_name,
    };
    next();
  });
}

module.exports = {
  authenticateToken,
  JWT_SECRET,
};

