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
    this.sfxVolume = 1.0;
    this.bgmVolume = 1.0;
    this.sfx = {};
    this.bgm = [];
    this.currentBgm = null;
    this.currentBgmIndex = -1;

    this._loadAssets(sfxManifest, this.sfx);
    this._loadAssets(bgmManifest, this.bgm);
  }

  /**
   * @method _loadAssets - Loads audio assets from the manifest.
   * @param {Object} manifest - The manifest object containing audio file paths.
   * @param {Object} target - The target object to load the audio assets into.
   */
  _loadAssets(manifest, target) {
    for (const key in manifest) {
      const audio = new Audio(manifest[key]);
      audio.preload = 'auto';
      if (Array.isArray(target)) {
        target.push(audio);
      } else {
        target[key] = audio;
      }
    }
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
const DEFAULT_MESSAGE_DURATION = 2000;
class UIManager {
  /**
   * @constructor
   * @param {Object} callbacks - An object containing callback functions for user interactions.
   * @param {function} callbacks.onPlayAgain - Called when the "Play Again" button is clicked.
   * @param {function} callbacks.onPieceClick - Called when a player's piece is clicked, passing the piece's data.
   */
  constructor(callbacks) {
    this.elements = {};
    this.callbacks = callbacks;

    this._cacheDOMElements();
    this._setupEventListeners();
  }

  /**
   * @method _cacheDOMElements - Finds and stores references to all necessary DOM elements for performance.
   */
  _cacheDOMElements() {
    this.elements.aiPiecesContainer = document.getElementById(
      'ai-pieces-container',
    );
    this.elements.playerPiecesContainer = document.getElementById(
      'player-pieces-container',
    );
    this.elements.pieceTemplate = document.getElementById('piece-template');

    this.elements.scoreDesktop = document.querySelector('[data-score-desktop]');
    this.elements.scoreMobile = document.querySelector('[data-score-mobile]');
    this.elements.highscoreDesktop = document.querySelector(
      '[data-highscore-desktop]',
    );
    this.elements.highscoreMobile = document.querySelector(
      '[data-highscore-mobile]',
    );

    this.elements.tradeModal = document.getElementById('trade-modal-perform');
    this.elements.beingTradedModal =
      document.getElementById('trade-modal-being');
    this.elements.gameOverModal = document.getElementById('game-over-modal');

    this.elements.gameOverModalContent =
      this.elements.gameOverModal.querySelector('div');
    this.elements.resultTitle = document.querySelector('[data-result-title]');
    this.elements.finalScore = document.querySelector('[data-final-score]');
    this.elements.finalHighscore = document.querySelector(
      '[data-final-highscore]',
    );
    this.elements.scoreDetailsContainer = document.querySelector(
      '[data-score-details]',
    );

    this.elements.playAgainBtn = document.getElementById('play-again-btn');

    this.elements.infoMessage = document.getElementById('game-info-message');
  }

  /**
   * @method _setupEventListeners - Binds all necessary event listeners to the DOM elements.
   */
  _setupEventListeners() {
    this.elements.playAgainBtn.addEventListener('click', () =>
      this.callbacks.onPlayAgain(),
    );

    this.elements.playerPiecesContainer.addEventListener('click', (event) => {
      const pieceElement = event.target.closest('.game-piece-unit');
      if (pieceElement && this.callbacks.onPieceClick) {
        const pieceId = pieceElement.dataset.id;
        this.callbacks.onPieceClick(pieceId);
      }
    });
  }

  /**
   * @method _createPieceElement - Creates a DOM element for a game piece.
   * @param {Object} piece - The piece data object (e.g., { id: 'p1', value: 10 }).
   * @param {boolean} isPlayer - If true, applies player-specific styling.
   * @returns {HTMLElement} The created piece element.
   */
  _createPieceElement(piece, isPlayer) {
    const pieceElement =
      this.elements.pieceTemplate.content.firstElementChild.cloneNode(true);
    pieceElement.dataset.id = piece.id;

    const bgGradient = isPlayer
      ? 'from-teal-800/30 to-blue-800/30'
      : 'from-indigo-800/30 to-purple-800/30';
    pieceElement.classList.add(...bgGradient.split(' '));

    pieceElement.querySelector('.piece-value').textContent = piece.value;

    // TODO: The `canvas` element is ready. The game logic can now draw on it.

    return pieceElement;
  }

  /**
   * @method renderPieces - Renders an array of game pieces into the specified container.
   * @param {HTMLElement} container - The container element (e.g., aiPiecesContainer).
   * @param {Array<Object>} pieces - An array of piece data objects.
   * @param {boolean} isPlayer - Flag to determine styling.
   */
  renderPieces(container, pieces, isPlayer) {
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    pieces.forEach((piece) => {
      fragment.appendChild(this._createPieceElement(piece, isPlayer));
    });
    container.appendChild(fragment);
  }

  /**
   * @method updateScores - Updates the displayed scores in the UI.
   * @param {number} score - The new current score.
   * @param {number} highScore - The new high score.
   */
  updateScores(score, highScore) {
    const formattedScore = score.toLocaleString();
    const formattedHighScore = highScore.toLocaleString();

    this.elements.scoreDesktop.textContent = formattedScore;
    this.elements.scoreMobile.textContent = formattedScore;
    this.elements.highscoreDesktop.textContent = formattedHighScore;
    this.elements.highscoreMobile.textContent = formattedHighScore;
  }

  /**
   * @method showTradeModal - Displays the trade modal with the specified piece details.
   * @param {string} message - The text to display.
   * @param {number} [duration=2000] - How long to display the message in ms. Auto-hides if > 0.
   */
  showInfoMessage(message, duration = DEFAULT_MESSAGE_DURATION) {
    this.elements.infoMessage.querySelector('p').textContent = message;
    this.elements.infoMessage.classList.remove('hidden');

    if (duration > 0) {
      setTimeout(() => {
        this.elements.infoMessage.classList.add('hidden');
      }, duration);
    }
  }

  /**
   * @method showTradeModal - Displays the trade modal with the specified piece details.
   * @param {boolean} isWin - Determines the title and color.
   * @param {Object} scores - Contains final score and high score.
   * @param {Array<Object>} scoreDetails - An array of objects for the details table, e.g., [{label: 'Time Bonus', value: '+210'}].
   */
  showGameOverModal(isWin, scores, scoreDetails) {
    this.elements.resultTitle.textContent = isWin ? 'You Won!' : 'You Lost!';
    this.elements.resultTitle.classList.toggle('text-amber-300', isWin);
    this.elements.resultTitle.classList.toggle('text-red-500', !isWin);

    this.elements.finalScore.textContent = scores.score.toLocaleString();
    this.elements.finalHighscore.textContent =
      scores.highScore.toLocaleString();

    this.elements.scoreDetailsContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();

    const headerRow = document.createElement('div');
    headerRow.className =
      'flex justify-between items-baseline text-xs uppercase text-white/50 tracking-wider';
    headerRow.innerHTML = '<span>Item</span><span>Your Score</span>';
    fragment.appendChild(headerRow);

    scoreDetails.forEach((detail) => {
      const detailRow = document.createElement('div');
      detailRow.className = 'flex justify-between items-baseline';
      detailRow.innerHTML = `
        <span class="text-white/80">${detail.label}</span>
        <span class="font-semibold text-white">${detail.value}</span>
      `;
      fragment.appendChild(detailRow);
    });
    this.elements.scoreDetailsContainer.appendChild(fragment);

    this.elements.gameOverModal.classList.remove('hidden');
    const ANIMATION_DURATION = 10;
    setTimeout(() => {
      this.elements.gameOverModalContent.classList.remove(
        'opacity-0',
        'scale-95',
      );
      this.elements.gameOverModalContent.classList.add(
        'opacity-100',
        'scale-100',
      );
    }, ANIMATION_DURATION);
  }
}
