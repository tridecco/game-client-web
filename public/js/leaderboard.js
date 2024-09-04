/**
 * The leaderboard class.
 * @module js/leaderboard
 */

class Leaderboard {
  /**
   * Get the leaderboard data.
   * @returns {Array} The leaderboard data.
   */
  async get() {
    const response = await fetch(`${app.serverUrl}/leaderboard`, {
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
}
