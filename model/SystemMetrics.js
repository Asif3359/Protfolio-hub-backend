const mongoose = require("../db");

const SystemMetricsSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    systemHealth: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    securityScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    storageUsage: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    activeUsers: {
      type: Number,
      default: 0,
    },
    activeSessions: {
      type: Number,
      default: 0,
    },
    apiCallsPerMinute: {
      type: Number,
      default: 0,
    },
    totalPortfolios: {
      type: Number,
      default: 0,
    },
    activePortfolios: {
      type: Number,
      default: 0,
    },
    portfoliosCreatedThisWeek: {
      type: Number,
      default: 0,
    },
    databaseConnections: {
      type: Number,
      default: 0,
    },
    memoryUsage: {
      type: Number,
      default: 0,
    },
    cpuUsage: {
      type: Number,
      default: 0,
    },
    responseTime: {
      type: Number,
      default: 0,
    },
    errorRate: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// Index for efficient querying
SystemMetricsSchema.index({ timestamp: -1 });

module.exports = mongoose.model("SystemMetrics", SystemMetricsSchema);
