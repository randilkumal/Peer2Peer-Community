// Check if user has required role(s)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Check if user can access based on status
exports.checkStatus = (...statuses) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!statuses.includes(req.user.status)) {
      return res.status(403).json({
        success: false,
        message: `Account status '${req.user.status}' cannot access this route`,
        currentStatus: req.user.status
      });
    }

    next();
  };
};
