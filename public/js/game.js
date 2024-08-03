/**
 * Game modules and classes.
 */

/**
 * Game network class.
 * @module js/game/network
 */
class GameNetwork {
  /**
   * Create a game network.
   * @param {string} serverUrl - The server URL.
   */
  constructor(serverUrl) {
    this.socket = io(serverUrl);
  }

  /**
   * Authenticate the player.
   * @param {string} sessionId - The session ID.
   * @returns {Promise} The promise object.
   */
  authenticate(sessionId) {
    return new Promise((resolve, reject) => {
      this.socket.emit("authenticate", { sessionId }, (response) => {
        if (!response.success) {
          reject(new Error(response.message));
        } else {
          resolve(response);
        }
      });
    });
  }
}

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
      sectionName !== "game" &&
      sectionName !== "error"
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
    const sections = ["queue", "room", "game", "error"];
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

  /**
   * Show the error.
   * @param {string} title - The error title. (Optional, if null, hide the title)
   * @param {string} message - The error message. (Optional, if null, hide the message)
   * @param {string} inputPlaceholder - The input placeholder. (Optional, if null, hide the input)
   * @param {Function} clickHandler - The click handler. (Optional, if null, hide the button)
   * @param {string} buttonText - The button text. (Optional, if null, hide the button)
   */
  showError(
    title = null,
    message = null,
    inputPlaceholder = null,
    clickHandler = null,
    buttonText = null
  ) {
    const errorTitle = document.getElementById("error-title");
    const errorMessage = document.getElementById("error-content");
    const errorInput = document.getElementById("error-input");
    const errorButton = document.getElementById("error-button");

    if (title) {
      errorTitle.style.display = "block";
      errorTitle.innerText = title;
    } else {
      errorTitle.style.display = "none";
    }

    if (message) {
      errorMessage.style.display = "block";
      errorMessage.innerText = message;
    } else {
      errorMessage.style.display = "none";
    }

    if (inputPlaceholder) {
      errorInput.style.display = "block";
      errorInput.placeholder = inputPlaceholder;
    } else {
      errorInput.style.display = "none";
    }

    if (clickHandler) {
      errorButton.style.display = "block";
      errorButton.onclick = clickHandler;
      errorButton.innerText = buttonText;
    } else {
      errorButton.style.display = "none";
    }

    this.showSection("error");
  }

  /**
   * Start the queue waiting time.
   * @returns {Object} The timer object.
   * @property {Function} stop - Stop the timer.
   */
  startQueueWaitingTime() {
    const queueTime = document.getElementById("waiting-time");

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const minutes = Math.floor(elapsedTime / 60000);
      const seconds = Math.floor((elapsedTime % 60000) / 1000);
      queueTime.innerText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }, 1000);

    return {
      stop: () => clearInterval(timer),
    };
  }
}