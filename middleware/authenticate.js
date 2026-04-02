const jwt = require("jsonwebtoken");
const User = require("../model/User");

module.exports = async (req, res, next) => {
  try {
    // 1. Get token from header or cookie
    let token;
    const authHeader = req.header("Authorization");
    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7).trim();
      } else {
        token = authHeader.trim();
      }
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // Reject placeholder strings that aren't real tokens
    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Resolve user id from token (support { user: { id } } or { id })
    const decodedUserId =
      (decoded && decoded.user && decoded.user.id) || decoded.id;
    if (!decodedUserId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token payload",
      });
    }

    // 4. Find user and attach to request
    const user = await User.findById(decodedUserId).select(
      "+passwordResetCode +verificationToken",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication credentials",
      });
    }

    // 5. Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: "Password was changed. Please log in again.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);

    let message = "Invalid authentication token";
    if (err.name === "TokenExpiredError") {
      message = "Your session has expired. Please log in again.";
    } else if (err.name === "JsonWebTokenError") {
      message = "Invalid authentication credentials";
    }

    res.status(401).json({
      success: false,
      message,
    });
  }
};
