/**
 * @fileoverview User Class
 * @description User class to send user requests to the backend.
 */

const DEFAULT_SAFETY_RECORDS_LIMIT = 10; // Default number of safety records to return

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

  /**
   * @method getSettings - Gets the user settings.
   * @returns {Promise<Object>} - The response object.
   */
  async getSettings() {
    const response = await fetch(
      `${this.apiURL}/users/${this.app.auth.userId}/settings`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await response.json();

    return data;
  }

  /**
   * @method getSafetyRecords - Gets the user safety records.
   * @param {number} limit - The number of records to return.
   * @param {number} offset - The number of records to skip.
   * @returns {Promise<Object>} - The response object.
   */
  async getSafetyRecords(limit = DEFAULT_SAFETY_RECORDS_LIMIT, offset = 0) {
    const response = await fetch(
      `${this.apiURL}/users/${this.app.auth.userId}/safety-records?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await response.json();

    return data;
  }

  /**
   * @method updateUsername - Updates the username of the user.
   * @param {string} username - The new username.
   * @returns {Promise<Object>} - The response object.
   */
  async updateUsername(username) {
    const response = await fetch(
      `${this.apiURL}/users/${this.app.auth.userId}/username`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      },
    );

    const data = await response.json();

    return data;
  }

  /**
   * @method updateEmail - Updates the email of the user.
   * @param {string} email - The new email.
   * @returns {Promise<Object>} - The response object.
   */
  async updateEmail(email) {
    const callbackUrl = `${this.baseURL}/user/account/complete-email-update`;

    const response = await fetch(
      `${this.apiURL}/users/${this.app.auth.userId}/email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, callbackUrl }),
      },
    );

    const data = await response.json();

    return data;
  }

  /**
   * @method completeEmailUpdate - Completes the email update of the user.
   * @param {string} token - The email update token.
   * @returns {Promise<Object>} - The response object.
   */
  async completeEmailUpdate(token) {
    const response = await fetch(
      `${this.apiURL}/users/${this.app.auth.userId}/email/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      },
    );

    const data = await response.json();

    return data;
  }

  /**
   * @method updatePassword - Updates the password of the user.
   * @param {string} currentPassword - The current password.
   * @param {string} newPassword - The new password.
   * @returns {Promise<Object>} - The response object.
   */
  async updatePassword(currentPassword, newPassword) {
    const response = await fetch(
      `${this.apiURL}/users/${this.app.auth.userId}/password`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      },
    );

    const data = await response.json();

    return data;
  }
}
