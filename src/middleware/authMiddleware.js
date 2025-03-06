
// src/middleware/auth.middleware.js
// Middleware to check if user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized: Please log in' });
};

// Middleware to check if user is guest (for routes that allow guests)
const allowGuest = (req, res, next) => {
  if (req.isAuthenticated() || req.session.isGuest) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized: Please log in or continue as guest' });
};

module.exports = { ensureAuthenticated, allowGuest };