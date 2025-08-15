// models/Achievement.js
const mongoose = require("../db");

const AchievementSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  title: {
    type: String,
    required: [true, 'Achievement title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: [
      'Academic',
      'Professional',
      'Sports',
      'Arts',
      'Community Service',
      'Leadership',
      'Research',
      'Other'
    ],
    required: [true, 'Category is required']
  },
  dateAchieved: {
    type: Date,
    required: [true, 'Date achieved is required'],
  },
  issuer: {
    type: String,
    trim: true,
    maxlength: [100, 'Issuer name cannot exceed 100 characters']
  },
  issuerLogo: {
    type: String, // URL to issuer's logo
    trim: true
  },
  skillsGained: [{
    type: String,
    trim: true,
  }],
  evidence: {
    type: String, // URL to certificate, photo, or document
    trim: true
  },
  verification: {
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    verifiedAt: Date
  },
  visibility: {
    type: String,
    enum: ['Public', 'Private', 'Connections'],
    default: 'Public'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  impactDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'Impact description cannot exceed 300 characters']
  }
}, { 
  timestamps: true, // Adds createdAt and updatedAt automatically
  versionKey: false 
});

// Indexes for better query performance
AchievementSchema.index({ userId: 1 });
AchievementSchema.index({ category: 1 });
AchievementSchema.index({ dateAchieved: -1 }); // Most recent first

module.exports = mongoose.model("Achievement", AchievementSchema);