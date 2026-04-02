// routes/profile.js
const express = require("express");
const router = express.Router();
const Profile = require("../model/Profile");
const User = require("../model/User");
const { body, validationResult } = require("express-validator");
const authenticate = require("../middleware/authenticate");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

// Multer setup: store file in memory and restrict to images only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

// Helper: upload buffer to Cloudinary via upload_stream
const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
};

// @route   GET /profile/me
// @desc    Get current user's profile
// @access  Private
router.get("/me", authenticate, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /profile
// @desc    Create or update user profile
// @access  Private
router.post(
  "/",
  authenticate,
  upload.single("profileImage"),
  [
    body("headline", "Headline is required").not().isEmpty(),
    body("bio", "Bio must be less than 1000 characters")
      .optional()
      .isLength({ max: 1000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      headline,
      bio,
      location,
      phone,
      website,
      linkedin,
      facebook,
      github,
      portfolioLink,
    } = req.body;

    // Build profile object
    const profileFields = {
      userId: req.user.id,
      headline,
      bio,
      location,
      phone,
      website,
      linkedin,
      facebook,
      github,
      portfolioLink,
      updatedAt: Date.now(),
    };

    try {
      // If a file is uploaded, send it to Cloudinary and set profileImage to the secure URL
      if (req.file && req.file.buffer) {
        const uploaded = await uploadBufferToCloudinary(
          req.file.buffer,
          `profiles/${req.user.id}`,
        );
        profileFields.profileImage = uploaded.secure_url;
      } else if (req.body.profileImage) {
        // Fallback: accept direct URL if provided (e.g., already hosted)
        profileFields.profileImage = req.body.profileImage;
      }

      let profile = await Profile.findOne({ userId: req.user.id });
      let user = await User.findById(req.user.id);

      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { userId: req.user.id },
          { $set: profileFields },
          { new: true },
        );
        return res.json(profile);
      }

      // Create
      profile = new Profile(profileFields);
      await profile.save();
      user.profilePicture = profile.profileImage;
      await user.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  },
);

// @route   GET /profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.user_id });

    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   PUT /profile/views/:user_id
// @desc    Increment profile views count
// @access  Public
router.put("/views/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.params.user_id },
      { $inc: { views: 1 } },
      { new: true },
    );

    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    res.json({ views: profile.views });
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   DELETE /profile
// @desc    Delete profile
// @access  Private
router.delete("/", authenticate, async (req, res) => {
  try {
    // Remove profile
    await Profile.findOneAndRemove({ userId: req.user.id });

    res.json({ msg: "Profile deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
