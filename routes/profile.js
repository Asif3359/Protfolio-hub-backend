// routes/profile.js
const express = require("express");
const router = express.Router();
const Profile = require("../model/Profile");
const { body, validationResult } = require("express-validator");
const authenticate = require("../middleware/authenticate");

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
      profileImage,
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
      profileImage,
      updatedAt: Date.now(),
    };

    try {
      let profile = await Profile.findOne({ userId: req.user.id });

      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { userId: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      // Create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
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
