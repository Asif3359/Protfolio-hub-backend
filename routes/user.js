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
 * /api/user/all/users:
 *   get:
 *     summary: Get all users with follow/followers data
 *     description: Get all users with their profiles and follow/followers information
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
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           verified:
 *                             type: boolean
 *                           role:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                           followersCount:
 *                             type: number
 *                           followingCount:
 *                             type: number
 *                           recentFollowers:
 *                             type: array
 *                           recentFollowing:
 *                             type: array
 *                       profile:
 *                         type: object
 *                         nullable: true
 *       500:
 *         description: Server error
 */
router.get("/all/users", async (req, res) => {
  try {

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

    // Get follow/followers data for each user
    const usersWithFollowData = await Promise.all(
      results.map(async (doc) => {
        const user = await User.findById(doc._id)
          .populate({
            path: "followers",
            select: "name email profilePicture verified",
            options: { limit: 5 } // Show only first 5 followers
          })
          .populate({
            path: "following",
            select: "name email profilePicture verified",
            options: { limit: 5 } // Show only first 5 following
          });

        return {
          user: {
            _id: doc._id,
            name: doc.name,
            email: doc.email,
            verified: doc.verified,
            role: doc.role,
            createdAt: doc.createdAt,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
            recentFollowers: user.followers,
            recentFollowing: user.following,
          },
          profile: doc.profile || null,
        };
      })
    );

    res.json({
      success: true,
      count: usersWithFollowData.length,
      data: usersWithFollowData,
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

// @route   GET /api/user/:id
// @desc    Get user by ID with follow status
// @access  Private
router.get("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    const user = await User.findById(id)
      .select("-password")
      .populate({
        path: "followers",
        select: "name email profilePicture verified",
        options: { limit: 5 } // Show only first 5 followers
      })
      .populate({
        path: "following",
        select: "name email profilePicture verified",
        options: { limit: 5 } // Show only first 5 following
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get current user to check follow status
    const currentUser = await User.findById(currentUserId);
    const isFollowing = currentUser ? currentUser.isFollowing(id) : false;
    const isOwnProfile = currentUserId === id;

    // Get user's profile
    const profile = await Profile.findOne({ userId: id });

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          verified: user.verified,
          role: user.role,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          isOnline: user.isOnline,
          lastSeenAt: user.lastSeenAt,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          recentFollowers: user.followers,
          recentFollowing: user.following,
        },
        profile,
        followStatus: {
          isFollowing,
          isOwnProfile,
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

// @route   POST /api/user/follow/:userId
// @desc    Follow a user
// @access  Private
router.post("/follow/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Check if user is trying to follow themselves
    if (currentUserId === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get current user
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Current user not found",
      });
    }

    // Check if already following
    if (currentUser.isFollowing(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are already following this user",
      });
    }

    // Follow the user
    await currentUser.follow(userId);
    await targetUser.addFollower(currentUserId);

    res.json({
      success: true,
      message: "Successfully followed user",
      data: {
        following: currentUser.followingCount,
        followers: targetUser.followersCount,
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

// @route   DELETE /api/user/unfollow/:userId
// @desc    Unfollow a user
// @access  Private
router.delete("/unfollow/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Check if user is trying to unfollow themselves
    if (currentUserId === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get current user
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Current user not found",
      });
    }

    // Check if not following
    if (!currentUser.isFollowing(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user",
      });
    }

    // Unfollow the user
    await currentUser.unfollow(userId);
    await targetUser.removeFollower(currentUserId);

    res.json({
      success: true,
      message: "Successfully unfollowed user",
      data: {
        following: currentUser.followingCount,
        followers: targetUser.followersCount,
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

// @route   GET /api/user/followers/:userId
// @desc    Get followers of a user
// @access  Private
router.get("/followers/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(userId)
      .populate({
        path: "followers",
        select: "name email profilePicture verified createdAt",
        options: {
          limit: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit),
        },
      })
      .select("followers");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        followers: user.followers,
        totalFollowers: user.followersCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(user.followersCount / parseInt(limit)),
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

// @route   GET /api/user/following/:userId
// @desc    Get users that a user is following
// @access  Private
router.get("/following/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(userId)
      .populate({
        path: "following",
        select: "name email profilePicture verified createdAt",
        options: {
          limit: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit),
        },
      })
      .select("following");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        following: user.following,
        totalFollowing: user.followingCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(user.followingCount / parseInt(limit)),
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

// @route   GET /api/user/follow-status/:userId
// @desc    Check if current user is following a specific user
// @access  Private
router.get("/follow-status/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Current user not found",
      });
    }

    const isFollowing = currentUser.isFollowing(userId);

    res.json({
      success: true,
      data: {
        isFollowing,
        userId,
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