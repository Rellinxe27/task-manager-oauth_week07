// Middleware to check if user is authenticated
exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    success: false,
    message: 'Authentication required. Please login first.',
    redirectTo: '/auth/google'
  });
};

// Middleware to check if user is guest (not authenticated)
exports.ensureGuest = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  next();
};
