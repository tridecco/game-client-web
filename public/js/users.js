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
    try {
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

      if (!response.ok) {
        throw new Error(`Error fetching user data: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        return data.data;
      } else {
        throw new Error(`Error in response data: ${data.message}`);
      }
    } catch (error) {
      throw new Error(`Exception while fetching user data: ${error.message}`);
    }
  }
}
