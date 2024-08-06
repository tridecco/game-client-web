/**
 * The my(account) class.
 * @module js/my
 */

class My {
  /**
   * Create a new My object.
   * @param {string} userId - The user ID.
   */
  constructor(userId) {
    this.userId = userId;
  }

  /**
   * Get user data.
   * @returns {Object} The user data.
   */
  async getUserData() {
    const response = await fetch(`${app.serverUrl}/users/id/${this.userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
   * @param {Object} data - The user data.
   * @returns {Object} The response data.
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
        credentials: "include",
      }
    );

    const responseData = await response.json();

    return responseData;
  }

  /**
   * Update user username.
   * @param {string} username - The username.
   * @returns {Object} The response data.
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
        credentials: "include",
      }
    );

    const responseData = await response.json();

    return responseData;
  }

  /**
   * Update user email.
   * @param {string} email - The email.
   * @param {string} code - Email verification code.
   * @returns {Object} The response data.
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
        credentials: "include",
      }
    );

    const responseData = await response.json();

    return responseData;
  }

  /**
   * Update user password.
   * @param {string} password - The password.
   * @param {string} newPassword - The new password.
   * @returns {Object} The response data.
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
        credentials: "include",
      }
    );

    const responseData = await response.json();

    return responseData;
  }

  /**
   * Get user security records.
   * @param {number} startIndex - The start index of the records.
   * @param {number} limit - The number of records to fetch.
   * @returns {Object} The user security records.
   */
  async getSecurityRecords(startIndex, limit) {
    const response = await fetch(
      `${app.serverUrl}/users/safety-records/${this.userId}?startIndex=${startIndex}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const data = await response.json();

    if (data.status === "success") {
      return data.data;
    } else {
      return null;
    }
  }

  /**
   * Get user sessions list.
   * @returns {Object} The user sessions list.
   */
  async getSessions() {
    const response = await fetch(
      `${app.serverUrl}/sessions/user/${this.userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const data = await response.json();

    if (data.status === "success") {
      return data.data;
    } else {
      return null;
    }
  }

  /**
   * Remove a session.
   * @param {string} sessionId - The session ID.
   * @returns {Object} The response data.
   */
  async removeSession(sessionId) {
    const response = await fetch(`${app.serverUrl}/sessions/${sessionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const responseData = await response.json();

    return responseData;
  }

  /**
   * Remove all sessions. (Except the current session)
   * @returns {Object} The response data.
   */
  async removeAllSessions() {
    const response = await fetch(
      `${app.serverUrl}/sessions/user/${this.userId}/exclude-current`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const responseData = await response.json();

    return responseData;
  }
}
