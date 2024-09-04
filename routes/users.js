/**
 * Users routes.
 * @module routes/users
 */

// Load the modules
const router = require("express").Router();

// Load the users route
router.get("/:username", (req, res) => {
  res.render("pages/users/profile", { username: req.params.username });
});

// Load the game records route
router.get("/:username/game-records", (req, res) => {
  res.render("pages/users/game-records", { username: req.params.username });
});

module.exports = router;
