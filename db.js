// db.js
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI);

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
