/**
 * Routes file that loads the routes for the server.
 * @module routes/index
 */

// Load the modules
const router = require("express").Router();

// Load the routes

// Load the home route
router.get("/", (req, res) => {
  res.render("home");
});

// Load the auth routes
router.use("/", require("./auth"));

// Load the default route (404 Not Found)
router.use("*", (req, res) => {
  res.render("404");
});

module.exports = router;
