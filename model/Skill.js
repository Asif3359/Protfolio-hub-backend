// models/Skill.js
const mongoose = require("../db");

const SkillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skill: { type: String, trim: true }
}, { versionKey: false });

module.exports = mongoose.model("Skill", SkillSchema);
