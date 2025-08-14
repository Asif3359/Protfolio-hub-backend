// models/Profile.js
const mongoose = require("../db");

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    location: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    facebook: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
    portfolioLink: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Profile", ProfileSchema);
