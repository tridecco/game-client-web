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

module.exports = router;
