// models/Research.js
const mongoose = require("../db");

const ResearchSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  title: {
    type: String,
    required: [true, 'Research title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  researchField: {
    type: String,
    required: [true, 'Research field is required'],
    trim: true
  },
  publicationDate: {
    type: Date,
    required: [true, 'Publication date is required']
  },
  publisher: {
    type: String,
    trim: true
  },
  publicationType: {
    type: String,
    enum: [
      'Journal Article',
      'Conference Paper',
      'Book Chapter',
      'Thesis',
      'Preprint',
      'Technical Report',
      'Other'
    ],
    required: true
  },
  doi: {
    type: String,
    trim: true,
    match: [/^10.\d{4,9}\/[-._;()/:A-Z0-9]+$/i, 'Please enter a valid DOI']
  },
  coAuthors: [{
    name: {
      type: String,
      trim: true
    },
    institution: {
      type: String,
      trim: true
    }
  }],
  institution: {
    type: String,
    trim: true
  },
  fundingAgency: {
    type: String,
    trim: true
  },
  grantNumber: {
    type: String,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  citations: {
    type: Number,
    default: 0
  },
  links: {
    pdf: {
      type: String,
      trim: true
    },
    projectPage: {
      type: String,
      trim: true
    },
    codeRepository: {
      type: String,
      trim: true
    }
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  peerReviewed: {
    type: Boolean,
    default: false
  },
  impactStatement: {
    type: String,
    trim: true,
    maxlength: [500, 'Impact statement cannot exceed 500 characters']
  }
}, { 
  timestamps: true,
  versionKey: false 
});

// Indexes
ResearchSchema.index({ userId: 1 });
ResearchSchema.index({ publicationDate: -1 });
ResearchSchema.index({ researchField: 1 });
ResearchSchema.index({ keywords: 1 });

module.exports = mongoose.model("Research", ResearchSchema);