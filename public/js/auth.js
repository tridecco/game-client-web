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
    this.baseURL = app.baseURL;
    this.apiURL = app.apiURL;
  }

  /**
   * @method register - Registers a new user.
   * @param {string} email - The email address of the user.
   * @returns {Promise<Object>} - The response object.
   */
  async register(email) {
    const callbackUrl = `${this.baseURL}/register/complete`;

    const response = await fetch(`${this.apiURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, callbackUrl }),
    });

    const data = await response.json();

    return data;
  }
}
