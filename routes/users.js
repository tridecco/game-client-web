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

module.exports = router;
