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

// Load the game route
router.use("/game", (req, res) => {
  res.render("pages/game");
});

// Load the game record route
router.get("/game-records/:gameId", (req, res) => {
  res.render("pages/game-record", { gameId: req.params.gameId });
});

// Load the auth routes
router.use("/", require("./auth"));

// Load the my routes
router.use("/my", require("./my"));

// Load the users routes
router.use("/users", require("./users"));

// Load the default route (404 Not Found)
router.use("*", (req, res) => {
  res.render("pages/404");
});

module.exports = router;
