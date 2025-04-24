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
  if (!req.query.token) {
    return res.redirect('/register');
  }
  return res.render('pages/auth/complete-registration', {
    token: req.query.token,
  });
});

router.get('/login', (req, res) => {
  return res.render('pages/auth/login', {
    redirect: req.query.redirect,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
  });
});

module.exports = router;
