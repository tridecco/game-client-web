/**
 * The my(account) class.
 * @module js/my
 */

class My {
  /**
   * Create a new My object.
   */
  constructor(userId) {
    this.userId = userId;
  }

  /**
   * Get user data.
   * @returns {object} The user data.
   */
  async getUserData() {
    const response = await fetch(`${app.serverUrl}/users/id/${this.userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.status === "success") {
      return data.data;
    } else {
      return null;
    }
  }

  /**
   * Update user profile.
   * @param {object} data - The user data.
   * @returns {object} The response data.
   */
  async updateProfile(data) {
    const response = await fetch(
      `${app.serverUrl}/users/${this.userId}/profile`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const responseData = await response.json();

    return responseData;
  }

  /**
   * Update user username.
   * @param {string} username - The username.
   * @returns {object} The response data.
   */
  async updateUsername(username) {
    const response = await fetch(
      `${app.serverUrl}/users/${this.userId}/username`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      }
    );

    const responseData = await response.json();

    return responseData;
  }

  /**
   * Update user email.
   * @param {string} email - The email.
   * @param {string} code - Email verification code.
   * @returns {object} The response data.
   */
  async updateEmail(email, code) {
    code = parseInt(code);

    const response = await fetch(
      `${app.serverUrl}/users/${this.userId}/email`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      }
    );

    const responseData = await response.json();

    return responseData;
  }

  /**
   * Update user password.
   * @param {string} password - The password.
   * @param {string} newPassword - The new password.
   * @returns {object} The response data.
   */
  async updatePassword(currentPassword, newPassword) {
    const response = await fetch(
      `${app.serverUrl}/users/${this.userId}/password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      }
    );

    const responseData = await response.json();

    return responseData;
  }
}
