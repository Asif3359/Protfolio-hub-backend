const express = require('express');
const router = express.Router();
const Achievement = require('../model/Achievement');
const { check, validationResult } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const isAdmin = require('../middleware/isAdmin');

// @route   POST /achievement
// @desc    Create new achievement
// @access  Private
router.post(
  '/',
  authenticate,
  [
    check('title', 'Title is required').not().isEmpty().trim(),
    check('description', 'Description is required (max 500 chars)').isLength({ max: 500 }),
    check('category', 'Valid category is required').isIn([
      'Academic',
      'Professional',
      'Sports',
      'Arts',
      'Community Service',
      'Leadership',
      'Research',
      'Other'
    ]),
    check('dateAchieved', 'Valid date is required').isISO8601().toDate(),
    check('skillsGained', 'Skills must be an array').optional().isArray(),
    check('visibility', 'Invalid visibility setting').optional().isIn(['Public', 'Private', 'Connections'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        title,
        description,
        category,
        dateAchieved,
        issuer,
        issuerLogo,
        skillsGained,
        evidence,
        visibility,
        tags,
        impactDescription
      } = req.body;

      const newAchievement = new Achievement({
        userId: req.user.id,
        title,
        description,
        category,
        dateAchieved,
        issuer,
        issuerLogo,
        skillsGained: skillsGained || [],
        evidence,
        visibility: visibility || 'Public',
        tags: tags || [],
        impactDescription
      });

      const achievement = await newAchievement.save();
      res.json(achievement);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /achievement/me
// @desc    Get current user's achievements
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user.id })
      .sort({ dateAchieved: -1 });
    res.json(achievements);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /achievement/:id
// @desc    Get achievement by ID
// @access  Public (respects visibility settings)
router.get('/:id', async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id)
      .populate('userId', 'name avatar');

    if (!achievement) {
      return res.status(404).json({ msg: 'Achievement not found' });
    }

    // Check visibility
    if (achievement.visibility === 'Private' && 
        (!req.user || achievement.userId._id.toString() !== req.user.id)) {
      return res.status(403).json({ msg: 'Not authorized to view this achievement' });
    }

    if (achievement.visibility === 'Connections' && 
        (!req.user || /* Add your connection check logic here */ false)) {
      return res.status(403).json({ msg: 'Not authorized to view this achievement' });
    }

    res.json(achievement);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Achievement not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /achievement/:id
// @desc    Update achievement
// @access  Private
router.put(
  '/:id',
  authenticate,
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('category', 'Invalid category').optional().isIn([
      'Academic',
      'Professional',
      'Sports',
      'Arts',
      'Community Service',
      'Leadership',
      'Research',
      'Other'
    ]),
    check('skillsGained', 'Skills must be an array').optional().isArray()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let achievement = await Achievement.findById(req.params.id);

      if (!achievement) {
        return res.status(404).json({ msg: 'Achievement not found' });
      }

      // Check user owns the achievement
      if (achievement.userId.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      const {
        title,
        description,
        category,
        dateAchieved,
        issuer,
        issuerLogo,
        skillsGained,
        evidence,
        visibility,
        tags,
        impactDescription
      } = req.body;

      const achievementFields = {
        title: title || achievement.title,
        description: description || achievement.description,
        category: category || achievement.category,
        dateAchieved: dateAchieved || achievement.dateAchieved,
        issuer: issuer !== undefined ? issuer : achievement.issuer,
        issuerLogo: issuerLogo !== undefined ? issuerLogo : achievement.issuerLogo,
        skillsGained: skillsGained || achievement.skillsGained,
        evidence: evidence !== undefined ? evidence : achievement.evidence,
        visibility: visibility || achievement.visibility,
        tags: tags || achievement.tags,
        impactDescription: impactDescription || achievement.impactDescription
      };

      achievement = await Achievement.findByIdAndUpdate(
        req.params.id,
        { $set: achievementFields },
        { new: true }
      );

      res.json(achievement);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE /achievement/:id
// @desc    Delete achievement
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ msg: 'Achievement not found' });
    }

    // Check user owns the achievement
    if (achievement.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await achievement.deleteOne();
    res.json({ msg: 'Achievement removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Achievement not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /achievement/verify/:id
// @desc    Verify achievement (Admin only)
// @access  Private/Admin
router.patch('/verify/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ msg: 'Achievement not found' });
    }

    achievement.verification = {
      verified: true,
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    };

    await achievement.save();
    res.json(achievement);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;