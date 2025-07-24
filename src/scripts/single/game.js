/**
 * @fileoverview Game Class
 * @description Game class to handle single-player game and AI interactions.
 */

/**
 * @class AudioManager
 * @description Manages audio playback for sound effects and background music.
 */
const MAX_VOLUME = 100;
class AudioManager {
  /**
   * @constructor - Initializes the AudioManager with sound effects and background music manifests.
   * @param {Object} sfxManifest - Manifest object containing sound effect file paths.
   * @param {Object} bgmManifest - Manifest object containing background music file paths.
   */
  constructor(sfxManifest, bgmManifest) {
    this.sfxManifest = sfxManifest;
    this.bgmManifest = bgmManifest;

    this.sfxVolume = 1.0;
    this.bgmVolume = 1.0;
    this.sfx = {};
    this.bgm = [];
    this.currentBgm = null;
    this.currentBgmIndex = -1;
  }

  /**
   * @method load - Loads audio assets for the game.
   */
  async load() {
    await Promise.all([
      this._loadAssets(this.sfxManifest, this.sfx),
      this._loadAssets(this.bgmManifest, this.bgm),
    ]);

    for (let i = this.bgm.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.bgm[i], this.bgm[j]] = [this.bgm[j], this.bgm[i]];
    }
  }

  /**
   * @method _loadAssets - Loads audio assets from the manifest.
   * @param {Object} manifest - The manifest object containing audio file paths.
   * @param {Object} target - The target object to load the audio assets into.
   */
  _loadAssets(manifest, target) {
    return new Promise((resolve) => {
      for (const key in manifest) {
        const audio = new Audio(manifest[key]);
        audio.preload = 'auto';
        if (Array.isArray(target)) {
          target.push(audio);
        } else {
          target[key] = audio;
        }

        audio.addEventListener('canplaythrough', () => {
          resolve();
        });
      }
    });
  }

  /**
   * @method setVolume - Sets the volume for sound effects or background music.
   * @param {string} type - The type of audio ('sfx' or 'bgm').
   * @param {number} level - The volume level (0 to 100).
   */
  setVolume(type, level) {
    const volume = Math.max(0, Math.min(MAX_VOLUME, level)) / MAX_VOLUME;
    if (type === 'sfx') {
      this.sfxVolume = volume;
    } else if (type === 'bgm') {
      this.bgmVolume = volume;
      if (this.currentBgm) {
        this.currentBgm.volume = this.bgmVolume;
      }
    }
  }

  /**
   * @method playSfx - Plays a sound effect by name.
   * @param {string} name - The name of the sound effect to play.
   */
  playSfx(name) {
    if (this.sfx[name]) {
      const sfx = this.sfx[name].cloneNode();
      sfx.volume = this.sfxVolume;
      sfx.play().catch((e) => console.error(`SFX Error: ${e.message}`));
    }
  }

  /**
   * @method playBgm - Plays a random background music track.
   */
  playBgm() {
    if (this.bgm.length === 0) return;
    if (this.currentBgm) {
      this.currentBgm.pause();
      this.currentBgm.removeEventListener('ended', this._playNextBgm);
    }

    this.currentBgmIndex = Math.floor(Math.random() * this.bgm.length);
    this.currentBgm = this.bgm[this.currentBgmIndex];
    this.currentBgm.volume = this.bgmVolume;
    this.currentBgm.currentTime = 0;
    this.currentBgm
      .play()
      .catch((e) => console.error(`BGM Error: ${e.message}`));

    this._playNextBgm = this.playBgm.bind(this);
    this.currentBgm.addEventListener('ended', this._playNextBgm);
  }

  /**
   * @method stopBgm - Stops the currently playing background music.
   */
  stopBgm() {
    if (this.currentBgm) {
      this.currentBgm.pause();
      this.currentBgm.currentTime = 0;
    }
  }
}

/**
 * @class VibrationManager
 * @description Manages vibration feedback for user interactions.
 */
const VIBRATION_SHORT = 50;
const VIBRATION_MEDIUM = 100;
const VIBRATION_LONG = 200;
const VIBRATION_ERROR = 75;
const VIBRATION_DOUBLE = 150;
class VibrationManager {
  /**
   * @constructor - Initializes the VibrationManager.
   */
  constructor() {
    this.isSupported = 'vibrate' in navigator;
  }

