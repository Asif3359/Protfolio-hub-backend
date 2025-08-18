const metricsCalculator = require('../utils/metricsCalculator');
const { v4: uuidv4 } = require('uuid');

// Middleware to track API calls
const trackApiCalls = (req, res, next) => {
  // Track the API call
  metricsCalculator.trackApiCall();
  
  // Track user activity if user is authenticated
  if (req.user && req.user._id) {
    metricsCalculator.updateUserActivity(req.user._id);
  }
  
  // Add request start time for response time calculation
  req.startTime = Date.now();
  
  // Override res.end to track response time
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - req.startTime;
    
    // You could store response time metrics here
    // For now, we'll just track the API call
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Middleware to track user sessions
const trackUserSessions = (req, res, next) => {
  // Generate session ID if not exists
  if (!req.session) {
    req.session = {};
  }
  
  if (!req.session.sessionId) {
    req.session.sessionId = uuidv4();
  }
  
  // Track user session if user is authenticated
  if (req.user && req.session.sessionId) {
    metricsCalculator.trackUserSession(req.user._id, req.session.sessionId);
  }
  
  next();
};

// Middleware to clean up sessions on logout
const cleanupSession = (req, res, next) => {
  if (req.session && req.session.sessionId) {
    metricsCalculator.removeUserSession(req.session.sessionId);
  }
  next();
};

module.exports = {
  trackApiCalls,
  trackUserSessions,
  cleanupSession
};
