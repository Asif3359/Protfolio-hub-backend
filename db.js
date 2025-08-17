// db.js
const mongoose = require('mongoose');
// process.env.MONGO_URI
// Connect to MongoDB with database name
// const mongoURI = 'mongodb://localhost:27017/markaz-al-mahfaza'; // Replace 'yourDatabaseName' with your actual database name;
const mongoURI = process.env.MONGO_URI;
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