  /**
   * @method vibrate - Triggers vibration with a specified pattern.
   * @param {number|Array<number>} pattern - Vibration pattern (single number or array of numbers).
   */
  vibrate(pattern) {
    if (this.isSupported) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.error('Vibration failed:', e);
      }
    }
  }

  success() {
    this.vibrate([VIBRATION_MEDIUM, VIBRATION_SHORT, VIBRATION_MEDIUM]);
  }
  error() {
    this.vibrate([
      VIBRATION_ERROR,
      VIBRATION_SHORT,
      VIBRATION_ERROR,
      VIBRATION_SHORT,
      VIBRATION_ERROR,
    ]);
  }
  impactLight() {
    this.vibrate(VIBRATION_SHORT);
  }
  impactMedium() {
    this.vibrate(VIBRATION_MEDIUM);
  }
  impactHeavy() {
    this.vibrate(VIBRATION_LONG);
  }
  doubleSuccess() {
    this.vibrate([VIBRATION_DOUBLE, VIBRATION_SHORT, VIBRATION_DOUBLE]);
  }
}

/**
 * @class UIManager
 * @description Manages all UI interactions, updates, and animations, acting as a bridge between the game logic and the DOM.
 */
const DEFAULT_INFO_MESSAGE_DURATION = 1800;
class UIManager {
  /**
   * @constructor - Initializes UIManager and caches all relevant DOM elements.
   */
  constructor() {
    this.scoreMobile = document.querySelector('[data-score-mobile]');
    this.highscoreMobile = document.querySelector('[data-highscore-mobile]');
    this.scoreDesktop = document.querySelector('[data-score-desktop]');
    this.highscoreDesktop = document.querySelector('[data-highscore-desktop]');
    this.finalScore = document.querySelector('[data-final-score]');
    this.finalHighscore = document.querySelector('[data-final-highscore]');
    this.resultTitle = document.querySelector('[data-result-title]');
    this.scoreDetails = document.querySelector('[data-score-details]');

    this.aiPiecesContainer = document.getElementById('ai-pieces-container');
    this.playerPiecesContainer = document.getElementById(
      'player-pieces-container',
    );

    this.tradeModalPerform = document.getElementById('trade-modal-perform');
    this.tradeModalBeing = document.getElementById('trade-modal-being');
    this.minimizedTradePerform = document.getElementById(
      'minimized-trade-perform',
    );
    this.gameInfoMessage = document.getElementById('game-info-message');
    this.gameOverModal = document.getElementById('game-over-modal');

    this.pieceTemplate = document.getElementById('piece-template');

    this.boardContainer = document.getElementById('board-container');
  }

  /**
   * @method setScore - Sets the current score value (with optional animation).
   * @param {number} value - The new score value.
   * @param {Object} [options] - Animation options.
   */
  setScore(value, options = {}) {
    this._animateNumber(this.scoreMobile, value, options);
    this._animateNumber(this.scoreDesktop, value, options);
    this._animateNumber(this.finalScore, value, options);
  }

  /**
   * @method setHighScore - Sets the high score value (with optional animation).
   * @param {number} value - The new high score value.
   * @param {Object} [options] - Animation options.
   */
  setHighScore(value, options = {}) {
    this._animateNumber(this.highscoreMobile, value, options);
    this._animateNumber(this.highscoreDesktop, value, options);
    this._animateNumber(this.finalHighscore, value, options);
  }

  /**
   * @method showInfoMessage - Shows a large info message with animation.
   * @param {string} text - The message text to display.
   * @param {string} [animation] - Animation type: 'fade', 'slide', 'scale', 'confetti', etc.
   * @param {number} [duration=1800] - How long to show (ms)
   */
  showInfoMessage(
    text,
    animation = 'fade',
    duration = DEFAULT_INFO_MESSAGE_DURATION,
  ) {
    if (!this.gameInfoMessage) return;
    const p = this.gameInfoMessage.querySelector('p');
    p.textContent = text;
    this.gameInfoMessage.classList.remove('hidden');
    this._animateElement(this.gameInfoMessage, animation);
    setTimeout(() => {
      this.gameInfoMessage.classList.add('hidden');
      p.textContent = '';
    }, duration);
  }

  /**
   * @method toggleTradeModalPerform - Shows or hides the trade modal (perform).
   * @param {boolean} show - Whether to show or hide the modal.
   */
  toggleTradeModalPerform(show) {
    if (!this.tradeModalPerform) return;
    this.tradeModalPerform.classList.toggle('hidden', !show);
  }

  /**
   * @method toggleTradeModalBeing - Shows or hides the trade modal (being traded).
   * @param {boolean} show - Whether to show or hide the modal.
   */
  toggleTradeModalBeing(show) {
    if (!this.tradeModalBeing) return;
    this.tradeModalBeing.classList.toggle('hidden', !show);
  }

  /**
   * @method toggleMinimizedTradePerform - Shows or hides the minimized trade perform modal.
   * @param {boolean} show - Whether to show or hide the modal.
   */
  toggleMinimizedTradePerform(show) {
    if (!this.minimizedTradePerform) return;
    this.minimizedTradePerform.classList.toggle('hidden', !show);
  }

