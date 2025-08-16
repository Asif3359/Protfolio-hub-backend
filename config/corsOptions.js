// config/corsOptions.js
const cors = require('cors');
// module.exports = cors({ origin: '*' });


const allowedOrigins = [
  'http://localhost:3001',
  'https://protfolio-hub-frontend.vercel.app'
];

const corsOptions = cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies/authorization headers
});

module.exports = corsOptions;
