const express = require('express');
const router = express.Router();
const Certification = require('../model/Certification');
const { check, validationResult } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const isAdmin = require('../middleware/isAdmin');

// @route   POST /certification
// @desc    Add new certification
// @access  Private
router.post(
  '/',
  authenticate,
  [
    check('title', 'Title is required').not().isEmpty().trim(),
    check('issuer', 'Issuer is required').not().isEmpty().trim(),
    check('issueDate', 'Valid issue date is required').isISO8601().toDate(),
    // check('expirationDate', 'Invalid expiration date').optional().isISO8601().toDate(),
    check('credentialLink', 'Invalid URL').optional().isURL(),
    check('description', 'Description too long').optional().isLength({ max: 1000 }),
    check('skills', 'Invalid skills format').optional().isArray()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        title,
        issuer,
        issuerLogo,
        issueDate,
        expirationDate,
        credentialID,
        credentialLink,
        description,
        skills,
        doesNotExpire,
        media,
        visible
      } = req.body;

      const newCert = new Certification({
        userId: req.user.id,
        title,
        issuer,
        issuerLogo,
        issueDate,
        expirationDate: doesNotExpire ? null : expirationDate,
        credentialID,
        credentialLink,
        description,
        skills: skills || [],
        doesNotExpire,
        media,
        visible: visible !== false
      });

      const certification = await newCert.save();
      res.json(certification);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /certification/me
// @desc    Get current user's certifications
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const certifications = await Certification.find({ userId: req.user.id })
      .sort({ issueDate: -1 });
    res.json(certifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /certification/:id
// @desc    Get certification by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const certification = await Certification.findById(req.params.id);
    
    if (!certification || !certification.visible) {
      return res.status(404).json({ msg: 'Certification not found' });
    }
    
    res.json(certification);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Certification not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /certification/:id
// @desc    Update certification
// @access  Private
router.put(
  '/:id',
  authenticate,
  [
    check('title', 'Title is required').optional().not().isEmpty().trim(),
    check('expirationDate', 'Expiration date must be after issue date').optional().custom((value, { req }) => {
      if (req.body.issueDate && value && new Date(value) <= new Date(req.body.issueDate)) {
        throw new Error('Expiration date must be after issue date');
      }
      return true;
    }),
    check('skills', 'Invalid skills format').optional().isArray()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let certification = await Certification.findById(req.params.id);

      if (!certification) {
        return res.status(404).json({ msg: 'Certification not found' });
      }

      // Check user owns the certification
      if (certification.userId.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      const {
        title,
        issuer,
        issuerLogo,
        issueDate,
        expirationDate,
        credentialID,
        credentialLink,
        description,
        skills,
        doesNotExpire,
        media,
        visible
      } = req.body;

      const certFields = {
        title,
        issuer,
        issuerLogo,
        issueDate,
        expirationDate: doesNotExpire ? null : expirationDate,
        credentialID,
        credentialLink,
        description,
        skills: skills || certification.skills,
        doesNotExpire,
        media,
        visible
      };

      certification = await Certification.findByIdAndUpdate(
        req.params.id,
        { $set: certFields },
        { new: true }
      );

      res.json(certification);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE /certification/:id
// @desc    Delete certification
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const certification = await Certification.findById(req.params.id);

    if (!certification) {
      return res.status(404).json({ msg: 'Certification not found' });
    }

    // Check user owns the certification
    if (certification.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Certification.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Certification removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Certification not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /certification/verify/:id
// @desc    Verify certification (Admin only)
// @access  Private/Admin
router.patch('/verify/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const certification = await Certification.findById(req.params.id);
    
    if (!certification) {
      return res.status(404).json({ msg: 'Certification not found' });
    }

    certification.verification = {
      verified: true,
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    };

    await certification.save();
    res.json(certification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;