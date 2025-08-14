// models/Experience.js
const mongoose = require("../db");

const ExperienceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  employmentType: {
    type: String,
    enum: [
      'Full-time',
      'Part-time',
      'Self-employed',
      'Freelance',
      'Contract',
      'Internship',
      'Apprenticeship',
      'Seasonal'
    ],
    default: 'Full-time'
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  locationType: {
    type: String,
    enum: ['On-site', 'Hybrid', 'Remote'],
    default: 'On-site'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        // End date must be after start date if both exist
        return !this.startDate || !value || value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  currentlyWorking: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  media: {
    type: String, // URL to media (image, document, etc.)
    trim: true
  },
  visible: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true, // Adds createdAt and updatedAt automatically
  versionKey: false 
});

// Index for faster querying on userId
ExperienceSchema.index({ userId: 1 });

module.exports = mongoose.model("Experience", ExperienceSchema);