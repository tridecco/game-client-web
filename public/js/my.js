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
}
