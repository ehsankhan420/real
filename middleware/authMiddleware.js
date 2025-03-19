const User = require('../models/User');

const authMiddleware = (req, res, next) => {
  // Get token from header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  // Verify token
  const verification = User.verifyToken(token);
  
  if (!verification.success) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  // Add user ID to request
  req.userId = verification.userId;
  next();
};

module.exports = authMiddleware;