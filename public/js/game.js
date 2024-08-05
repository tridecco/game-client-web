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
    this.socket = io(serverUrl, {
      withCredentials: true,
    });
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

  /**
   * Join the queue.
   * @param {string} queueName - The queue name. (game mode)
   * @returns {Promise} The promise object.
   */
  joinQueue(queueName) {
    return new Promise((resolve, reject) => {
      this.socket.emit("queue", { queueName }, (response) => {
        if (!response.success) {
          reject(new Error(response.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Leave the queue.
   * @returns {Promise} The promise object.
   */
  leaveQueue() {
    return new Promise((resolve, reject) => {
      this.socket.emit("unqueue", {}, (response) => {
        if (!response.success) {
          reject(new Error(response.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Create a room.
   * @param {string} gameMode - The game mode.
   * @returns {Promise} The promise object.
   */
  createRoom(gameMode) {
    return new Promise((resolve, reject) => {
      this.socket.emit("createCustomRoom", { gameMode }, (response) => {
        if (!response.success) {
          reject(new Error(response.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Join the room.
   * @param {string} roomId - The room ID.
   * @returns {Promise} The promise object.
   */
  joinRoom(roomId) {
    return new Promise((resolve, reject) => {
      this.socket.emit("joinCustomRoom", { roomId }, (response) => {
        if (!response.success) {
          reject(new Error(response.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Set the player ready.
   */
  playerReady() {
    this.socket.emit("game-client:ready", {});
  }

  /**
   * Add listener.
   * @param {string} event - The event name.
   * @param {Function} listener - The listener function.
   */
  addListener(event, listener) {
    this.socket.on(event, listener);
  }

  /**
   * Add listener once.
   * @param {string} event - The event name.
   * @param {Function} listener - The listener function.
   */
  addListenerOnce(event, listener) {
    this.socket.once(event, listener);
  }

  /**
   * Remove listener.
   * @param {string} event - The event name.
   * @param {Function} listener - The listener function.
   */
  removeListener(event, listener) {
    this.socket.off(event, listener);
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
      sectionName !== "ready" &&
      sectionName !== "game" &&
      sectionName !== "error"
    ) {
      throw new Error("Invalid section name");
    }
    return document.getElementById(sectionName);
  }

  /**
   * Get display game mode. (Private)
   * @param {string} gameMode - The game mode.
   * @returns {string} The display game mode.
   */
  _getDisplayGameMode(gameMode) {
    switch (gameMode) {
      case "classic-3p":
        return "Classic (3 players)";
      case "classic-4p":
        return "Classic (4 players)";
      default:
        return gameMode;
    }
  }

  /**
   * Get game mode player count. (Private)
   * @param {string} gameMode - The game mode.
   * @returns {number} The player count.
   */
  _getGameModePlayerCount(gameMode) {
    switch (gameMode) {
      case "classic-3p":
        return 3;
      case "classic-4p":
        return 4;
      default:
        return 0;
    }
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
    const sections = ["queue", "room", "game", "ready", "error"];
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
    document.getElementById("queue-mode").innerText =
      this._getDisplayGameMode(gameMode);

    this.showSection("queue");
  }

  /**
   * Show the room.
   * @param {string} roomId - The room ID.
   * @param {string} gameMode - The game mode.
   * @param {Object[]} players - The players in the room.
   * @param {isHost} isHost - The player is the host.
   * @param {Function} startGameHandler - The start game handler.
   */
  showRoom(roomId, gameMode, players, isHost, startGameHandler) {
    this.showSection("room");

    this.currentRoomPlayersMax = this._getGameModePlayerCount(gameMode);
    this.currentRoomPlayersCount = players.length;

    const roomIdElement = document.getElementById("room-id");
    roomIdElement.value = roomId;

    const gameModeElement = document.getElementById("room-mode");
    gameModeElement.innerText = this._getDisplayGameMode(gameMode);

    const roomStatusElement = document.getElementById("room-status");
    roomStatusElement.innerText = `Waiting for players (${players.length}/${this.currentRoomPlayersMax})`;

    let playersElement = document.getElementById("room-players");
    playersElement.innerHTML = "";
    players.forEach((player) => {
      player.avatar = player.avatar || "/img/default-avatar.png";
      const playerElement = `
        <div id="room-player-${player.id}" class="flex flex-col items-center mb-4">
          <img class="w-16 h-16 rounded-full border-2 border-gray-300" src="${player.avatar}" alt="${player.name}">
          <span class="mt-2 text-sm">${player.name}</span>
        </div>
      `;
      playersElement.innerHTML += playerElement;
    });

    if (isHost) {
      this.currentRoomIsHost = true;

      const startButton = document.getElementById("room-start-game");
      startButton.style.display = "block";
      startButton.addEventListener("click", () => {
        startButton.disabled = true;
        startButton.classList.add("cursor-not-allowed");
        startButton.innerText = "Starting...";

        startGameHandler();
      });
    }
  }

  /**
   * Show the game ready.
   * @param {Object[]} players - The players in the game.
   * @param {Function} clickHandler - The click handler.
   */
  showGameReady(players, clickHandler) {
    let playersElement = document.getElementById("ready-players");
    playersElement.innerHTML = "";
    players.forEach((player) => {
      player.avatar = player.avatar || "/img/default-avatar.png";
      const playerElement = `
        <div id="ready-player-${player.id}" class="flex flex-col items-center mb-4">
          <img class="w-16 h-16 rounded-full border-2 border-gray-300" src="${player.avatar}" alt="${player.name}">
          <span class="mt-2 text-sm">${player.name}</span>
        </div>
      `;
      playersElement.innerHTML += playerElement;
    });

    const startButton = document.getElementById("ready-start-game");
    startButton.addEventListener("click", () => {
      startButton.disabled = true;
      startButton.classList.add("cursor-not-allowed");
      startButton.innerText = "Ready...";

      clickHandler();
    });

    this.showSection("ready");
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

  /**
   * Player joined the room.
   * @param {Object} player - The player.
   */
  playerJoinedRoom(player) {
    this.currentRoomPlayersCount++;

    const playersElement = document.getElementById("room-players");
    player.avatar = player.avatar || "/img/default-avatar.png";
    const playerElement = `
      <div id="room-player-${player.id}" class="flex flex-col items-center mb-4">
        <img class="w-16 h-16 rounded-full border-2 border-gray-300" src="${player.avatar}" alt="${player.name}">
        <span class="mt-2 text-sm">${player.name}</span>
      </div>
    `;
    playersElement.innerHTML += playerElement;

    const roomStatusElement = document.getElementById("room-status");
    if (this.currentRoomPlayersCount === this.currentRoomPlayersMax) {
      roomStatusElement.innerText = "Waiting for host to start the game";

      if (this.currentRoomIsHost) {
        const startButton = document.getElementById("room-start-game");
        startButton.disabled = false;
        startButton.classList.remove("cursor-not-allowed");
        startButton.classList.remove("bg-gray-400");
        startButton.classList.add("bg-blue-500", "hover:bg-blue-700");
      }
    } else {
      roomStatusElement.innerText = `Waiting for players (${this.currentRoomPlayersCount}/${this.currentRoomPlayersMax})`;
    }
  }

  /**
   * Player left the room.
   * @param {number} playerId - The player
   */
  playerLeftRoom(playerId) {
    this.currentRoomPlayersCount--;

    const playerElement = document.getElementById(`room-player-${playerId}`);
    playerElement.remove();

    const roomStatusElement = document.getElementById("room-status");
    roomStatusElement.innerText = `Waiting for players (${this.currentRoomPlayersCount}/${this.currentRoomPlayersMax})`;

    if (this.currentRoomIsHost) {
      const startButton = document.getElementById("room-start-game");
      startButton.disabled = true;
      startButton.classList.add("cursor-not-allowed");
      startButton.classList.add("bg-gray-400");
      startButton.classList.remove("bg-blue-500", "hover:bg-blue-700");
    }
  }

  /**
   * Set the player ready.
   * @param {number} playerId - The player
   */
  playerReady(playerId) {
    const playerElement = document.getElementById(`ready-player-${playerId}`);
    const playerAvatar = playerElement.querySelector("img");
    playerAvatar.classList.add("border-green-500");
  }
}
