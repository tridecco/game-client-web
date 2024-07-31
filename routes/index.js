/**
 * Routes file that loads the routes for the server.
 * @module routes/index
 */

// Load the modules
const router = require("express").Router();

// Load the routes

// Load the home route
router.get("/", (req, res) => {
  res.render("pages/home");
});

// Load the rooms route
router.use("/rooms", (req, res) => {
  res.render("pages/rooms");
});

// Load the auth routes
router.use("/", require("./auth"));

// Load the my routes
router.use("/my", require("./my"));

// Load the default route (404 Not Found)
router.use("*", (req, res) => {
  res.render("pages/404");
});

module.exports = router;
