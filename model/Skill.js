// models/Skill.js
const mongoose = require("../db");

const SkillSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  },
  category: {
    type: String,
    enum: [
      'Technical',
      'Programming',
      'Design',
      'Business',
      'Language',
      'Soft Skills',
      'Other'
    ],
    required: [true, 'Category is required']
  },
  proficiency: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: 'Proficiency must be an integer'
    }
  },
  learningResources: [{
    type: String,
    trim: true
  }],
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  visibility: {
    type: String,
    enum: ['Public', 'Private', 'Connections'],
    default: 'Public'
  }
}, { 
  timestamps: true,
  versionKey: false 
});

// Indexes for better query performance
SkillSchema.index({ userId: 1 });
SkillSchema.index({ name: 1 });
SkillSchema.index({ category: 1 });
SkillSchema.index({ proficiency: -1 });

module.exports = mongoose.model("Skill", SkillSchema);