  /**
   * @method toggleGameOverModal - Shows or hides the game over modal, and sets result info.
   * @param {boolean} show - Whether to show or hide the modal.
   * @param {Object} [result] - { title, score, highscore, details }
   */
  toggleGameOverModal(show, result = {}) {
    if (!this.gameOverModal) return;
    this.gameOverModal.classList.toggle('hidden', !show);
    const modalContent = this.gameOverModal.querySelector('div');
    if (show) {
      if (modalContent) {
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
        modalContent.style.transition = 'opacity 0.3s, transform 0.3s';
      }
      if (this.resultTitle) {
        this.resultTitle.textContent = result.title || '';
        if (
          result.type === 'fail' ||
          /fail|lose|lost|defeat/i.test(result.title)
        ) {
          this.resultTitle.classList.remove('text-amber-300');
          this.resultTitle.classList.add('text-red-400');
        } else {
          this.resultTitle.classList.remove('text-red-400');
          this.resultTitle.classList.add('text-amber-300');
        }
      }
      if (this.finalScore) {
        this.finalScore.textContent = result.score || 0;
        if (
          result.type === 'fail' ||
          /fail|lose|lost|defeat/i.test(result.title)
        ) {
          this.finalScore.classList.remove('text-white');
          this.finalScore.classList.add('text-red-400');
        } else {
          this.finalScore.classList.remove('text-red-400');
          this.finalScore.classList.add('text-white');
        }
      }
      if (this.finalHighscore) {
        this.finalHighscore.textContent = result.highscore || 0;
        if (
          result.type === 'fail' ||
          /fail|lose|lost|defeat/i.test(result.title)
        ) {
          this.finalHighscore.classList.remove('text-white');
          this.finalHighscore.classList.add('text-red-400');
        } else {
          this.finalHighscore.classList.remove('text-red-400');
          this.finalHighscore.classList.add('text-white');
        }
      }
      if (this.scoreDetails) this._renderScoreDetails(result.details || []);
    } else {
      if (modalContent) {
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'scale(0.95)';
      }
    }
  }

  /**
   * @method updateBackgroundImage - Updates the background image of the page.
   * @param {string} imageUrl - The URL of the new background image.
   */
  updateBackgroundImage(imageUrl) {
    document.body.style.backgroundImage = `url(${imageUrl})`;
  }

  /**
   * @method getBoardContainer - Returns the board container element.
   * @returns {Element} - The board container element.
   */
  getBoardContainer() {
    return this.boardContainer;
  }

  /**
   * @method _renderScoreDetails - Renders detailed score breakdown in the game over modal.
   * @param {Array<{ label: string, value: string, highlight?: boolean }>} details - The score details to render.
   */
  _renderScoreDetails(details) {
    if (!this.scoreDetails) return;
    this.scoreDetails.innerHTML = '';
    details.forEach((row) => {
      const div = document.createElement('div');
      div.className = 'flex justify-between items-baseline';
      div.innerHTML = `<span class="${row.highlight ? 'text-amber-300' : 'text-white/80'}">${row.label}</span><span class="font-semibold text-white">${row.value}</span>`;
      this.scoreDetails.appendChild(div);
    });
  }

  /**
   * @method _animateNumber - Animates a number change in an element (count up effect).
   * @param {Element} el - The element to animate.
   * @param {number} value - The new value to animate to.
   * @param {Object} [options] - Animation options.
   */
  _animateNumber(el, value, options = {}) {
    if (!el) return;
    const DEFAULT_DURATION = 600;
    const duration = options.duration || DEFAULT_DURATION;
    const start = parseInt(el.textContent.replace(/,/g, '')) || 0;
    const end = value;
    const startTime = performance.now();
    const format = (v) => v.toLocaleString();
    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(start + (end - start) * progress);
      el.textContent = format(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        el.textContent = format(end);
      }
    }
    requestAnimationFrame(animate);
  }

  /**
   * @method _animateElement - Applies a CSS animation class to an element.
   * @param {Element} el - The element to animate.
   * @param {string} type - The type of animation ('fade', 'slide', 'scale', 'confetti').
   */
  _animateElement(el, type) {
    if (!el) return;
    el.classList.remove('fade', 'slide', 'scale', 'confetti');
    el.classList.add(type);
    if (type === 'confetti' && window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    const ANIMATION_DURATION = 900;
    setTimeout(() => {
      el.classList.remove(type);
    }, ANIMATION_DURATION);
  }
}

/**
 * @class Player
 * @description Represents a player in the game, managing their pieces and score.
 */
class Player {
  constructor(name) {
    this.name = name;
    this.scores = new Map();
    this.pieces = new Map();
    this.totalScore = 0;
  }

