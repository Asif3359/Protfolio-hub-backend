const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../model/User");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const authenticate = require("../middleware/authenticate");

// Input validation middleware
const validateSignup = [
  check("name").notEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Please include a valid email"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const validateLogin = [
  check("email").isEmail().withMessage("Please include a valid email"),
  check("password").exists().withMessage("Password is required"),
];

// Helper function to generate tokens
const generateToken = (user) => {
  return jwt.sign(
    {
      user: {
        id: user.id,
        role: user.role,
      },
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "1h" }
  );
};

// Helper function to send email
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.trim(),
    },
  });

  const mailOptions = {
    from: `"markaz-al-mahfaza" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post("/signup", validateSignup, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    user = new User({
      name,
      email,
      password,
      role: role || "customer",
      verificationToken,
      verificationTokenExpires: new Date(verificationTokenExpires),
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Send verification email
    // In your signup route, modify the verification email part:
    const verificationUrl = `${process.env.BACKEND_VERIFY_EMAIL_URL}${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: "Verify Your Email",
      message: `Please verify your email by clicking the following link: ${verificationUrl}`,
      html: `
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { email, password, rememberMe } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if email is verified
    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
        verified: false,
        email: user.email,
      });
    }

    // Generate token
    const expiresIn = rememberMe ? "30d" : "1h";
    const token = jwt.sign(
      { user: { id: user.id, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Set cookie if needed
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000, // 30 days or 1 hour
    });

    res.json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Add this to your authRoutes.js
// @route   GET /api/auth/verify-email/:token
// @desc    Verify email via link
// @access  Public
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Redirect to frontend success page
    res.redirect("/verification-success");
  } catch (err) {
    console.error(err.message);
    res.redirect("/verification-error");
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email
// @access  Public
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Generate new token since verification status changed
    const newToken = generateToken(user);

    res.json({
      success: true,
      token: newToken,
      message: "Email verified successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(verificationTokenExpires);
    await user.save();

    // Send email
    const verificationUrl = `${process.env.BACKEND_VERIFY_EMAIL_URL}${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: "Verify Your Email",
      message: `Please verify your email by clicking the following link: ${verificationUrl}`,
      html: `
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    res.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user with that email",
      });
    }

    // Generate reset token
    const resetCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const resetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    user.passwordResetCode = resetCode;
    user.passwordResetExpires = new Date(resetExpires);
    await user.save();

    // Send email
    await sendEmail({
      email: user.email,
      subject: "Password Reset Code",
      message: `Your password reset code is: ${resetCode}. It expires in 15 minutes.`,
      html: `
        <p>Your password reset code is: <strong>${resetCode}</strong></p>
        <p>This code will expire in 15 minutes.</p>
      `,
    });

    res.json({
      success: true,
      message: "Password reset code sent to email",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, code, and new password are required",
      });
    }

    const user = await User.findOne({
      email,
      passwordResetCode: code,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", authenticate, (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});



router.post("/check-verification", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // Check verification status
    if (user.verified) {
      return res.status(200).json({ verified: true, message: "Email is verified" });
    } else {
      return res.status(200).json({ verified: false, message: "Email is not verified" });
    }
    
  } catch (err) {
    console.error("Error checking verification:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token and return user data
// @access  Public
router.post("/verify-token", async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user is verified
    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified"
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified
      }
    });

  } catch (err) {
    console.error("Token verification error:", err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


module.exports = router;

