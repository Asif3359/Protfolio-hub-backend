// models/Experience.js
const mongoose = require("../db");

const ExperienceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  company: String,
  position: String,
  startDate: Date,
  endDate: Date,
  description: String
}, { versionKey: false });

module.exports = mongoose.model("Experience", ExperienceSchema);
