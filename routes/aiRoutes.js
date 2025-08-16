const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");

// Use global fetch for Node.js 18+ or import node-fetch for older versions
let fetch;
if (typeof globalThis.fetch === 'function') {
  fetch = globalThis.fetch;
} else {
  fetch = require("node-fetch");
}

// Llama 3 service configuration
const LLAMA3_SERVICE_URL = process.env.LLAMA3_SERVICE_URL || "http://localhost:8002";

// Helper function to make requests to Llama 3 service
const callLlama3Service = async (endpoint, data = null) => {
  try {
    const url = `${LLAMA3_SERVICE_URL}${endpoint}`;
    const options = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout for AI requests (2 minutes)
      signal: AbortSignal.timeout(1200000)
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Llama 3 service error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Llama 3 service:', error);
    throw error;
  }
};

// @route   GET /api/ai/health
// @desc    Check Llama 3 service health
// @access  Public
router.get("/health", async (req, res) => {
  try {
    const health = await callLlama3Service("/");
    res.json({
      success: true,
      message: "Llama 3 service is healthy",
      data: health
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Llama 3 service is not available",
      error: error.message
    });
  }
});

// @route   POST /api/ai/generate-questions
// @desc    Generate skill-based interview questions
// @access  Private
router.post("/generate-questions", authenticate, async (req, res) => {
  try {
    const { skill, category, num_questions = 10 } = req.body;

    // Validate input
    if (!skill || !category) {
      return res.status(400).json({
        success: false,
        message: "Skill and category are required"
      });
    }

    // Call Llama 3 service
    const questions = await callLlama3Service("/generate-questions", {
      skill,
      category,
      num_questions
    });

    res.json({
      success: true,
      message: "Questions generated successfully",
      data: questions
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({
      success: false,
      message: "Failed to generate questions",
      error: error.message
    });
  }
});

// @route   POST /api/ai/generate-multiple-skills
// @desc    Generate questions for multiple skills
// @access  Private
router.post("/generate-multiple-skills", authenticate, async (req, res) => {
  try {
    const { skills } = req.body;

    // Validate input
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Skills array is required and must not be empty"
      });
    }

    // Validate each skill object
    for (const skill of skills) {
      if (!skill.skill || !skill.category) {
        return res.status(400).json({
          success: false,
          message: "Each skill must have 'skill' and 'category' properties"
        });
      }
    }

    // Call Llama 3 service
    const results = await callLlama3Service("/generate-multiple-skills", skills);

    res.json({
      success: true,
      message: "Questions generated for multiple skills",
      data: results
    });

  } catch (error) {
    console.error('Error generating questions for multiple skills:', error);
    res.status(500).json({
      success: false,
      message: "Failed to generate questions for multiple skills",
      error: error.message
    });
  }
});

// @route   GET /api/ai/skills
// @desc    Get available skills for question generation
// @access  Public
router.get("/skills", async (req, res) => {
  try {
    // This could be expanded to fetch from your database
    const availableSkills = [
      { name: "JavaScript", category: "Programming" },
      { name: "Python", category: "Programming" },
      { name: "React", category: "Frontend" },
      { name: "Node.js", category: "Backend" },
      { name: "MongoDB", category: "Database" },
      { name: "Express.js", category: "Backend" },
      { name: "HTML/CSS", category: "Frontend" },
      { name: "Git", category: "Version Control" },
      { name: "Docker", category: "DevOps" },
      { name: "AWS", category: "Cloud" },
      { name: "Machine Learning", category: "AI/ML" },
      { name: "Data Structures", category: "Computer Science" },
      { name: "Algorithms", category: "Computer Science" },
      { name: "System Design", category: "Architecture" },
      { name: "REST APIs", category: "Backend" }
    ];

    res.json({
      success: true,
      data: availableSkills
    });

  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available skills",
      error: error.message
    });
  }
});

module.exports = router;
