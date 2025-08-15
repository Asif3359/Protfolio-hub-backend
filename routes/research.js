const express = require('express');
const router = express.Router();
const Research = require('../model/Research');
const { check, validationResult } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const isAdmin = require('../middleware/isAdmin');

// @route   POST /research
// @desc    Create new research entry
// @access  Private
router.post(
  '/',
  authenticate,
  [
    check('title', 'Title is required').not().isEmpty().trim(),
    check('description', 'Description is required').not().isEmpty(),
    check('researchField', 'Research field is required').not().isEmpty(),
    check('publicationDate', 'Valid publication date is required').isISO8601().toDate(),
    check('publicationType', 'Valid publication type is required').isIn([
      'Journal Article',
      'Conference Paper',
      'Book Chapter',
      'Thesis',
      'Preprint',
      'Technical Report',
      'Other'
    ]),
    check('doi', 'Invalid DOI format').optional().matches(/^10.\d{4,9}\/[-._;()/:A-Z0-9]+$/i),
    check('keywords', 'Keywords must be an array').optional().isArray()
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
        researchField,
        publicationDate,
        publisher,
        publicationType,
        doi,
        coAuthors,
        institution,
        fundingAgency,
        grantNumber,
        keywords,
        links,
        isPublished,
        peerReviewed,
        impactStatement
      } = req.body;

      const newResearch = new Research({
        userId: req.user.id,
        title,
        description,
        researchField,
        publicationDate,
        publisher,
        publicationType,
        doi,
        coAuthors: coAuthors || [],
        institution,
        fundingAgency,
        grantNumber,
        keywords: keywords || [],
        links: links || {},
        isPublished: isPublished !== false,
        peerReviewed: peerReviewed || false,
        impactStatement
      });

      const research = await newResearch.save();
      res.json(research);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /research/me
// @desc    Get current user's research
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const research = await Research.find({ userId: req.user.id })
      .sort({ publicationDate: -1 });
    res.json(research);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /research/public
// @desc    Get all public research
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const { field, type, year, keyword } = req.query;
    const query = { isPublished: true };

    if (field) query.researchField = new RegExp(field, 'i');
    if (type) query.publicationType = type;
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${parseInt(year)+1}-01-01`);
      query.publicationDate = { $gte: startDate, $lt: endDate };
    }
    if (keyword) query.keywords = new RegExp(keyword, 'i');

    const research = await Research.find(query)
      .populate('userId', 'name avatar')
      .sort({ publicationDate: -1 });
    
    res.json(research);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /research/:id
// @desc    Get research by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const research = await Research.findById(req.params.id)
      .populate('userId', 'name avatar');

    if (!research || !research.isPublished) {
      return res.status(404).json({ msg: 'Research not found or not published' });
    }

    res.json(research);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Research not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /research/:id
// @desc    Update research
// @access  Private
router.put(
  '/:id',
  authenticate,
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('publicationType', 'Invalid publication type').optional().isIn([
      'Journal Article',
      'Conference Paper',
      'Book Chapter',
      'Thesis',
      'Preprint',
      'Technical Report',
      'Other'
    ]),
    check('doi', 'Invalid DOI format').optional().matches(/^10.\d{4,9}\/[-._;()/:A-Z0-9]+$/i)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let research = await Research.findById(req.params.id);

      if (!research) {
        return res.status(404).json({ msg: 'Research not found' });
      }

      // Check user owns the research
      if (research.userId.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      const {
        title,
        description,
        researchField,
        publicationDate,
        publisher,
        publicationType,
        doi,
        coAuthors,
        institution,
        fundingAgency,
        grantNumber,
        keywords,
        links,
        isPublished,
        peerReviewed,
        impactStatement
      } = req.body;

      const researchFields = {
        title: title || research.title,
        description: description || research.description,
        researchField: researchField || research.researchField,
        publicationDate: publicationDate || research.publicationDate,
        publisher: publisher !== undefined ? publisher : research.publisher,
        publicationType: publicationType || research.publicationType,
        doi: doi !== undefined ? doi : research.doi,
        coAuthors: coAuthors || research.coAuthors,
        institution: institution !== undefined ? institution : research.institution,
        fundingAgency: fundingAgency !== undefined ? fundingAgency : research.fundingAgency,
        grantNumber: grantNumber !== undefined ? grantNumber : research.grantNumber,
        keywords: keywords || research.keywords,
        links: links || research.links,
        isPublished: isPublished !== undefined ? isPublished : research.isPublished,
        peerReviewed: peerReviewed !== undefined ? peerReviewed : research.peerReviewed,
        impactStatement: impactStatement || research.impactStatement
      };

      research = await Research.findByIdAndUpdate(
        req.params.id,
        { $set: researchFields },
        { new: true }
      );

      res.json(research);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE /research/:id
// @desc    Delete research
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);

    if (!research) {
      return res.status(404).json({ msg: 'Research not found' });
    }

    // Check user owns the research
    if (research.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await research.deleteOne();
    res.json({ msg: 'Research removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Research not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /research/verify/:id
// @desc    Verify research (Admin only)
// @access  Private/Admin
router.patch('/verify/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);

    if (!research) {
      return res.status(404).json({ msg: 'Research not found' });
    }

    research.peerReviewed = true;
    await research.save();
    
    res.json(research);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;