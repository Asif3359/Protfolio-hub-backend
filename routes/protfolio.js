// routes/protfolio.js 
const express = require("express");
const router = express.Router();
const User = require("../model/User");
const Profile = require("../model/Profile");
const Project = require("../model/Project");
const Experience = require("../model/Experience");
const Education = require("../model/Education");
const Certification = require("../model/Certification");
const Achievement = require("../model/Achievement");
const Research = require("../model/Research");
const Skill = require("../model/Skill");
const authenticate = require("../middleware/authenticate");

// @route   GET /portfolio/all
// @desc    Get all users' portfolio data
// @access  Public
router.get("/all", async (req, res) => {
  try {
    const users = await User.find().select('-password -passwordChangedAt -passwordResetCode -passwordResetExpires -verificationToken -verificationTokenExpires');
    
    const portfolios = await Promise.all(
      users.map(async (user) => {
        const profile = await Profile.findOne({ userId: user._id });
        const projects = await Project.find({ userId: user._id });
        const experiences = await Experience.find({ userId: user._id });
        const educations = await Education.find({ userId: user._id });
        const certifications = await Certification.find({ userId: user._id });
        const achievements = await Achievement.find({ userId: user._id });
        const researches = await Research.find({ userId: user._id });
        const skills = await Skill.find({ userId: user._id });

        return {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            verified: user.verified,
            role: user.role,
            createdAt: user.createdAt
          },
          profile,
          projects,
          experiences,
          educations,
          certifications,
          achievements,
          researches,
          skills
        };
      })
    );

    res.json({
      success: true,
      count: portfolios.length,
      data: portfolios
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message
    });
  }
});

// @route   GET /portfolio/user/:userId
// @desc    Get specific user's portfolio data by user ID
// @access  Public
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    const user = await User.findById(userId).select('-password -passwordChangedAt -passwordResetCode -passwordResetExpires -verificationToken -verificationTokenExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const [profile, projects, experiences, educations, certifications, achievements, researches, skills] = await Promise.all([
      Profile.findOne({ userId }),
      Project.find({ userId }),
      Experience.find({ userId }),
      Education.find({ userId }),
      Certification.find({ userId }),
      Achievement.find({ userId }),
      Research.find({ userId }),
      Skill.find({ userId })
    ]);

    const portfolio = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
        role: user.role,
        createdAt: user.createdAt
      },
      profile,
      projects,
      experiences,
      educations,
      certifications,
      achievements,
      researches,
      skills
    };

    res.json({
      success: true,
      data: portfolio
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message
    });
  }
});

// @route   GET /portfolio/email/:email
// @desc    Get specific user's portfolio data by email
// @access  Public
router.get("/email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('-password -passwordChangedAt -passwordResetCode -passwordResetExpires -verificationToken -verificationTokenExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email"
      });
    }

    const [profile, projects, experiences, educations, certifications, achievements, researches, skills] = await Promise.all([
      Profile.findOne({ userId: user._id }),
      Project.find({ userId: user._id }).sort({ createdAt: -1 }),
      Experience.find({ userId: user._id }),
      Education.find({ userId: user._id }),
      Certification.find({ userId: user._id }),
      Achievement.find({ userId: user._id }),
      Research.find({ userId: user._id }),
      Skill.find({ userId: user._id })
    ]);

    const portfolio = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
        role: user.role,
        createdAt: user.createdAt
      },
      profile,
      projects,
      experiences,
      educations,
      certifications,
      achievements,
      researches,
      skills
    };

    res.json({
      success: true,
      data: portfolio
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message
    });
  }
});

// @route   GET /portfolio/me
// @desc    Get current user's portfolio data
// @access  Private
router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const [profile, projects, experiences, educations, certifications, achievements, researches, skills] = await Promise.all([
      Profile.findOne({ userId }),
      Project.find({ userId }).sort({ createdAt: 1 }),
      Experience.find({ userId }),
      Education.find({ userId }),
      Certification.find({ userId }),
      Achievement.find({ userId }),
      Research.find({ userId }),
      Skill.find({ userId })
    ]);

    const portfolio = {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        verified: req.user.verified,
        role: req.user.role,
        createdAt: req.user.createdAt
      },
      profile,
      projects,
      experiences,
      educations,
      certifications,
      achievements,
      researches,
      skills
    };

    res.json({
      success: true,
      data: portfolio
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message
    });
  }
});

// @route   GET /portfolio/search
// @desc    Search portfolios by user name or skills
// @access  Public
router.get("/search", async (req, res) => {
  try {
    const { name, skill, limit = 10, page = 1 } = req.query;
    
    let query = {};
    
    // Search by user name
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    const users = await User.find(query).select('-password -passwordChangedAt -passwordResetCode -passwordResetExpires -verificationToken -verificationTokenExpires');
    
    let filteredUsers = users;

    // Filter by skill if provided
    if (skill) {
      const skillFilter = await Skill.find({
        name: { $regex: skill, $options: 'i' }
      });
      
      const userIdsWithSkill = skillFilter.map(s => s.userId.toString());
      filteredUsers = users.filter(user => userIdsWithSkill.includes(user._id.toString()));
    }

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(skip, skip + parseInt(limit));

    const portfolios = await Promise.all(
      paginatedUsers.map(async (user) => {
        const profile = await Profile.findOne({ userId: user._id });
        const projects = await Project.find({ userId: user._id });
        const experiences = await Experience.find({ userId: user._id });
        const educations = await Education.find({ userId: user._id });
        const certifications = await Certification.find({ userId: user._id });
        const achievements = await Achievement.find({ userId: user._id });
        const researches = await Research.find({ userId: user._id });
        const skills = await Skill.find({ userId: user._id });

        return {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            verified: user.verified,
            role: user.role,
            createdAt: user.createdAt
          },
          profile,
          projects,
          experiences,
          educations,
          certifications,
          achievements,
          researches,
          skills
        };
      })
    );

    res.json({
      success: true,
      count: portfolios.length,
      total: filteredUsers.length,
      page: parseInt(page),
      limit: parseInt(limit),
      data: portfolios
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message
    });
  }
});

module.exports = router; 

