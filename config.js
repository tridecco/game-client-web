// config.js
// Configurations file for the server.

/**
 * Configurations for the server.
 * @module config
 * @type {Object}
 * @property {string} host - The hostname to listen on.
 * @property {number} port - The port to listen on.
 * @property {string} codePath - The path to the code directory.
 * @property {Object} https - HTTPS configurations.
 * @property {boolean} https.enabled - Whether HTTPS is enabled. (Note: This should be enabled in a production environment.)
 * @property {string} https.key - The path to the key file for HTTPS.
 * @property {string} https.cert - The path to the certificate file for HTTPS.
 * @property {Object} backend - Backend configurations.
 * @property {boolean} backend.https - Whether the backend uses HTTPS.
 * @property {string} backend.host - The hostname of the backend.
 * @property {number} backend.port - The port of the backend.
 */

const config = {
  host: "localhost",
  port: 3000,
  codePath: __dirname,
  https: {
    enabled: false,
    key: __dirname + "/ssl/" + "tridecco.key",
    cert: __dirname + "/ssl/" + "tridecco.pem",
  },
};

module.exports = config;
