/**
 * @fileoverview Authentication Class
 * @description Authentication class to send authentication requests to the backend.
 */

class Authentication {
  /**
   * @constructor - Initializes the Auth class.
   * @param {Object} app - The App class.
   */
  constructor(app) {
    this.app = app;
    this.apiURL = app.apiURL;
  }
}
