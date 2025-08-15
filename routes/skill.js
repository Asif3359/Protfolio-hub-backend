const express = require('express');
const router = express.Router();
const Skill = require('../model/Skill');
const { check, validationResult } = require('express-validator');
const authenticate = require('../middleware/authenticate');

// @route   POST /skill
// @desc    Add new skill
// @access  Private
router.post(
  '/',
  authenticate,
  [
    check('name', 'Skill name is required').not().isEmpty().trim(),
    check('category', 'Valid category is required').isIn([
      'Technical',
      'Programming',
      'Design',
      'Business',
      'Language',
      'Soft Skills',
      'Other'
    ]),
    check('proficiency', 'Proficiency must be between 0-100').isInt({ min: 0, max: 100 }),
    check('priority', 'Priority must be between 1-5').optional().isInt({ min: 1, max: 5 }),
    check('learningResources', 'Learning resources must be an array').optional().isArray(),
    check('visibility', 'Invalid visibility setting').optional().isIn(['Public', 'Private', 'Connections'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        name,
        category,
        proficiency,
        learningResources,
        priority,
        visibility
      } = req.body;

      const newSkill = new Skill({
        userId: req.user.id,
        name,
        category,
        proficiency,
        learningResources: learningResources || [],
        priority: priority || 3,
        visibility: visibility || 'Public'
      });

      const skill = await newSkill.save();
      res.json(skill);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);


// @route   GET /skill/:id
// @desc    Get specific skill by ID
// @access  Private (if skill is private) or Public (if skill is public)
router.get('/skill/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ msg: 'Skill not found' });
    }

    return res.json(skill);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Skill not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /skill/me
// @desc    Get current user's skills
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const { category, minProficiency, maxProficiency } = req.query;
    const query = { userId: req.user.id };
    console.log(req.query)
    console.log(query)

    if (category) query.category = category;
    if (minProficiency) query.proficiency = { ...query.proficiency, $gte: parseInt(minProficiency) };
    if (maxProficiency) query.proficiency = { ...query.proficiency, $lte: parseInt(maxProficiency) };

    const skills = await Skill.find(query)
      .sort({ priority: 1, proficiency: -1 }); // Sort by priority then proficiency
    res.json(skills);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /skill/user/:userId
// @desc    Get public skills for a user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const skills = await Skill.find({ 
      userId: req.params.userId,
      visibility: 'Public'
    }).sort({ proficiency: -1 });

    res.json(skills);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /skill/user/:userId/all
// @desc    Get all skills for a user (requires authentication)
// @access  Private (only accessible to the user themselves or admin)
router.get('/user/:userId/all', authenticate, async (req, res) => {
  try {
    // Check if the requesting user is the same as the userId or an admin
    if (req.params.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to view these skills' });
    }

    const skills = await Skill.find({ 
      userId: req.params.userId
    }).sort({ proficiency: -1 });

    res.json(skills);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /skill/:id
// @desc    Update skill
// @access  Private
router.put(
  '/:id',
  authenticate,
  [
    check('proficiency', 'Proficiency must be between 0-100').optional().isInt({ min: 0, max: 100 }),
    check('priority', 'Priority must be between 1-5').optional().isInt({ min: 1, max: 5 }),
    check('learningResources', 'Learning resources must be an array').optional().isArray()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let skill = await Skill.findById(req.params.id);

      if (!skill) {
        return res.status(404).json({ msg: 'Skill not found' });
      }

      // Check user owns the skill
      if (skill.userId.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      const {
        name,
        category,
        proficiency,
        learningResources,
        priority,
        visibility
      } = req.body;

      const skillFields = {
        name: name || skill.name,
        category: category || skill.category,
        proficiency: proficiency !== undefined ? proficiency : skill.proficiency,
        learningResources: learningResources || skill.learningResources,
        priority: priority || skill.priority,
        visibility: visibility || skill.visibility
      };

      skill = await Skill.findByIdAndUpdate(
        req.params.id,
        { $set: skillFields },
        { new: true }
      );

      res.json(skill);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE /skill/:id
// @desc    Delete skill
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ msg: 'Skill not found' });
    }

    // Check user owns the skill
    if (skill.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await skill.deleteOne();
    res.json({ msg: 'Skill removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Skill not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /skill/:id/proficiency
// @desc    Update skill proficiency
// @access  Private
router.patch(
  '/:id/proficiency',
  authenticate,
  [
    check('proficiency', 'Proficiency must be between 0-100').isInt({ min: 0, max: 100 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const skill = await Skill.findById(req.params.id);

      if (!skill) {
        return res.status(404).json({ msg: 'Skill not found' });
      }

      if (skill.userId.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      skill.proficiency = req.body.proficiency;
      await skill.save();

      res.json(skill);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;