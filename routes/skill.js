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

      console.log(req.body)

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
      console.error('Error in generate-questions:', err.message);
      console.error('Stack trace:', err.stack);
      res.status(500).json({ 
        error: 'Server Error', 
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
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

// @route   GET /skill/:id/generate-questions
// @desc    Generate questions for a skill test
// @access  Private
router.get('/:id/generate-questions', async (req, res) => {  // Temporarily removed authenticate for testing
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ msg: 'Skill not found' });
    }

    // Check if user owns the skill or skill is public
    // For testing, allow access if skill is public or if no user is authenticated
    if (req.user && skill.userId.toString() !== req.user.id && skill.visibility !== 'Public') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Determine proficiency level based on skill.proficiency
    let proficiencyLevel;
  
    proficiencyLevel = 'Advanced';
    console.log(proficiencyLevel)

    // Call the ML service to generate questions
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    
    // Use node-fetch or https module for older Node.js versions
    const https = require('https');
    const http = require('http');
    
    const url = new URL(`${mlServiceUrl}/generate-questions`);
    const postData = JSON.stringify({
      skill: skill.name,
      category: skill.category,
      proficiency: proficiencyLevel,
      num_questions: parseInt(req.query.num_questions) || 5
    });
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const response = await new Promise((resolve, reject) => {
      const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            statusText: res.statusMessage,
            json: () => JSON.parse(data)
          });
        });
      });
      
      req.on('error', (err) => {
        reject(err);
      });
      
      req.write(postData);
      req.end();
    });

    if (!response.ok) {
      throw new Error(`ML service error: ${response.statusText}`);
    }

    const questionsData = await response.json();
    res.json(questionsData);
  } catch (err) {
    console.error('Error in generate-questions:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ 
      error: 'Server Error', 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;