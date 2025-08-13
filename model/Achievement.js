// models/Achievement.js
const mongoose = require("../db");

const AchievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  achievement: { type: String, trim: true }
}, { versionKey: false });

module.exports = mongoose.model("Achievement", AchievementSchema);
