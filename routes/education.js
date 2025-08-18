// routes/education.js

const express = require('express');
const router = express.Router();
const Education = require('../model/Education');
const { check, validationResult } = require('express-validator');
const authenticate = require('../middleware/authenticate');

// @route   POST /education
// @desc    Add education record
// @access  Private
router.post(
  '/',
  authenticate,
  [
    check('school', 'School is required').not().isEmpty().trim(),
    check('degree', 'Valid degree type is required').isIn([
      'High School',
      'Associate',
      'Bachelor',
      'Master',
      'Doctorate',
      'Professional',
      'Certificate',
      'Diploma',
      'Other'
    ]),
    check('fieldOfStudy', 'Field of study is required').not().isEmpty().trim(),
    check('startDate', 'Start date is required').isISO8601().toDate(),
    // check('endDate', 'Invalid end date').optional().isISO8601().toDate(),
    check('website', 'Invalid URL').optional().isURL(),
    check('description', 'Description too long').optional().isLength({ max: 1000 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // console.log("Errors ",errors)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        school,
        logo,
        degree,
        fieldOfStudy,
        startDate,
        endDate,
        currentlyStudying,
        description,
        grade,
        activities,
        honors,
        educationType,
        location,
        website,
        media,
        visible
      } = req.body;

      // console.log(req.body);

      const newEdu = new Education({
        userId: req.user.id,
        school,
        logo,
        degree,
        fieldOfStudy,
        startDate,
        endDate,
        currentlyStudying,
        description,
        grade,
        activities,
        honors,
        educationType,
        location,
        website,
        media,
        visible: visible !== false // Default to true if not specified
      });

      const education = await newEdu.save();
      res.json(education);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /education/me
// @desc    Get current user's education
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const education = await Education.find({ userId: req.user.id })
      .sort({ startDate: -1 }); // Most recent first
    res.json(education);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /education/:id
// @desc    Get education by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const education = await Education.findById(req.params.id);
    
    if (!education || !education.visible) {
      return res.status(404).json({ msg: 'Education record not found' });
    }
    
    res.json(education);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Education record not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /education/:id
// @desc    Update education record
// @access  Private
router.put(
  '/:id',
  authenticate,
  [
    check('school', 'School is required').optional().not().isEmpty().trim(),
    check('degree', 'Valid degree type is required').optional().isIn([
      'High School',
      'Associate',
      'Bachelor',
      'Master',
      'Doctorate',
      'Professional',
      'Certificate',
      'Diploma',
      'Other'
    ]),
    check('endDate', 'End date must be after start date').optional().custom((value, { req }) => {
      if (req.body.startDate && value && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let education = await Education.findById(req.params.id);

      if (!education) {
        return res.status(404).json({ msg: 'Education record not found' });
      }

      // Check user owns the education record
      if (education.userId.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      const {
        school,
        logo,
        degree,
        fieldOfStudy,
        startDate,
        endDate,
        currentlyStudying,
        description,
        grade,
        activities,
        honors,
        educationType,
        location,
        website,
        media,
        visible
      } = req.body;

      const eduFields = {
        school,
        logo,
        degree,
        fieldOfStudy,
        startDate,
        endDate,
        currentlyStudying,
        description,
        grade,
        activities,
        honors,
        educationType,
        location,
        website,
        media,
        visible
      };

      education = await Education.findByIdAndUpdate(
        req.params.id,
        { $set: eduFields },
        { new: true }
      );

      res.json(education);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE /education/:id
// @desc    Delete education record
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const education = await Education.findById(req.params.id);
    // console.log(education);

    if (!education) {
      return res.status(404).json({ msg: 'Education record not found' });
    }

    // Check user owns the education record
    if (education.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Use deleteOne() instead of remove()
    await Education.findOneAndDelete({ _id: req.params.id });
    
    res.json({ msg: 'Education record removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Education record not found' });
    }
    res.status(500).send('Server Error');
  }
});


module.exports = router;