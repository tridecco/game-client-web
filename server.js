/**
 * @fileoverview Server Main File
 * @description Server configuration and initialization.
 */

// Load environment variables from .env file
require('dotenv').config();

// Load required modules
const express = require('express');
const routes = require('./src/routes');

const DEFAULT_PORT = 3000;
const port = process.env.PORT || DEFAULT_PORT;
const host = process.env.HOST || 'localhost';

const app = express();

// Load public files
app.use(express.static('public'));

// Load the renderer (EJS)
app.set('views', './src/views');
app.set('view engine', 'ejs');

// Routes setup
app.use('/', routes);

// Start the server
app.listen(port, host, () => {
  console.log(
    `Tridecco Game Client (Web) Server is running on http://${host}:${port}`,
  );
});

module.exports = app;
