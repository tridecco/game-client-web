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

module.exports = router;
