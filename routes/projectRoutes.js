// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { body, validationResult } = require('express-validator');

// Middleware to check if user is authenticated
const authenticate = require('../middleware/authenticate');

// @route   GET api/projects
// @desc    Get all projects for the authenticated user
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/projects/:id
// @desc    Get single project by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/projects
// @desc    Create a new project
// @access  Private
router.post(
  '/',
  [
    authenticate,
    [
      body('title', 'Title is required').not().isEmpty(),
      body('description', 'Description is required').not().isEmpty(),
      body('startDate', 'Start date is required').not().isEmpty(),
      body('keyFeatures.*', 'Feature cannot be empty').not().isEmpty(),
      body('technologies.*', 'Technology cannot be empty').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      keyFeatures,
      technologies,
      repositoryUrl,
      liveUrl,
      startDate,
      endDate,
      status
    } = req.body;

    try {
      const newProject = new Project({
        userId: req.user.id,
        title,
        description,
        keyFeatures,
        technologies,
        repositoryUrl,
        liveUrl,
        startDate,
        endDate,
        status
      });

      const project = await newProject.save();
      res.json(project);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/projects/:id
// @desc    Update a project
// @access  Private
router.put('/:id', authenticate, async (req, res) => {
  const {
    title,
    description,
    keyFeatures,
    technologies,
    images,
    repositoryUrl,
    liveUrl,
    startDate,
    endDate,
    status
  } = req.body;

  // Build project object
  const projectFields = {};
  if (title) projectFields.title = title;
  if (description) projectFields.description = description;
  if (keyFeatures) projectFields.keyFeatures = keyFeatures;
  if (technologies) projectFields.technologies = technologies;
  if (images) projectFields.images = images;
  if (repositoryUrl) projectFields.repositoryUrl = repositoryUrl;
  if (liveUrl) projectFields.liveUrl = liveUrl;
  if (startDate) projectFields.startDate = startDate;
  if (endDate) projectFields.endDate = endDate;
  if (status) projectFields.status = status;

  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Make sure user owns the project
    if (project.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: projectFields },
      { new: true, runValidators: true }
    );

    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Make sure user owns the project
    if (project.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await project.remove();
    res.json({ msg: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
});


// GET /api/projects/my-projects
router.get('/my-projects', authenticate, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// GET /api/projects/user/:userId
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    // Check if requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const projects = await Project.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
      
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;