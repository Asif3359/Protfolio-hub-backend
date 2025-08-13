// models/Project.js
const mongoose = require("../db");

const ProjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    images: [
      {
        url: {
          type: String,
          trim: true,
          required: [true, "Image URL is required"],
        },
      },
    ],
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    keyFeatures: [
      {
        type: String,
        trim: true,
        maxlength: [200, "Feature description cannot exceed 200 characters"],
      },
    ],
    technologies: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Technology name cannot exceed 50 characters"],
      },
    ],
    repositoryUrl: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?(www\.)?github\.com\/.+/i,
        "Please enter a valid GitHub URL",
      ],
    },
    liveUrl: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)/i,
        "Please enter a valid URL with http:// or https://",
      ],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      validate: {
        validator: function (value) {
          // End date must be after start date if both exist
          return !this.endDate || value <= this.endDate;
        },
        message: "Start date must be before or equal to end date",
      },
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          // End date must be after start date if both exist
          return !this.startDate || value >= this.startDate;
        },
        message: "End date must be after or equal to start date",
      },
    },
    status: {
      type: String,
      enum: ["active", "archived", "draft", "completed"],
      default: "active",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// Update the updatedAt field before saving
ProjectSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // If project has end date and it's in the past, mark as completed
  if (this.endDate && this.endDate < new Date() && this.status !== "archived") {
    this.status = "completed";
  }

  next();
});

module.exports = mongoose.model("Project", ProjectSchema);
