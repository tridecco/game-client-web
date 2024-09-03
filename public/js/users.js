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

  /**
   * Get user level and color from XP.
   * @param {number} xp - The user XP.
   * @returns {Object} The user level and color.
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
        };
      }
    }

    return {
      level: levels.length,
      color: colors[colors.length - 1].color,
    };
  }
}
