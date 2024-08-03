/**
 * Game modules and classes.
 */

/**
 * Game UI class.
 * @module js/game/ui
 */
class GameUI {
  /**
   * Get a section. (Private)
   * @param {string} sectionName - The section name.
   * @returns {HTMLElement} The section.
   */
  _getSection(sectionName) {
    if (
      sectionName !== "queue" &&
      sectionName !== "room" &&
      sectionName !== "game"
    ) {
      throw new Error("Invalid section name");
    }
    return document.getElementById(sectionName);
  }

  /**
   * Show a section. (Private)
   * @param {string} section - The section name.
   */
  _showSection(section) {
    this._getSection(section).style.display = "block";
  }

  /**
   * Hide a section. (Private)
   * @param {string} section - The section name.
   */
  _hideSection(section) {
    this._getSection(section).style.display = "none";
  }

  /**
   * Show a section, hide the others.
   * @param {string} section - The section name.
   */
  showSection(section) {
    const sections = ["queue", "room", "game"];
    sections.forEach((s) => {
      if (s === section) {
        this._showSection(s);
      } else {
        this._hideSection(s);
      }
    });
  }

  /**
   * Show the queue.
   * @param {string} gameMode - The game mode.
   */
  showQueue(gameMode) {
    let displayGameMode;
    switch (gameMode) {
      case "classic-3p":
        displayGameMode = "Classic (3 players)";
        break;
      case "classic-4p":
        displayGameMode = "Classic (4 players)";
        break;
      default:
        displayGameMode = gameMode;
    }
    document.getElementById("queue-mode").innerText = displayGameMode;

    this.showSection("queue");
  }

  /**
   * Show the room.
   */
  showRoom() {
    this.showSection("room");
  }
}
