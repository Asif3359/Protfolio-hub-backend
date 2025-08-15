// models/Certification.js
const mongoose = require("../db");

const CertificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  title: {
    type: String,
    required: [true, 'Certification title is required'],
    trim: true
  },
  issuer: {
    type: String,
    required: [true, 'Issuing organization is required'],
    trim: true
  },
  issuerLogo: {
    type: String, // URL to issuer's logo
    trim: true
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required']
  },
  expirationDate: {
    type: Date,
  },
  credentialID: {
    type: String,
    trim: true
  },
  credentialLink: {
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Please enter a valid URL']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  doesNotExpire: {
    type: Boolean,
    default: false
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
  media: {
    type: String // URL to certificate image/document
  },
  visible: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true, // Adds createdAt and updatedAt automatically
  versionKey: false 
});

// Indexes for better query performance
CertificationSchema.index({ userId: 1 });
CertificationSchema.index({ issuer: 1 });
CertificationSchema.index({ issueDate: -1 }); // Most recent first

module.exports = mongoose.model("Certification", CertificationSchema);