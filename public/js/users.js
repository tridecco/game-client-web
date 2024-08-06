/**
 * The users class.
 * @module js/users
 */

class Users {
  /**
   * Create a new Users object.
   * @param {string} username - The user username.
   */
  constructor(username) {
    this.username = username;
  }

  /**
   * Get user data.
   * @returns {Object} The user data.
   */
  async getUserData() {
    const response = await fetch(
      `${app.serverUrl}/users/username/${this.username}`,
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
}
