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
}
