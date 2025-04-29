/**
 * @fileoverview User Routes
 * @description Routes for user management.
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  return res.render('pages/user/profile');
});

router.get('/edit', (req, res) => {
  return res.render('pages/user/edit-profile');
});

router.get('/account', (req, res) => {
  return res.render('pages/user/account');
});

router.get('/account/complete-email-update', (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.redirect('/user/account');
  } else {
    return res.render('pages/user/complete-email-update', { token });
  }
});

router.get('/settings', (req, res) => {
  return res.render('pages/user/settings');
});

router.get('/security', (req, res) => {
  return res.render('pages/user/security');
});

module.exports = router;
