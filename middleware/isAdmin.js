// middleware/isAdmin.js
const authenticate = require('./authenticate');

const isAdmin = async (req, res, next) => {
  // First authenticate the user
  authenticate(req, res, () => {
    // Then check if user is admin
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ msg: 'Admin access required' });
    }
  });
};

module.exports = isAdmin;