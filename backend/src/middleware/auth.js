// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_only', async (err, decoded) => {
    if (err) {
      console.log('❌ JWT verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token.' });
    }

    console.log('✅ JWT decoded successfully. User ID:', decoded.userId, 'Role:', decoded.role);

    try {
      // Find user in MongoDB and ensure active
      const user = await User.findOne({ _id: decoded.userId, isActive: true }).lean();
      console.log('🔍 User lookup result:', user ? `Found: ${user.email}` : 'NOT FOUND');

      if (!user) {
        console.log('❌ User not found or inactive for ID:', decoded.userId);
        return res.status(403).json({ error: 'User not found or inactive.' });
      }

      // Attach user info to request
      req.user = { ...decoded, ...user };
      console.log('✅ Auth successful for:', user.email, 'Role:', user.role);
      console.log('📦 req.user content:', {
        email: req.user.email,
        role: req.user.role,
        schoolId: req.user.schoolId
      });
      next();
    } catch (dbError) {
      console.error('🔧 Auth DB error:', dbError);
      return res.status(500).json({ error: 'Authentication failed due to server error.' });
    }
  });
};

exports.requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    console.log('❌ Super admin check failed. User role:', req.user?.role);
    return res.status(403).json({ error: 'Super admin access required.' });
  }
  console.log('✅ Super admin check passed');
  next();
};

exports.requireSchoolAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'school_admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ error: 'School admin access required.' });
  }
  next();
};

// Alias for consistency with newer routes
exports.verifyToken = exports.authenticateToken;

exports.verifyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};