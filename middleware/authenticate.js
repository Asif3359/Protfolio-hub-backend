const jwt = require('jsonwebtoken');
const User = require('../model/User');

module.exports = async (req, res, next) => {
  try {
    // 1. Get token from header or cookie
    let token;
    if (req.header('Authorization')) {
      token = req.header('Authorization').replace('Bearer ', '');
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }
    console.log('JWT Secret:', process.env.JWT_SECRET);
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded",decoded)
    
    // 3. Find user and attach to request
    const user = await User.findById(decoded.user.id).select('+passwordResetCode +verificationToken');
    console.log(user)
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid authentication credentials' 
      });
    }

    // 4. Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ 
        success: false,
        message: 'Password was changed. Please log in again.' 
      });
    }

    req.user = user;
    console.log("Ok")
    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    
    let message = 'Invalid authentication token';
    if (err.name === 'TokenExpiredError') {
      message = 'Your session has expired. Please log in again.';
    } else if (err.name === 'JsonWebTokenError') {
      message = 'Invalid authentication credentials';
    }

    res.status(401).json({ 
      success: false,
      message 
    });
  }
};

