// db.js
const mongoose = require('mongoose');

// Connect to MongoDB with database name
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio_hub';
mongoose.connect(mongoURI);

const db = mongoose.connection;

// On success
db.once('open', () => {
  console.log('✅ MongoDB connected successfully');
});

// On error
db.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

module.exports = mongoose;
