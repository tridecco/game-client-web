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

module.exports = router;
