// server.js
// Server file for the application.

// Load the configuration
const config = require("./config");

// Load the server
const http = require("http");
const https = require("https");
const express = require("express");
const app = express();

// Load the renderer (EJS)
app.set("view engine", "ejs");

// Load the static files
app.use(express.static("public"));

// Load the routes
const routes = require(config.codePath + "/routes/index");
app.use("/", routes);

// Server class
class Server {
  /**
   * Start the server.
   * @param {string} host - The hostname to listen on.
   * @param {number} port - The port to listen on.
   * @param {boolean} httpsEnabled - Whether HTTPS is enabled.
   */
  static start(
    host = config.host,
    port = config.port,
    httpsEnabled = config.https.enabled
  ) {
    if (httpsEnabled) {
      // Load the HTTPS server
      const fs = require("fs"); // Load the file system module for reading the key and certificate
      const options = {
        key: fs.readFileSync(config.https.key),
        cert: fs.readFileSync(config.https.cert),
      };
      https.createServer(options, app).listen(443, host, () => {
        console.log(`Server started on https://${host}:${443}`);
      });

      // Redirect HTTP to HTTPS
      http
        .createServer((req, res) => {
          res.writeHead(301, {
            Location: `https://${req.headers.host}${req.url}`,
          });
          res.end();
        })
        .listen(port, host, () => {
          console.log(`Redirect server listening on http://${host}:${port}`);
        });
    } else {
      // Load the HTTP server
      http.createServer(app).listen(port, host, () => {
        console.log(`Server started on http://${host}:${port}`);
      });
    }
  }

  // Stop the server
  static stop() {
    console.log("Server stopped");
    process.exit();
  }
}

// Start the server
Server.start();

module.exports = Server;