  /**
   * @method addPiece - Adds a piece to the player's collection.
   * @param {string} color - The color-key of the piece.
   * @param {Object} piece - The piece object to add.
   */
  addPiece(color, piece) {
    if (!this.pieces.has(color)) {
      this.pieces.set(color, []);
    }
    this.pieces.get(color).push(piece);
  }

  /**
   * @method popPiece - Removes and returns a piece from the player's collection.
   * @param {string} color - The color-key of the piece to remove.
   * @returns {Object | null} - The removed piece or null if not found.
   */
  popPiece(color) {
    if (this.pieces.has(color) && this.pieces.get(color).length > 0) {
      return this.pieces.get(color).pop();
    }
    return null;
  }

  /**
   * @method addScore - Adds a score entry for the player.
   * @param {string} key - The score key.
   * @param {number} value - The score value.
   */
  addScore(key, value) {
    if (this.scores.has(key)) {
      this.scores.set(key, this.scores.get(key) + value);
    } else {
      this.scores.set(key, value);
    }
    this.totalScore += value;
  }
}

/**
 * @class Agent
 * @description Represents an AI agent or player in the game.
 */
class Agent {
  /**
   * @constructor - Initializes the Agent with a player instance.
   * @param {Player} player - The player instance associated with this agent.
   */
  constructor(player) {
    this.player = player;
  }

  /**
   * @method tossPiece - Triggers a toss action for the agent.
   * @returns {Promise<void>} - Resolves when the toss action is complete.
   */
  async tossPiece() {
    return await this._performAction('toss');
  }

  /**
   * @method placePiece - Places a piece on the board.
   * @param {Array<number>} availablePositions - The available positions to place the piece.
   * @param {Array<Array<Object>>} availablePieces - The available pieces to choose from.
   * @returns {Promise<Object>} - Resolves with the placed piece object. ({ position, piece })
   */
  async placePiece(availablePositions, availablePieces) {
    return await this._performAction(
      'place',
      availablePositions,
      availablePieces,
    );
  }

  /**
   * @method forceTrade - Forces a trade action with the player.
   * @param {Array<Object>} yourPieces - The pieces the agent is offering.
   * @param {Array<Object>} opponentPieces - The pieces the opponent is offering.
   * @returns {Promise<Object>} - Resolves with the trade result object. ({ accepted, yourPieceColor, opponentPieceColor })
   */
  async forceTrade(yourPieces, opponentPieces) {
    return await this._performAction('trade', { yourPieces, opponentPieces });
  }

  /**
   * @method _performAction - Simulates an action performed by the agent.
   * @param {string} action - The action type ('toss', 'place', 'trade').
   * @param {...any} args - Additional arguments for the action.
   * @returns {Promise<any>} - Resolves with the result of the action.
   * @throws {Error} - Throws an error if the action is not implemented.
   */
  async _performAction(action, ...args) {
    throw new Error(`Action ${action} not implemented for Agent class`);
  }
}

/**
 * @class PlayerAgent
 * @description Represents a player agent in the game, extending the Agent class.
 */
class PlayerAgent extends Agent {
  /**
   * @method _performAction - Performs a player-specific action.
   * @param {string} action - The action type ('toss', 'place', 'trade').
   * @param {...any} args - Additional arguments for the action.
   * @returns {Promise<any>} - Resolves with the result of the action.
   */
  async _performAction(action, ...args) {
    switch (action) {
      case 'toss':
        this.handleToss();
        break;
      case 'place':
        this.handlePlace(args[0], args[1]);
        break;
      case 'trade':
        this.handleTrade(args[0], args[1]);
        break;
      default:
        throw new Error(
          `Action ${action} not implemented for PlayerAgent class`,
        );
    }
  }

  // TODO: Implement player-specific action handlers
}

/**
 * @class AIPlayerAgent
 * @description Represents an AI player agent in the game, extending the Agent class.
 */
class AIPlayerAgent extends Agent {
  /**
   * @constructor - Initializes the AIPlayerAgent with a player instance.
   * @param {Player} player - The player instance associated with this AI agent.
   * @param {Object} aiConfig - Configuration options for the AI agent.
   */
  constructor(player, aiConfig = {}) {
    super(player);
    this.config = aiConfig;
  }

  /**
   * @method _performAction - Performs an AI-specific action.
   * @param {string} action - The action type ('toss', 'place', 'trade').
   * @param {...any} args - Additional arguments for the action.
   * @returns {Promise<any>} - Resolves with the result of the action.
   */
  async _performAction(action, ...args) {
    switch (action) {
      case 'toss':
        return this.handleToss();
      case 'place':
        return this.handlePlace(args[0], args[1]);
      case 'trade':
        return this.handleTrade(args[0], args[1]);
      default:
        throw new Error(
          `Action ${action} not implemented for AIPlayerAgent class`,
        );
    }
  }

  // TODO: Implement AI-specific action handlers
}
