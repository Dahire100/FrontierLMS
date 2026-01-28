// middleware/roleAuth.js
// Role-based authorization middleware

exports.verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      console.log(`❌ Role check failed. User role: ${userRole}, Required: ${allowedRoles.join(', ')}`);
      return res.status(403).json({ 
        success: false,
        error: 'Insufficient permissions' 
      });
    }

    console.log(`✅ Role check passed. User role: ${userRole}`);
    next();
  };
};

// Specific role checkers
exports.requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Super admin access required' 
    });
  }
  next();
};

exports.requireSchoolAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'school_admin') {
    return res.status(403).json({ 
      success: false,
      error: 'School admin access required' 
    });
  }
  next();
};

exports.requireTeacher = (req, res, next) => {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ 
      success: false,
      error: 'Teacher access required' 
    });
  }
  next();
};

exports.requireParent = (req, res, next) => {
  if (!req.user || req.user.role !== 'parent') {
    return res.status(403).json({ 
      success: false,
      error: 'Parent access required' 
    });
  }
  next();
};

exports.requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ 
      success: false,
      error: 'Student access required' 
    });
  }
  next();
};

module.exports = exports;
