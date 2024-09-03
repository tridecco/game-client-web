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
   * Get user game records.
   * @param {number} page - The page number.
   * @param {number} pageSize - The number of records per page.
   * @returns {Array} The user game records.
   */
  async getGameRecords(page, pageSize) {
    const response = await fetch(
      `${app.serverUrl}/games/user/${this.userId}?page=${page}&pageSize=${pageSize}`,
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
   * Get user security records.
   * @param {number} startIndex - The start index of the records.
   * @param {number} limit - The number of records to fetch.
   * @returns {Array} The user security records.
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

  /**
   * Get user level and color from XP.
   * @param {number} xp - The user XP.
   * @returns {Object} The user level, color, and next level XP.
   */
  getLevelProgress(xp) {
    const levels = [
      0,
      200,
      500,
      900,
      1400,
      2000,
      2700,
      3500,
      4400,
      5400, // Levels 1-10
      6500,
      7700,
      9000,
      10400,
      11900,
      13500,
      15200,
      17000,
      18900,
      20900, // Levels 11-20
      23000,
      25200,
      27500,
      29900,
      32400,
      35000,
      37700,
      40500,
      43400,
      46400, // Levels 21-30
      49500,
      52700,
      56000,
      59400,
      62900,
      66500,
      70200,
      74000,
      77900,
      81900, // Levels 31-40
      86000,
      90200,
      94500,
      98900,
      103400,
      108000,
      112700,
      117500,
      122400,
      127400, // Levels 41-50
      150000,
      175000,
      200000,
      230000,
      260000,
      295000,
      335000,
      380000,
      430000,
      500000, // Levels 51-60
    ];

    const colors = [
      { level: 1, color: "#00FF00" }, // Green
      { level: 11, color: "#0000FF" }, // Blue
      { level: 21, color: "#FFFF00" }, // Yellow
      { level: 31, color: "#FFA500" }, // Orange
      { level: 41, color: "#FF0000" }, // Red
      { level: 51, color: "#800080" }, // Purple
    ];

    for (let i = 0; i < levels.length; i++) {
      if (xp < levels[i]) {
        let color;
        for (let j = colors.length - 1; j >= 0; j--) {
          if (i >= colors[j].level) {
            console.log(i, colors[j].level);
            color = colors[j].color;
            break;
          }
        }

        return {
          level: i,
          color: color,
          nextLevelXp: levels[i],
        };
      }
    }

    return {
      level: levels.length,
      color: colors[colors.length - 1].color,
      nextLevelXp: levels[levels.length - 1],
    };
  }
}
