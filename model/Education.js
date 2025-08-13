// models/Education.js
const mongoose = require("../db");

const EducationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  school: String,
  degree: String,
  fieldOfStudy: String,
  startDate: Date,
  endDate: Date,
  description: String
}, { versionKey: false });

module.exports = mongoose.model("Education", EducationSchema);
