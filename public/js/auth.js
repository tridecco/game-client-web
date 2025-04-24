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

  /**
   * @method completeRegistration - Completes the registration of a user.
   * @param {string} token - The registration token.
   * @param {string} username - The username of the user.
   * @param {string} password - The password of the user.
   * @returns {Promise<Object>} - The response object.
   */
  async completeRegistration(token, username, password) {
    const response = await fetch(`${this.apiURL}/auth/complete-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, username, password }),
    });

    const data = await response.json();

    return data;
  }

  /**
   * @method login - Logs in a user.
   * @param {string} identifier - The email or username of the user.
   * @param {string} password - The password of the user.
   * @returns {Promise<Object>} - The response object.
   */
  async login(identifier, password) {
    const response = await fetch(`${this.apiURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json();

    return data;
  }

  /**
   * @method resetPassword - Sends a password reset email.
   * @param {string} email - The email address of the user.
   * @returns {Promise<Object>} - The response object.
   */
  async resetPassword(email) {
    const callbackUrl = `${this.baseURL}/password-reset/complete`;

    const response = await fetch(`${this.apiURL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, callbackUrl }),
    });

    const data = await response.json();

    return data;
  }

  /**
   * @method completePasswordReset - Completes the password reset process.
   * @param {string} token - The password reset token.
   * @param {string} password - The new password.
   * @returns {Promise<Object>} - The response object.
   */
  async completePasswordReset(token, password) {
    const response = await fetch(
      `${this.apiURL}/auth/complete-reset-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      },
    );

    const data = await response.json();

    return data;
  }
}
