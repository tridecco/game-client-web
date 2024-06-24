/**
 * My routes.
 * @module routes/my
 */

// Load the modules
const router = require("express").Router();

// Load the my route
router.get("/", (req, res) => {
  res.render("profile");
});

// Load the my (edit) route
router.get("/edit", (req, res) => {
  res.render("edit-profile");
});

// Load the settings route
router.get("/settings", (req, res) => {
  res.render("settings");
});

module.exports = router;
