const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");

// Use global fetch for Node.js 18+ or import node-fetch for older versions
let fetch;
if (typeof globalThis.fetch === "function") {
  fetch = globalThis.fetch;
} else {
  fetch = require("node-fetch");
}

// AI provider configuration (Groq only)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "deepseek-r1-distill-llama-70b";

// Utilities
const extractFirstJsonFromText = (text) => {
  if (typeof text !== "string") return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  return text.substring(start, end + 1);
};

const buildQuestionsPrompt = ({ skill, category, numQuestions }) => {
  return `Generate ${numQuestions} interview questions about ${skill} (${category}) in JSON format.\nEach question should have:\n- 1 correct answer\n- 3 incorrect answers\nFormat:\n\n{\n  "skill": "${skill}",\n  "category": "${category}",\n  "questions": [\n    {\n      "question": "...",\n      "correct_answer": "...",\n      "incorrect_answers": ["...", "...", "..."]\n    }\n  ]\n}\n\nDo not include proficiency/difficulty levels.\nMake sure the questions are relevant and practical for job interviews.`;
};

// Groq provider
const groqHealth = async () => {
  if (!GROQ_API_KEY)
    return { ok: false, provider: "groq", error: "missing_key" };
  try {
    const resp = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok)
      return { ok: false, provider: "groq", error: `status ${resp.status}` };
    const data = await resp.json();
    const models = Array.isArray(data.data) ? data.data : [];
    const hasLlama3 = models.some((m) =>
      (m.id || "").toLowerCase().includes("llama-3")
    );
    return { ok: hasLlama3, provider: "groq", models };
  } catch (e) {
    return { ok: false, provider: "groq", error: e.message };
  }
};

const selectSupportedGroqModel = async () => {
  const resp = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!resp.ok) return GROQ_MODEL;
  const data = await resp.json();
  const models = Array.isArray(data.data) ? data.data.map((m) => m.id) : [];
  const preferences = [
    // Prefer smaller preview models first (more likely to be free/available)
    "llama-3.2-3b-preview",
    "llama-3.2-1b-preview",
    "llama-3.2-11b-text-preview",
    // Secondary options
    "llama-3-8b-8192",
    "llama-3-70b-8192",
    "deepseek-r1-distill-llama-70b",
    "mixtral-8x7b-32768",
  ];
  for (const pref of preferences) {
    if (models.find((m) => m.includes(pref)))
      return models.find((m) => m.includes(pref));
  }
  return models[0] || GROQ_MODEL;
};

const groqChatCompletion = async ({ prompt, modelOverride }) => {
  const modelToUse = modelOverride || GROQ_MODEL;
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelToUse,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that outputs strict JSON when requested.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 2048,
      stream: false,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(120000),
  });
  if (!resp.ok) {
    let bodyText = "";
    try {
      bodyText = await resp.text();
    } catch (_) {}
    // If model is decommissioned or invalid, try resolving a supported model once
    if (
      bodyText &&
      bodyText.includes("model") &&
      (bodyText.includes("decommissioned") ||
        bodyText.includes("not found") ||
        bodyText.includes("invalid"))
    ) {
      const fallbackModel = await selectSupportedGroqModel();
      if (fallbackModel && fallbackModel !== modelToUse) {
        return await groqChatCompletion({
          prompt,
          modelOverride: fallbackModel,
        });
      }
    }
    throw new Error(
      `Groq chat failed: ${resp.status} ${resp.statusText}${
        bodyText ? ` - ${bodyText}` : ""
      }`
    );
  }
  const data = await resp.json();
  const content =
    (data &&
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content) ||
    "";
  const jsonText = extractFirstJsonFromText(content);
  if (!jsonText) throw new Error("No valid JSON found in Groq response");
  return JSON.parse(jsonText);
};

const generateQuestionsViaProvider = async ({
  skill,
  category,
  numQuestions,
}) => {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not set");
  }
  const prompt = buildQuestionsPrompt({ skill, category, numQuestions });
  return await groqChatCompletion({ prompt });
};

// @route   GET /api/ai/health
// @desc    Check Llama 3 service health
// @access  Public
router.get("/health", async (req, res) => {
  try {
    const groq = await groqHealth();
    if (!groq.ok) {
      return res.status(503).json({
        success: false,
        message: "Groq not available",
        provider: groq,
      });
    }
    res.json({
      success: true,
      message: "Groq available",
      provider: groq,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Health check failed",
      error: error.message,
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
        message: "Skill and category are required",
      });
    }

    const questions = await generateQuestionsViaProvider({
      skill,
      category,
      numQuestions: num_questions,
    });

    // console.log(questions)

    res.json({
      success: true,
      message: "Questions generated successfully",
      data: questions,
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate questions",
      error: error.message,
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
        message: "Skills array is required and must not be empty",
      });
    }

    // Validate each skill object
    for (const skill of skills) {
      if (!skill.skill || !skill.category) {
        return res.status(400).json({
          success: false,
          message: "Each skill must have 'skill' and 'category' properties",
        });
      }
    }

    const results = [];
    for (const item of skills) {
      const { skill, category, num_questions } = item;
      try {
        const data = await generateQuestionsViaProvider({
          skill,
          category,
          numQuestions: num_questions || 10,
        });
        results.push({ success: true, skill, category, data });
      } catch (err) {
        results.push({ success: false, skill, category, error: err.message });
      }
    }

    res.json({
      success: true,
      message: "Questions generated for multiple skills",
      data: results,
    });
  } catch (error) {
    console.error("Error generating questions for multiple skills:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate questions for multiple skills",
      error: error.message,
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
      { name: "REST APIs", category: "Backend" },
    ];

    res.json({
      success: true,
      data: availableSkills,
    });
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available skills",
      error: error.message,
    });
  }
});

module.exports = router;
