/**
 * @fileoverview Routes Index
 * @description Index file for routes.
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

router.use('/', authRoutes);
router.use('/user', userRoutes);

router.get('/', (req, res) => {
  return res.render('pages/home', { path: '/' });
});

router.get('/404', (req, res) => {
  return res.render('pages/404', { path: req.query.path || '/' });
});

router.get('/403', (req, res) => {
  return res.render('pages/403', { path: req.query.path || '/' });
});

router.get('*', (req, res) => {
  return res.redirect(`/404?path=${req.path}`);
});

module.exports = router;
