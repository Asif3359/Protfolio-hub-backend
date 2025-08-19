const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const authenticate = require("../middleware/authenticate");

const bcrypt = require("bcryptjs");
const User = require("../model/User");
const Profile = require("../model/Profile");
const Experience = require("../model/Experience");
const Education = require("../model/Education");
const Project = require("../model/Project");
const Skill = require("../model/Skill");
const Research = require("../model/Research");
const Achievement = require("../model/Achievement");
const Certification = require("../model/Certification");


/**
 * @swagger
 * /api/auth:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this resource",
      });
    }

    const results = await User.aggregate([
      { $project: { password: 0 } },
      {
        $lookup: {
          from: Profile.collection.name,
          localField: "_id",
          foreignField: "userId",
          as: "profile",
        },
      },
      { $addFields: { profile: { $arrayElemAt: ["$profile", 0] } } },
    ]);

    const combined = results.map((doc) => ({
      user: {
        _id: doc._id,
        name: doc.name,
        email: doc.email,
        verified: doc.verified,
        role: doc.role,
        createdAt: doc.createdAt,
      },
      profile: doc.profile || null,
    }));

    res.json({
      success: true,
      count: combined.length,
      data: combined,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * @swagger
 * /api/user/verified:
 *   get:
 *     summary: Get all verified users
 *     description: Get a list of all verified users (accessible by any authenticated user)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       isOnline:
 *                         type: boolean
 *                       lastSeenAt:
 *                         type: string
 *                         format: date-time
 *                       profile:
 *                         type: object
 *                         nullable: true
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/verified", authenticate, async (req, res) => {
  try {
    // Get all verified users with basic info and online status
    const verifiedUsers = await User.find({ 
      verified: true 
    })
    .select('_id name email isOnline lastSeenAt createdAt')
    .sort({ name: 1 });

    // Get profiles for verified users
    const userIds = verifiedUsers.map(user => user._id);
    const profiles = await Profile.find({ 
      userId: { $in: userIds } 
    });

    // Create a map of profiles for quick lookup
    const profileMap = new Map();
    profiles.forEach(profile => {
      profileMap.set(profile.userId.toString(), profile);
    });

    // Combine user data with profiles
    const usersWithProfiles = verifiedUsers.map(user => {
      const userObj = user.toObject();
      return {
        _id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        isOnline: userObj.isOnline,
        lastSeenAt: userObj.lastSeenAt,
        createdAt: userObj.createdAt,
        profile: profileMap.get(userObj._id.toString()) || null
      };
    });

    res.json({
      success: true,
      count: usersWithProfiles.length,
      data: usersWithProfiles,
    });
  } catch (err) {
    console.error('Get verified users error:', err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   DELETE /api/auth/:id
// @desc    Delete a user and all related data (admin only)
// @access  Private/Admin
router.delete("/:id", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this resource",
      });
    }

    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [
      profileResult,
      expResult,
      eduResult,
      projResult,
      skillResult,
      resResult,
      achResult,
      certResult,
    ] = await Promise.all([
      Profile.deleteOne({ userId }),
      Experience.deleteMany({ userId }),
      Education.deleteMany({ userId }),
      Project.deleteMany({ userId }),
      Skill.deleteMany({ userId }),
      Research.deleteMany({ userId }),
      Achievement.deleteMany({ userId }),
      Certification.deleteMany({ userId }),
    ]);

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "User and related data deleted",
      data: {
        deleted: {
          profile: profileResult?.deletedCount || 0,
          experiences: expResult?.deletedCount || 0,
          educations: eduResult?.deletedCount || 0,
          projects: projResult?.deletedCount || 0,
          skills: skillResult?.deletedCount || 0,
          research: resResult?.deletedCount || 0,
          achievements: achResult?.deletedCount || 0,
          certifications: certResult?.deletedCount || 0,
        },
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




module.exports = router;