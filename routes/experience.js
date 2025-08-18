// routes/experience.js
const express = require("express");
const router = express.Router();
const Experience = require("../model/Experience");
const { check, validationResult } = require("express-validator");
const authenticate = require("../middleware/authenticate");
const isAdmin = require("../middleware/isAdmin");

router.get("/all", isAdmin, async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Search/filter options
    const filter = {};
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    if (req.query.company) {
      filter.company = { $regex: req.query.company, $options: "i" };
    }
    if (req.query.employmentType) {
      filter.employmentType = req.query.employmentType;
    }

    const experiences = await Experience.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email"); // Include basic user info

    const total = await Experience.countDocuments(filter);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      experiences,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /experience
// @desc    Add new experience
// @access  Private
router.post(
  "/",
  authenticate,
  [
    check("title", "Title is required").not().isEmpty(),
    check("company", "Company is required").not().isEmpty(),
    check("startDate", "Start date is required").isISO8601().toDate(),
    check("employmentType", "Invalid employment type").isIn([
      "Full-time",
      "Part-time",
      "Self-employed",
      "Freelance",
      "Contract",
      "Internship",
      "Apprenticeship",
      "Seasonal",
    ]),
    check("description", "Description too long")
      .optional()
      .isLength({ max: 2000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        title,
        employmentType,
        company,
        location,
        locationType,
        startDate,
        endDate,
        currentlyWorking,
        description,
        skills,
        media,
        visible,
      } = req.body;

      // Process skills - handle both array and comma-separated string
      let processedSkills = [];
      if (skills) {
        if (Array.isArray(skills)) {
          processedSkills = skills.map((skill) => skill.trim());
        } else if (typeof skills === "string") {
          processedSkills = skills.split(",").map((skill) => skill.trim());
        }
      }

      const newExp = new Experience({
        userId: req.user.id,
        title,
        employmentType,
        company,
        location,
        locationType,
        startDate,
        endDate,
        currentlyWorking,
        description,
        skills: processedSkills,
        media,
        visible,
      });

      const experience = await newExp.save();
      res.json(experience);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);
// @route   GET /experience/me
// @desc    Get current user's experiences
// @access  Private
router.get("/me", authenticate, async (req, res) => {
  try {
    const experiences = await Experience.find({ userId: req.user.id }).sort({
      startDate: -1,
    }); // Most recent first
    res.json(experiences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /experience/user/:user_id
// @desc    Get experiences by user ID
// @access  Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const experiences = await Experience.find({
      userId: req.params.user_id,
      visible: true,
    }).sort({ startDate: -1 });

    if (!experiences || experiences.length === 0) {
      return res.status(404).json({ msg: "No experiences found" });
    }

    res.json(experiences);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "No experiences found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   PUT /experience/:exp_id
// @desc    Update experience
// @access  Private
router.put(
  "/:exp_id",
  authenticate,
  [
    check("title", "Title is required").optional().not().isEmpty(),
    check("employmentType", "Invalid employment type")
      .optional()
      .isIn([
        "Full-time",
        "Part-time",
        "Self-employed",
        "Freelance",
        "Contract",
        "Internship",
        "Apprenticeship",
        "Seasonal",
      ]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let experience = await Experience.findById(req.params.exp_id);

      if (!experience) {
        return res.status(404).json({ msg: "Experience not found" });
      }

      // Check user owns the experience
      if (experience.userId.toString() !== req.user.id) {
        return res.status(401).json({ msg: "User not authorized" });
      }

      // Update fields
      const {
        title,
        employmentType,
        company,
        location,
        locationType,
        startDate,
        endDate,
        currentlyWorking,
        description,
        skills,
        media,
        visible,
      } = req.body;

      // console.log(skills);  

      // Process skills - handle both array and comma-separated string
      let processedSkills = [];
      if (skills) {
        if (Array.isArray(skills)) {
          processedSkills = skills.map((skill) => skill.trim());
        } else if (typeof skills === "string") {
          processedSkills = skills.split(",").map((skill) => skill.trim());
        }
      }

      const expFields = {
        title,
        employmentType,
        company,
        location,
        locationType,
        startDate,
        endDate,
        currentlyWorking,
        description,
        skills: processedSkills,
        media,
        visible,
      };

      experience = await Experience.findByIdAndUpdate(
        req.params.exp_id,
        { $set: expFields },
        { new: true }
      );

      res.json(experience);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   DELETE /experience/:exp_id
// @desc    Delete experience
// @access  Private
router.delete("/:exp_id", authenticate, async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.exp_id);

    if (!experience) {
      return res.status(404).json({ msg: "Experience not found" });
    }

    // Check user owns the experience
    if (experience.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await experience.remove();
    res.json({ msg: "Experience removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Experience not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
