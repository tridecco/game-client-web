/**
 * The game records class.
 * @module js/game-records
 */

class GameRecords {
  /**
   * Create a new GameRecords object.
   * @param {string} gameId - The game ID.
   */
  constructor(gameId) {
    this.gameId = gameId;
  }

  /**
   * Get game record data.
   * @returns {Object} The game record data.
   */
  async get() {
    try {
      const response = await fetch(`${app.serverUrl}/games/${this.gameId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Error fetching game record data: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.status === "success") {
        this.gameRecordData = data.data;
        return data.data;
      } else {
        throw new Error(`Error in response data: ${data.message}`);
      }
    } catch (error) {
      throw new Error(
        `Exception while fetching game record data: ${error.message}`
      );
    }
  }

  /**
   * Get user data.
   * @param {string} userId - The user ID.
   * @returns {Object} The user data.
   */
  async getUserData(userId) {
    try {
      const response = await fetch(`${app.serverUrl}/users/id/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error fetching user data: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        this.userId = data.data._id;

        return data.data;
      } else {
        throw new Error(`Error in response data: ${data.message}`);
      }
    } catch (error) {
      throw new Error(`Exception while fetching user data: ${error.message}`);
    }
  }
}
