/**
 * @fileoverview User Class
 * @description User class to send user requests to the backend.
 */

class User {
  /**
   * @constructor - Initializes the User class.
   * @param {Object} app - The App class.
   */
  constructor(app) {
    this.app = app;
    this.baseURL = app.baseURL;
    this.apiURL = app.apiURL;
  }
}
