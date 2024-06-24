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
}
