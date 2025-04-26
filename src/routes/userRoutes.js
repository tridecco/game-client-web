/**
 * @fileoverview User Routes
 * @description Routes for user management.
 */

const express = require('express');
const router = express.Router();

router.get('/edit', (req, res) => {
  return res.render('pages/user/edit-profile');
});

module.exports = router;
