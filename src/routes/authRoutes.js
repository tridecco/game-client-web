/**
 * @fileoverview Auth Routes
 * @description Routes for user authentication.
 */

const express = require('express');
const router = express.Router();

router.get('/register', (req, res) => {
  return res.render('pages/auth/register', {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
  });
});

router.get('/register/complete', (req, res) => {
  return res.render('pages/auth/complete-registration', {
    token: req.query.token,
  });
});

module.exports = router;
