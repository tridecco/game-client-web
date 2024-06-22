/**
 * Auth routes.
 * @module routes/auth
 */

// Load the modules
const router = require("express").Router();

// Load the login route
router.get("/login", (req, res) => {
  res.render("login");
});

// Load the two-factor authentication route
router.get("/two-factor-authentication", (req, res) => {
  res.render("two-factor-authentication");
});

// Load the register route
router.get("/register", (req, res) => {
  res.render("register");
});

// Load the password reset route
router.get("/reset-password", (req, res) => {
  res.render("password-reset");
});

module.exports = router;
