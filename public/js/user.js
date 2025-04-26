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

  /**
   * @method getUser - Gets the user data.
   * @param {string} userId - The user ID.
   * @returns {Promise<Object>} - The response object.
   */
  async getUser(userId = this.app.auth.userId) {
    const response = await fetch(`${this.apiURL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return data;
  }
}
