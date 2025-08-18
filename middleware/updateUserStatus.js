const User = require('../model/User');

const updateUserStatus = async (req, res, next) => {
  try {
    // Only update if user is authenticated
    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (user) {
        // Update last seen timestamp
        user.lastSeenAt = new Date();
        await user.save();
      }
    }
    next();
  } catch (err) {
    // Don't block the request if status update fails
    console.error('Error updating user status:', err);
    next();
  }
};

module.exports = updateUserStatus;
