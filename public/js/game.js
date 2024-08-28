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
   * @param {string} userId - The user ID.
   * @param {string} sessionId - The session ID.
   * @returns {Promise} The promise object.
   */
  authenticate(userId, sessionId) {
    this.userId = userId;
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
   * Toss the piece.
   */
  tossPiece() {
    this.socket.emit("game-client:toss", {});
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

  /**
   * Show the toss button.
   * @param {Function} clickHandler - The click handler.
   */
  showTossButton(clickHandler) {
    const tossButton = document.getElementById("game-toss");
    tossButton.style.display = "block";

    tossButton.addEventListener("click", clickHandler);
  }

  /**
   * Hide the toss button.
   */
  hideTossButton() {
    const tossButton = document.getElementById("game-toss");
    tossButton.style.display = "none";
  }

  /**
   * Initialize the trade.
   * @param {Object[]} players - The players in the game.
   * @param {string} currentPlayerId - The current player ID.
   */
  initTrade(players, currentPlayerId) {
    this.currentPlayerId = currentPlayerId;

    const gameTradePlayers = document.getElementById("game-trade-players");

    for (const player of players) {
      player.avatar = player.avatar || "/img/default-avatar.png";

      const playerElement = document.createElement("div");
      playerElement.id = `game-trade-player-${player.id}`;
      playerElement.classList.add(
        "flex",
        "flex-col",
        "space-y-2",
        "border-b",
        "pb-4"
      );
      playerElement.innerHTML = `
            <div class="flex items-center space-x-4">
                <img src="${player.avatar}" alt="${player.name}" class="w-12 h-12 object-cover rounded-full">
                <div>
                    <p class="font-semibold">${player.name}</p>
                </div>
            </div>
            <div id="game-trade-pieces-${player.id}" class="flex space-x-2"></div>
          `;
      if (player.id === this.currentPlayerId) {
        const currentPlayerTitle = document.createElement("p");
        currentPlayerTitle.innerText = "Your Pieces";
        currentPlayerTitle.classList.add("text-lg", "font-semibold", "mt-4");

        const currentPlayerDescription = document.createElement("p");
        currentPlayerDescription.innerText =
          "Select a piece to trade with another player.";
        currentPlayerDescription.classList.add("text-sm", "text-gray-500");

        const hrElement = document.createElement("hr");
        hrElement.classList.add("my-4");

        const otherPlayerTitle = document.createElement("p");
        otherPlayerTitle.innerText = "Other Players Pieces";
        otherPlayerTitle.classList.add("text-lg", "font-semibold", "mt-4");

        const otherPlayerDescription = document.createElement("p");
        otherPlayerDescription.innerText = "Select a piece to trade with you.";
        otherPlayerDescription.classList.add("text-sm", "text-gray-500");

        gameTradePlayers.insertBefore(
          otherPlayerDescription,
          gameTradePlayers.firstChild
        );
        gameTradePlayers.insertBefore(
          otherPlayerTitle,
          gameTradePlayers.firstChild
        );
        gameTradePlayers.insertBefore(hrElement, gameTradePlayers.firstChild);
        gameTradePlayers.insertBefore(
          playerElement,
          gameTradePlayers.firstChild
        );
        gameTradePlayers.insertBefore(
          currentPlayerDescription,
          gameTradePlayers.firstChild
        );
        gameTradePlayers.insertBefore(
          currentPlayerTitle,
          gameTradePlayers.firstChild
        );
      } else {
        gameTradePlayers.appendChild(playerElement);
      }
    }
  }

  /**
   * Show the trade.
   * @param {Object[]} pieces - The pieces of the players.
   * @param {Function} tradeHandler - The trade handler.
   */
  showTrade(pieces, tradeHandler) {
    const tradeButton = document.getElementById("game-trade-button");
    const gameTrade = document.getElementById("game-trade");
    const tradeCloseButton = document.getElementById("game-trade-close");
    const tradeConfirmButton = document.getElementById("game-trade-confirm");

    this.playersId = [];

    for (const player of pieces) {
      const playerPiecesElement = document.getElementById(
        `game-trade-pieces-${player.id}`
      );
      playerPiecesElement.innerHTML = "";

      this.playersId.push(player.id);

      for (
        let pieceIndex = 0;
        pieceIndex < player.pieces.length;
        pieceIndex++
      ) {
        const piece = player.pieces[pieceIndex];
        const pieceElement = document.createElement("img");
        pieceElement.src = `/img/game/pieces/${piece.a.color}-${piece.h.color}.png`;
        pieceElement.alt = `${piece.a.color}-${piece.h.color}`;
        pieceElement.classList.add("w-8", "object-cover");

        pieceElement.addEventListener("click", () => {
          pieceElement.style.filter =
            "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))";
        });
        if (player.id === this.currentPlayerId) {
          pieceElement.addEventListener("click", () => {
            if (this.selectedPieceElement) {
              this.selectedPieceElement.style.filter = "none";
            }

            this.selectedPieceElement = pieceElement;
            this.selectedPiece = { player: player.id, pieceIndex };
          });
        } else {
          pieceElement.addEventListener("click", () => {
            if (this.selectedOtherPlayerPieceElement) {
              this.selectedOtherPlayerPieceElement.style.filter = "none";
            }

            this.selectedOtherPlayerPieceElement = pieceElement;
            this.selectedOtherPlayerPiece = { player: player.id, pieceIndex };
          });
        }

        playerPiecesElement.appendChild(pieceElement);
      }
    }

    tradeButton.style.display = "block";

    tradeButton.onclick = () => {
      gameTrade.style.display = "flex";
    };
    tradeCloseButton.onclick = () => {
      gameTrade.style.display = "none";
    };

    tradeConfirmButton.onclick = () => {
      if (!this.selectedPiece || !this.selectedOtherPlayerPiece) {
        return;
      }

      tradeHandler(this.selectedPiece, this.selectedOtherPlayerPiece);
    };
  }

  /**
   * Hide the trade.
   */
  hideTrade() {
    if (!this.playersId) {
      return;
    }

    const tradeButton = document.getElementById("game-trade-button");
    const gameTrade = document.getElementById("game-trade");

    for (const playerId of this.playersId) {
      const playerPiecesElement = document.getElementById(
        `game-trade-pieces-${playerId}`
      );
      playerPiecesElement.innerHTML = "";
    }

    this.selectedPieceElement = null;
    this.selectedOtherPlayerPieceElement = null;
    this.selectedPiece = null;

    tradeButton.style.display = "none";
    gameTrade.style.display = "none";
  }

  /**
   * Show the trade request.
   * @param {Object} player - The requesting player.
   * @param {string} requestedPiece - The requested piece.
   * @param {string} offeredPiece - The offered piece.
   * @param {Function} acceptHandler - The accept handler.
   * @param {Function} rejectHandler - The reject handler.
   */
  showTradeRequest(
    player,
    requestedPiece,
    offeredPiece,
    acceptHandler,
    rejectHandler
  ) {
    const tradeRequest = document.getElementById("game-trade-request");
    const tradeRequestPlayerAvatar = document.getElementById(
      "game-trade-request-avatar"
    );
    const tradeRequestPlayerName = document.getElementById(
      "game-trade-request-name"
    );
    const tradeRequestRequestedPiece = document.getElementById(
      "game-trade-request-requested-piece"
    );
    const tradeRequestOfferedPiece = document.getElementById(
      "game-trade-request-offered-piece"
    );
    const tradeRequestAccept = document.getElementById("game-trade-accept");
    const tradeRequestReject = document.getElementById("game-trade-reject");

    player.avatar = player.avatar || "/img/default-avatar.png";

    tradeRequestPlayerAvatar.src = player.avatar;
    tradeRequestPlayerName.innerText = player.name;
    tradeRequestRequestedPiece.src = `/img/game/pieces/${requestedPiece.a.color}-${requestedPiece.h.color}.png`;
    tradeRequestRequestedPiece.alt = `${requestedPiece.a.color}-${requestedPiece.h.color}`;
    tradeRequestOfferedPiece.src = `/img/game/pieces/${offeredPiece.a.color}-${offeredPiece.h.color}.png`;
    tradeRequestOfferedPiece.alt = `${offeredPiece.a.color}-${offeredPiece.h.color}`;

    tradeRequestAccept.onclick = acceptHandler;
    tradeRequestReject.onclick = rejectHandler;

    tradeRequest.style.display = "block";
  }

  /**
   * Hide the trade request.
   */
  hideTradeRequest() {
    const tradeRequest = document.getElementById("game-trade-request");
    tradeRequest.style.display = "none";
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

    this.backgroundImage = null;
    this.tileImages = {};
    this.clickHandlers = [];

    this.pieces = [];

    this._loadImage(backgroundImage).then((image) => {
      this.backgroundImage = image;

      this._loadTileImages().then(() => {
        let resizeTimeout;
        window.addEventListener("resize", () => {
          if (resizeTimeout) {
            cancelAnimationFrame(resizeTimeout);
          }
          resizeTimeout = requestAnimationFrame(() => this.resizeCanvas());
        });
        this.canvas.addEventListener("click", (event) =>
          this._handleClick(event)
        );

        this.resizeCanvas();
      });
    });
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
   * Load tile images. (Private)
   * @returns {Promise} The promise object.
   */
  _loadTileImages() {
    const imagePromises = [];

    imagePromises.push(
      this._loadImage("/img/game/pieces/black.png").then((image) => {
        this.tileImages.black = image;
      })
    );
    imagePromises.push(
      this._loadImage("/img/game/pieces/black-flipped.png").then((image) => {
        this.tileImages["black-flipped"] = image;
      })
    );
    this.map.tileImages.forEach((tileImage) => {
      imagePromises.push(
        this._loadImage(`/img/game/pieces/${tileImage}.png`).then((image) => {
          this.tileImages[tileImage] = image;
        })
      );
      imagePromises.push(
        this._loadImage(`/img/game/pieces/${tileImage}-flipped.png`).then(
          (image) => {
            this.tileImages[`${tileImage}-flipped`] = image;
          }
        )
      );
    });

    return Promise.all(imagePromises);
  }

  /**
   * Handle click event. (Private)
   * @param {Event} event - The click event.
   * @returns {number} The clicked piece index.
   */
  _handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const testingCanvas = document.createElement("canvas");
    testingCanvas.width = this.canvas.width;
    testingCanvas.height = this.canvas.height;
    const testingCtx = testingCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    this.map.tiles.forEach((tile, index) => {
      const tileImage = tile.flipped
        ? this.tileImages["black-flipped"]
        : this.tileImages.black;

      const tileX = tile.x * this.scaleX;
      const tileY = tile.y * this.scaleY;

      const width = tile.width
        ? tile.width * this.scaleX
        : (tile.height * this.scaleY * tileImage.width) / tileImage.height;
      const height = tile.height
        ? tile.height * this.scaleY
        : (tile.width * this.scaleX * tileImage.height) / tileImage.width;

      testingCtx.save();

      testingCtx.translate(tileX + width / 2, tileY + height / 2);
      testingCtx.rotate((tile.rotation * Math.PI) / 180);

      testingCtx.drawImage(tileImage, -width / 2, -height / 2, width, height);

      testingCtx.restore();

      const imageData = testingCtx.getImageData(x, y, 1, 1).data;

      if (imageData[3] > 0) {
        this.clickHandlers.forEach((handler) => handler(index));
      }

      testingCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    });
  }

  /**
   * Restore the pieces. (Private)
   */
  _restorePieces() {
    this.pieces.forEach((piece) => {
      this.drawPiece(piece.position, piece.type);
    });
  }

  /**
   * Resize the canvas.
   */
  resizeCanvas() {
    this.canvas.width = Math.min(window.innerWidth, window.innerHeight);
    this.canvas.height = Math.min(window.innerWidth, window.innerHeight);

    this.scaleX = this.canvas.width / this.map.size;
    this.scaleY = this.canvas.height / this.map.size;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackgroundImage();
    this._restorePieces();
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
   * Draw a piece.
   * @param {number} position - The position index.
   * @param {string} type - The piece type. (tile image name, not including the flipped extension)
   */
  drawPiece(position, type) {
    const tile = this.map.tiles[position];
    const image = this.tileImages[tile.flipped ? `${type}-flipped` : type];
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

    this.pieces.push({ position, type });
  }

  /**
   * Clear pieces. (Clear the canvas and draw the background image and map again)
   */
  clearPieces() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackgroundImage();

    this.pieces = [];
  }

  /**
   * Show available positions.
   * @param {number[]} positions - The available positions.
   */
  showAvailablePositions(positions) {
    const coverCanvas = document.createElement("canvas");
    const coverCtx = coverCanvas.getContext("2d");

    coverCanvas.width = this.canvas.width;
    coverCanvas.height = this.canvas.height;

    coverCtx.fillStyle = "rgba(0, 0, 0, 0.3)";
    coverCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    coverCtx.globalCompositeOperation = "destination-out";

    positions.forEach((position) => {
      const tile = this.map.tiles[position];
      const image = this.tileImages[tile.flipped ? "black-flipped" : "black"];
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

      coverCtx.save();

      coverCtx.translate(x + width / 2, y + height / 2);
      coverCtx.rotate((tile.rotation * Math.PI) / 180);

      coverCtx.drawImage(image, -width / 2, -height / 2, width, height);

      coverCtx.restore();
    });

    this.ctx.drawImage(coverCanvas, 0, 0);
  }

  /**
   * Hide available positions.
   */
  hideAvailablePositions() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackgroundImage();
    this._restorePieces();
  }

  /**
   * Add click listener.
   * @param {Function} handler - The click handler.
   */
  addClickListener(handler) {
    this.clickHandlers.push(handler);
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
  async _initRenderer() {
    const response = await fetch("/maps/default.json");
    const data = await response.json();
    this.renderer = new GameRenderer(
      data,
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
      this.ui.initTrade(this.players, this.network.userId);
    });

    this.network.addListener("game:round", (data) => {
      this.ui.showGamePhase(`Round ${data.round} Start`, 2000);
    });

    this.network.addListener("game:playersOrder", (data) => {
      // data: { order: [playerId1, playerId2, ...] }
    });

    this.network.addListener("game:tossStart", (data) => {
      const playerId = data.player;

      if (playerId === this.network.userId) {
        this.ui.showTossButton(() => {
          this.network.tossPiece();
          this.ui.hideTossButton();
        });
      }

      this.ui.showGamePhase("Toss Start", 2000);

      this.network.addListenerOnce("game:timeRemaining", (data) => {
        this.ui.startPlayerTurn(playerId, data.timeRemaining * 1000);

        this.network.addListener("game:timeRemaining", timeRemainingListener);
      });
    });

    this.network.addListener("game:toss", (data) => {
      const playerId = data.player;
      const pieceIndex = data.pieceIndex;
      const position = data.position;

      const playerPieces = this.pieces.find((player) => player.id === playerId);
      const piece = playerPieces.pieces[pieceIndex];
      const pieceType = `${piece.a.color}-${piece.h.color}`;

      this.renderer.drawPiece(position, pieceType);
    });

    this.network.addListener("game:turn", (data) => {
      const type = data.type;
      const playerId = data.player;
      const availablePositions = data.availablePositions;

      if (playerId === this.network.userId) {
        if (type === "normal") {
          this.ui.showTrade(this.pieces, (selectedPiece) => {
            this.renderer.hideAvailablePositions();
            this.ui.hideTrade();
          });

          this.renderer.showAvailablePositions(availablePositions);
        }
      }

      this.ui.showGamePhase("Turn Start", 2000);

      this.network.addListenerOnce("game:timeRemaining", (data) => {
        this.ui.startPlayerTurn(playerId, data.timeRemaining * 1000);

        this.network.addListener("game:timeRemaining", timeRemainingListener);
      });
    });

    this.network.addListener("game:turnEnd", (data) => {
      this.ui.endPlayerTurn(data.player);
      this.ui.hideTossButton();
      this.ui.hideTrade();
      this.renderer.hideAvailablePositions();

      this.ui.showGamePhase("Turn End", 2000);
    });
  }
}
