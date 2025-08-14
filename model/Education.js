// models/Education.js
const mongoose = require("../db");

const EducationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  school: {
    type: String,
    required: [true, 'School name is required'],
    trim: true
  },
  logo : {
    type : String,
    trim:true
  },
  degree: {
    type: String,
    enum: [
      'High School',
      'Associate',
      'Bachelor',
      'Master',
      'Doctorate',
      'Professional',
      'Certificate',
      'Diploma',
      'Other'
    ],
    required: [true, 'Degree type is required']
  },
  fieldOfStudy: {
    type: String,
    required: [true, 'Field of study is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    // validate: {
    //   validator: function(value) {
    //     // End date must be after start date if both exist
    //     return !this.startDate || !value || value > this.startDate || null;
    //   },
    //   message: 'End date must be after start date'
    // }
  },
  currentlyStudying: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    trim: true
  },
  grade: {
    type: String,
    trim: true
  },
  activities: {
    type: String,
    trim: true,
    maxlength: [500, 'Activities description cannot exceed 500 characters']
  },
  honors: {
    type: String,
    trim: true,
    maxlength: [500, 'Honors description cannot exceed 500 characters']
  },
  educationType: {
    type: String,
    enum: [
      'Full-time',
      'Part-time',
      'Online',
      'Distance Learning',
      'Executive'
    ],
    default: 'Full-time'
  },
  location: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Please enter a valid URL']
  },
  media: {
    type: String // URL to diploma, certificate, or other media
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
EducationSchema.index({ userId: 1 });

module.exports = mongoose.model("Education", EducationSchema);