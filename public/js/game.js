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
   * Start the room game.
   * @returns {Promise} The promise object.
   */
  startRoom() {
    return new Promise((resolve, reject) => {
      this.socket.emit("startCustomRoom", {}, (response) => {
        if (!response.success) {
          reject(new Error(response.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Leave the room.
   * @returns {Promise} The promise object.
   */
  leaveRoom() {
    return new Promise((resolve, reject) => {
      this.socket.emit("leaveCustomRoom", {}, (response) => {
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
   * Create a game UI.
   * @param {string} background - The background image.
   */
  constructor(background) {
    document.body.style.backgroundImage = `url(${background})`;
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";
    document.body.style.setProperty("backdrop-filter", "blur(5px)");
    document.body.style.setProperty("-webkit-backdrop-filter", "blur(5px)");
  }

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
    this.currentRoomPlayers = players;

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

    const startButton = document.getElementById("room-start-game");

    startButton.addEventListener("click", () => {
      startButton.disabled = true;
      startButton.classList.add("cursor-not-allowed");
      startButton.innerText = "Starting...";

      startGameHandler();
    });

    if (isHost) {
      this.currentRoomIsHost = true;

      startButton.style.display = "block";
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
   * Show the game.
   * @param {Object[]} players - The players in the game.
   */
  showGame(players) {
    let playersElement = document.getElementById("game-players");
    playersElement.innerHTML = "";

    let playerIndex = 1;
    players.forEach((player) => {
      player.avatar = player.avatar || "/img/default-avatar.png";
      // Player colors from Tailwind CSS: from-red-500 from-yellow-500 from-green-500 from-blue-500 to-red-500 to-yellow-500 to-green-500 to-blue-500 (DON'T REMOVE, USED IN CSS BUILD)
      const playerElement = `
        <div id="game-player-${player.id}" class="relative">
          <img src="${player.avatar}" alt="${player.name}" class="w-16 h-16 rounded-full border-4 border-gray-300">
          <span class="absolute top-0 right-0 bg-gradient-to-r from-${player.color.a}-500 to-${player.color.h}-500 text-white text-xs px-1 rounded-full">P${playerIndex}</span>
          <span class="absolute bottom-0 left-0 bg-white text-gray-800 text-xs px-1 w-50 rounded-full truncate text-center">${player.name}</span>
        </div>
      `;
      playersElement.innerHTML += playerElement;
      playerIndex++;
    });

    this.showSection("game");
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
    this.currentRoomPlayers.push(player);

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
    if (this.currentRoomPlayers.length === this.currentRoomPlayersMax) {
      roomStatusElement.innerText = "Waiting for host to start the game";

      if (this.currentRoomIsHost) {
        const startButton = document.getElementById("room-start-game");
        startButton.disabled = false;
        startButton.classList.remove("cursor-not-allowed");
        startButton.classList.remove("bg-gray-400");
        startButton.classList.add("bg-blue-500", "hover:bg-blue-700");
      }
    } else {
      roomStatusElement.innerText = `Waiting for players (${this.currentRoomPlayers.length}/${this.currentRoomPlayersMax})`;
    }
  }

  /**
   * Player left the room.
   * @param {string} playerId - The player ID.
   */
  playerLeftRoom(playerId) {
    this.currentRoomPlayers = this.currentRoomPlayers.filter(
      (player) => player.id !== playerId
    );

    const playerElement = document.getElementById(`room-player-${playerId}`);
    playerElement.remove();

    const roomStatusElement = document.getElementById("room-status");
    roomStatusElement.innerText = `Waiting for players (${this.currentRoomPlayers.length}/${this.currentRoomPlayersMax})`;

    if (this.currentRoomIsHost) {
      const startButton = document.getElementById("room-start-game");
      startButton.disabled = true;
      startButton.classList.add("cursor-not-allowed");
      startButton.classList.add("bg-gray-400");
      startButton.classList.remove("bg-blue-500", "hover:bg-blue-700");
    } else if (this.currentRoomPlayers[0].isCurrentPlayer) {
      this.currentRoomIsHost = true;

      const startButton = document.getElementById("room-start-game");
      startButton.style.display = "block";
    }
  }

  /**
   * Set the player ready.
   * @param {string} playerId - The player ID.
   */
  playerReady(playerId) {
    const playerElement = document.getElementById(`ready-player-${playerId}`);
    const playerAvatar = playerElement.querySelector("img");
    playerAvatar.classList.add("border-green-500");
  }

  /**
   * Start player turn.
   * @param {string} playerId - The player ID.
   * @param {number} timeout - The turn timeout.
   */
  startPlayerTurn(playerId, timeout) {
    const playerElement = document.getElementById(`game-player-${playerId}`);
    const playerAvatar = playerElement.querySelector("img");

    playerAvatar.style.padding = "4px";
    playerAvatar.style.backgroundOrigin = "border-box";
    playerAvatar.style.backgroundClip = "padding-box, border-box";

    const updateBorderPercentage = (percentage) => {
      playerAvatar.style.backgroundImage = `conic-gradient(blue ${
        100 - percentage
      }%, gray ${100 - percentage}% 100%)`;
    };

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const percentage = (elapsedTime / timeout) * 100;
      updateBorderPercentage(percentage);

      if (elapsedTime >= timeout) {
        clearInterval(timer);
        updateBorderPercentage(100);
      }
    }, 100);

    return {
      stop: () => {
        clearInterval(timer);
        updateBorderPercentage(100);
      },
    };
  }

  /**
   * End player turn.
   * @param {string} playerId - The player ID.
   */
  endPlayerTurn(playerId) {
    const playerElement = document.getElementById(`game-player-${playerId}`);
    const playerAvatar = playerElement.querySelector("img");

    playerAvatar.style.padding = "0";
    playerAvatar.style.backgroundImage = "none";
  }

  /**
   * Show game phase.
   * @param {string} phase - The game phase.
   * @param {number} timeout - The phase timeout.
   */
  showGamePhase(phase, timeout) {
    const gamePhaseElement = document.getElementById("game-phase");
    const gamePhaseText = gamePhaseElement.querySelector("span");

    gamePhaseText.innerText = phase;
    gamePhaseElement.style.display = "block";

    gamePhaseElement.style.opacity = 1;
    gamePhaseElement.style.transition = "opacity 0.5s ease-in-out";

    clearTimeout(this.gamePhaseTimeout);
    this.gamePhaseTimeout = setTimeout(() => {
      gamePhaseElement.style.opacity = 0;
      this.gamePhaseTimeout = setTimeout(() => {
        gamePhaseElement.style.display = "none";
      }, 500);
    }, timeout);
  }
}

/**
 * Game Renderer class.
 * @module js/game/renderer
 */
class GameRenderer {
  /**
   * Create a game renderer.
   * @param {Object} map - The game map.
   * @param {HTMLElement} canvas - The canvas element.
   * @param {string} backgroundImage - The background image.
   */
  constructor(map, canvas, backgroundImage) {
    this.map = map;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenCtx = this.offscreenCanvas.getContext("2d");

    this._loadImage(backgroundImage).then((image) => {
      this.backgroundImage = image;
      this.resizeCanvas();
    });

    window.addEventListener("resize", () => this.resizeCanvas());
  }

  /**
   * Load image. (Private)
   * @param {string} src - The image source.
   * @returns {Promise} The promise object.
   */
  _loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = src;
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
    });
  }

  /**
   * Resize the canvas.
   */
  resizeCanvas() {
    this.canvas.width = Math.min(window.innerWidth, window.innerHeight);
    this.canvas.height = Math.min(window.innerWidth, window.innerHeight);
    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.offscreenCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackgroundImage();
    this.setMap();
  }

  /**
   * Draw the background image.
   */
  drawBackgroundImage() {
    this.ctx.drawImage(
      this.backgroundImage,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  /**
   * Set the game map.
   */
  setMap() {
    this.scaleX = this.canvas.width / this.map.size;
    this.scaleY = this.canvas.height / this.map.size;

    const uniqueTiles = [...new Set(this.map.tiles.map((tile) => tile.type))];
    const imagePromises = [];
    this.tileImages = {};
    uniqueTiles.forEach((tileType) => {
      imagePromises.push(
        this._loadImage(`/img/game/pieces/${tileType}.png`).then((image) => {
          this.tileImages[tileType] = image;
        })
      );

      imagePromises.push(
        this._loadImage(`/img/game/pieces/${tileType}-flipped.png`).then(
          (image) => {
            this.tileImages[`${tileType}-flipped`] = image;
          }
        )
      );
    });

    Promise.all(imagePromises).then(() => {
      this.drawMap();
    });
  }

  /**
   * Draw the game map.
   */
  drawMap() {
    this.map.tiles.forEach((tile) => {
      const image = this.tileImages[tile.type];
      const x = tile.x * this.scaleX;
      const y = tile.y * this.scaleY;
      const imageWidth = image.width;
      const imageHeight = image.height;

      let width = tile.width
        ? tile.width * this.scaleX
        : (tile.height * this.scaleY * imageWidth) / imageHeight;
      let height = tile.height
        ? tile.height * this.scaleY
        : (tile.width * this.scaleX * imageHeight) / imageWidth;

      this.offscreenCtx.save();

      this.offscreenCtx.translate(x + width / 2, y + height / 2);
      this.offscreenCtx.rotate((tile.rotation * Math.PI) / 180);

      this.offscreenCtx.drawImage(
        image,
        -width / 2,
        -height / 2,
        width,
        height
      );

      this.offscreenCtx.restore();
    });
  }

  /**
   * Draw a piece.
   * @param {number} position - The position index.
   */
  drawPiece(position) {
    const tile = this.map.tiles[position];
    const image = this.tileImages[tile.type];
    const x = tile.x * this.scaleX;
    const y = tile.y * this.scaleY;
    const imageWidth = image.width;
    const imageHeight = image.height;

    let width = tile.width
      ? tile.width * this.scaleX
      : (tile.height * this.scaleY * imageWidth) / imageHeight;
    let height = tile.height
      ? tile.height * this.scaleY
      : (tile.width * this.scaleX * imageHeight) / imageWidth;

    this.ctx.save();

    this.ctx.translate(x + width / 2, y + height / 2);
    this.ctx.rotate((tile.rotation * Math.PI) / 180);

    this.ctx.drawImage(image, -width / 2, -height / 2, width, height);

    this.ctx.restore();
  }

  /**
   * Clear pieces. (Clear the canvas and draw the background image and map again)
   */
  clearPieces() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackgroundImage();
    this.drawMap();
  }
}

/**
 * Game class.
 * @module js/game/game
 */
class Game {
  /**
   * Create a game.
   * @param {GameNetwork} network - The game network.
   * @param {GameUI} ui - The game UI.
   */
  constructor(network, ui) {
    this.network = network;
    this.ui = ui;
    this.players = [];
    this.pieces = [];

    this._init();
  }

  /**
   * Initialize the game. (Private)
   */
  _init() {
    this.network.addListenerOnce("game:players", (data) => {
      this.players = data.players;

      this.ui.showGameReady(this.players, () => {
        this.network.playerReady();
      });

      this.network.addListener("game-client:ready", (data) => {
        this.ui.playerReady(data.player);
      });
    });

    this._addNetworkListeners();
    this._initRenderer();
  }

  /**
   * Initialize the game renderer. (Private)
   */
  _initRenderer() {
    this.renderer = new GameRenderer(
      {},
      document.getElementById("game-canvas"),
      "/img/game/default-game-board.png"
    );
  }

  /**
   * Add network listeners. (Private)
   */
  _addNetworkListeners() {
    const timeRemainingListener = (data) => {
      if (data.timeRemaining === 10) {
        this.ui.showGamePhase("10 Seconds Remaining", 1000);
      } else if (data.timeRemaining === 5) {
        this.ui.showGamePhase("5 Seconds Remaining", 1000);
      } else if (data.timeRemaining === 3) {
        this.ui.showGamePhase("3 Seconds Remaining", 1000);
      } else if (data.timeRemaining === 2) {
        this.ui.showGamePhase("2 Seconds Remaining", 1000);
      } else if (data.timeRemaining === 1) {
        this.ui.showGamePhase("1 Second Remaining", 1000);
      } else if (data.timeRemaining === 0) {
        this.ui.showGamePhase("Time's Up", 1000);

        this.network.removeListener(
          "game:timeRemaining",
          timeRemainingListener
        );
      }
    };

    this.network.addListener("game:pieces", (data) => {
      this.pieces = data.players;
    });

    this.network.addListenerOnce("game:start", () => {
      this.ui.showGame(this.players);
    });

    this.network.addListener("game:round", (data) => {
      this.ui.showGamePhase(`Round ${data.round} Start`, 2000);
    });

    this.network.addListener("game:playersOrder", (data) => {
      // data: { order: [playerId1, playerId2, ...] }
    });

    this.network.addListener("game:tossStart", (data) => {
      const playerId = data.player;

      this.ui.showGamePhase("Toss Start", 2000);

      this.network.addListenerOnce("game:timeRemaining", (data) => {
        this.ui.startPlayerTurn(playerId, data.timeRemaining * 1000);

        this.network.addListener("game:timeRemaining", timeRemainingListener);
      });
    });

    this.network.addListener("game:turn", (data) => {
      const playerId = data.player;

      this.ui.showGamePhase("Turn Start", 2000);

      this.network.addListenerOnce("game:timeRemaining", (data) => {
        this.ui.startPlayerTurn(playerId, data.timeRemaining * 1000);

        this.network.addListener("game:timeRemaining", timeRemainingListener);
      });
    });

    this.network.addListener("game:turnEnd", (data) => {
      this.ui.endPlayerTurn(data.player);

      this.ui.showGamePhase("Turn End", 2000);
    });
  }
}
