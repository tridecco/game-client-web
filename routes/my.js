/**
 * My routes.
 * @module routes/my
 */

// Load the modules
const router = require("express").Router();

// Load the my route
router.get("/", (req, res) => {
  res.render("pages/my/profile");
});

// Load the my (edit) route
router.get("/edit", (req, res) => {
  res.render("pages/my/edit-profile");
});

// Load the settings route
router.get("/settings", (req, res) => {
  res.render("pages/my/settings");
});

// Load the game records route
router.get("/game-records", (req, res) => {
  res.render("pages/my/game-records");
});

// Load the security records route
router.get("/security-records", (req, res) => {
  res.render("pages/my/security-records");
});

// Load the sessions route
router.get("/sessions", (req, res) => {
  res.render("pages/my/sessions");
});

module.exports = router;
