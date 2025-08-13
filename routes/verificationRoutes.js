// routes/verificationRoutes.js
const express = require('express');
const router = express.Router();

// Verification Success Page
router.get('/verification-success', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verified Successfully</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        body {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
          padding: 2rem;
        }
      </style>
    </head>
    <body>
      <div class="card" style="width: 100%; max-width: 500px;">
        <div class="card-body">
          <h1 class="card-title">Email Verified Successfully!</h1>
          <p class="card-text">Thank you for verifying your email address. Your account is now fully activated.</p>
          <a href="http://localhost:3001/auth/login" class="btn btn-primary mt-3">Continue to Login</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Verification Error Page
router.get('/verification-error', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Failed</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        body {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
          padding: 2rem;
        }
      </style>
    </head>
    <body>
      <div class="card" style="width: 100%; max-width: 500px;">
        <div class="card-body">
          <h1 class="card-title text-danger">Verification Failed</h1>
          <p class="card-text">The verification link is invalid or has expired.</p>
          <p class="card-text">Please request a new verification email from your account settings.</p>
          <a class="btn btn-primary mt-3">Return to Login</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;