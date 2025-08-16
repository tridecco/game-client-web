/**
 * @fileoverview Tridecco Single-Player Game
 * @description Implements the full game loop, agents, and managers with fixes for pointer events, rendering, and game flow.
 */

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class AudioManager {
  constructor(sfxManifest, bgmManifest) {
    this.sfxManifest = sfxManifest;
    this.bgmManifest = bgmManifest;
    this.sfxVolume = 1.0;
    this.bgmVolume = 1.0;
    this.sfx = {};
    this.bgm = [];
    this.currentBgm = null;
  }

  async load() {
    const sfxPromises = Object.entries(this.sfxManifest).map(([key, src]) =>
      this._loadAudio(src).then((audio) => {
        this.sfx[key] = audio;
      }),
    );
    const bgmPromises = Object.values(this.bgmManifest).map((src) =>
      this._loadAudio(src).then((audio) => {
        this.bgm.push(audio);
      }),
    );
    await Promise.all([...sfxPromises, ...bgmPromises]);

    const SHUFFLE_RANDOM_OFFSET = 0.5;
    this.bgm = this.bgm.sort(() => Math.random() - SHUFFLE_RANDOM_OFFSET); // Shuffle BGM tracks
  }

  _loadAudio(src) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.addEventListener('canplaythrough', () => resolve(audio));
      audio.addEventListener('error', (e) =>
        reject(`Failed to load audio: ${src}`, e),
      );
    });
  }

  setVolume(type, level) {
    const MAX_VOLUME = 100;
    const volume = Math.max(0, Math.min(MAX_VOLUME, level)) / MAX_VOLUME;
    if (type === 'sfx') this.sfxVolume = volume;
    else if (type === 'bgm') {
      this.bgmVolume = volume;
      if (this.currentBgm) this.currentBgm.volume = this.bgmVolume;
    }
  }

  playSfx(name) {
    if (this.sfx[name]) {
      const sfx = this.sfx[name].cloneNode();
      sfx.volume = this.sfxVolume;
      sfx
        .play()
        .catch((e) => console.error(`SFX Error for ${name}: ${e.message}`));
    }
  }

  playBgm() {
    if (this.bgm.length === 0) return;
    this.stopBgm();
    this.currentBgm = this.bgm[0];
    this.bgm.push(this.bgm.shift());
    this.currentBgm.volume = this.bgmVolume;
    this.currentBgm.currentTime = 0;
    this.currentBgm.loop = false;
    this.currentBgm
      .play()
      .catch((e) => console.error(`BGM Error: ${e.message}`));
    this.currentBgm.onended = () => this.playBgm();
  }

  stopBgm() {
    if (this.currentBgm) {
      this.currentBgm.pause();
      this.currentBgm.onended = null;
    }
  }
}

class VibrationManager {
  constructor() {
    this.isSupported = 'vibrate' in navigator;
  }

  vibrate(pattern) {
    if (this.isSupported) {
      try {
        // navigator.vibrate(pattern);
      } catch (e) {
        /* Fail silently */
      }
    }
  }

  dragStart() {
    this.vibrate(20);
  }
  piecePlaced() {
    this.vibrate([100, 50, 100]);
  }
  win() {
    this.vibrate([100, 50, 100, 50, 250, 50, 100]);
  }
  lose() {
    this.vibrate([75, 50, 75, 50, 75]);
  }
}

/**
 * @class UIManager
 * @description Manages all UI interactions, updates, and animations.
 */
const DEFAULT_INFO_MESSAGE_DURATION = 1500;
class UIManager {
  constructor() {
    this.modalOverlay = document.getElementById('modal-overlay');
    this.tradePerformModal = document.getElementById('trade-modal-perform');
    this.tradeForcedModal = document.getElementById('trade-modal-being-forced');
    this.scoreMobile = document.querySelector('[data-score-mobile]');
    this.highscoreMobile = document.querySelector('[data-highscore-mobile]');
    this.scoreDesktop = document.querySelector('[data-score-desktop]');
    this.highscoreDesktop = document.querySelector('[data-highscore-desktop]');
    this.aiPiecesContainer = document.getElementById('ai-pieces-container');
    this.playerPiecesContainer = document.getElementById(
      'player-pieces-container',
    );
    this.boardContainer = document.getElementById('board-container');
    this.pieceTemplate = document.getElementById('piece-template');
    this.gameInfoMessage = document.getElementById('game-info-message');
    this.gameOverModal = document.getElementById('game-over-modal');
    this.finalScore = document.querySelector('[data-final-score]');
    this.finalHighscore = document.querySelector('[data-final-highscore]');
    this.resultTitle = document.querySelector('[data-result-title]');
    this.scoreDetails = document.querySelector('[data-score-details]');
    document.getElementById('play-again-btn').onclick = () =>
      app.location.refresh();
  }

  setScore(value) {
    this.scoreMobile.textContent = value;
    this.scoreDesktop.textContent = value;
  }

  setHighScore(value) {
    this.highscoreMobile.textContent = value;
    this.highscoreDesktop.textContent = value;
  }

  showInfoMessage(text, duration = DEFAULT_INFO_MESSAGE_DURATION) {
    const p = this.gameInfoMessage.querySelector('p');
    p.textContent = text;
    p.className =
      'font-tridecco text-6xl md:text-7xl text-white/90 drop-shadow-lg tracking-wide select-none animate-pulse';
    this.gameInfoMessage.classList.remove('hidden');
    setTimeout(() => this.gameInfoMessage.classList.add('hidden'), duration);
  }

  _drawPieceMaintainAspectRatio(canvas, textureData) {
    if (!canvas || !textureData) return;

    const ctx = canvas.getContext('2d');
    const { image, definition: def } = textureData;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (!image || !def || def.w === 0 || def.h === 0) return;

    const canvasRatio = canvasWidth / canvasHeight;
    const textureRatio = def.w / def.h;
    let drawWidth, drawHeight;

    if (canvasRatio > textureRatio) {
      drawHeight = canvasHeight;
      drawWidth = drawHeight * textureRatio;
    } else {
      drawWidth = canvasWidth;
      drawHeight = drawWidth / textureRatio;
    }
    const HALF = 0.5;
    const offsetX = (canvasWidth - drawWidth) * HALF;
    const offsetY = (canvasHeight - drawHeight) * HALF;
    ctx.drawImage(
      image,
      def.x,
      def.y,
      def.w,
      def.h,
      offsetX,
      offsetY,
      drawWidth,
      drawHeight,
    );
  }

  renderPlayerHUD(player, pieceRenderer) {
    const container =
      player.name === 'AI'
        ? this.aiPiecesContainer
        : this.playerPiecesContainer;
    container.innerHTML = '';

    for (const [colorKey, pieces] of player.pieces.entries()) {
      if (pieces.length > 0) {
        const pieceData = pieces[0];
        const pieceElement =
          this.pieceTemplate.content.cloneNode(true).firstElementChild;
        pieceElement.dataset.colorKey = colorKey;

        container.appendChild(pieceElement);

        const canvas = pieceElement.querySelector('canvas');
        const valueSpan = pieceElement.querySelector('.piece-value');
        valueSpan.textContent = pieces.length;

        const rect = pieceElement.getBoundingClientRect();
        const dpi = window.devicePixelRatio || 1;

        canvas.width = rect.width * dpi;
        canvas.height = rect.height * dpi;

        pieceRenderer(canvas, pieceData);
      }
    }
  }

  animateAIPiecePlacement(
    pieceData,
    startElement,
    endScreenCoords,
    pieceRenderer,
  ) {
    return new Promise((resolve) => {
      if (!startElement || !endScreenCoords) {
        resolve();
        return;
      }

      const startRect = startElement.getBoundingClientRect();
      const ghostCanvas = document.createElement('canvas');
      const dpi = window.devicePixelRatio || 1;

      Object.assign(ghostCanvas.style, {
        position: 'fixed',
        zIndex: '1000',
        left: `${startRect.left}px`,
        top: `${startRect.top}px`,
        width: `${startRect.width}px`,
        height: `${startRect.height}px`,
        transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',
      });

      ghostCanvas.width = startRect.width * dpi;
      ghostCanvas.height = startRect.height * dpi;
      pieceRenderer(ghostCanvas, pieceData);

      document.body.appendChild(ghostCanvas);
      startElement.style.opacity = '0.3';

      ghostCanvas.getBoundingClientRect();

      const HALF = 0.5;
      ghostCanvas.style.left = `${endScreenCoords.x - startRect.width * HALF}px`;
      ghostCanvas.style.top = `${endScreenCoords.y - startRect.height * HALF}px`;
      ghostCanvas.style.transform = 'scale(0.8)';
      ghostCanvas.style.opacity = '0.5';

      ghostCanvas.addEventListener(
        'transitionend',
        () => {
          ghostCanvas.remove();
          startElement.style.opacity = '1';
          resolve();
        },
        { once: true },
      );
    });
  }

  showGameOver(result) {
    this._showModal(this.gameOverModal);

    const modalContent = this.gameOverModal.firstElementChild;
    modalContent.style.opacity = 0;
    modalContent.style.transform = 'scale(0.95)';

    this.resultTitle.textContent = result.title;
    this.resultTitle.style.color = result.won ? '#f59e0b' : '#ef4444';
    this.finalScore.textContent = result.score.total;
    this.finalHighscore.textContent = result.highscore;

    this.scoreDetails.innerHTML = '';
    const details = [
      { label: 'Hexagons Formed', value: result.score.base },
      { label: 'Combo Bonus', value: result.score.combo },
      { label: 'No-Preview Bonus', value: result.score.preview },
      { label: 'Opponent Pieces Bonus', value: result.score.opponentPieces },
      { label: 'Difficulty Bonus', value: result.score.difficulty },
    ];

    details.forEach((detail) => {
      const div = document.createElement('div');
      div.className = 'flex justify-between items-baseline text-white/80';
      div.innerHTML = `<span>${detail.label}</span><span class.font-semibold text-white">${detail.value}</span>`;
      this.scoreDetails.appendChild(div);
    });

    requestAnimationFrame(() => {
      modalContent.style.opacity = 1;
      modalContent.style.transform = 'scale(1)';
    });
  }

  _showModal(modalElement) {
    this.tradePerformModal.classList.add('hidden');
    this.tradeForcedModal.classList.add('hidden');
    this.gameOverModal.classList.add('hidden');

    this.modalOverlay.classList.remove('hidden');
    modalElement.classList.remove('hidden');
    modalElement.classList.add('flex');
  }

  _hideModals() {
    this.modalOverlay.classList.add('hidden');
    this.tradePerformModal.classList.add('hidden');
    this.tradeForcedModal.classList.add('hidden');
    this.gameOverModal.classList.add('hidden');

    this.tradePerformModal.classList.remove('flex');
    this.tradeForcedModal.classList.remove('flex');
  }

  _renderTradePiece(container, pieceData, renderer, isSelectable) {
    const pieceElement =
      this.pieceTemplate.content.cloneNode(true).firstElementChild;
    pieceElement.className =
      'trade-piece game-piece-unit relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 border-2 border-transparent rounded-lg shadow-lg transition-all duration-200 bg-white/5';
    if (isSelectable) {
      pieceElement.classList.add('cursor-pointer', 'hover:border-amber-400');
    }

    const valueSpan = pieceElement.querySelector('.piece-value');
    if (pieceData.count) {
      valueSpan.textContent = pieceData.count;
    } else {
      valueSpan.remove();
    }
    container.appendChild(pieceElement);

    requestAnimationFrame(() => {
      const canvas = pieceElement.querySelector('canvas');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');

      const rect = pieceElement.getBoundingClientRect();
      const dpi = window.devicePixelRatio || 1;

      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      canvas.width = rect.width * dpi;
      canvas.height = rect.height * dpi;

      const textureData = renderer.getTexture(
        'tiles',
        pieceData.piece.colors.join('-'),
      );

      if (textureData && textureData.image && textureData.definition) {
        const { image, definition: def } = textureData;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        const canvasRatio = canvasWidth / canvasHeight;
        const textureRatio = def.w / def.h;
        let drawWidth, drawHeight;

        if (canvasRatio > textureRatio) {
          drawHeight = canvasHeight;
          drawWidth = drawHeight * textureRatio;
        } else {
          drawWidth = canvasWidth;
          drawHeight = drawWidth / textureRatio;
        }
        const HALF = 0.5;
        const offsetX = (canvasWidth - drawWidth) * HALF;
        const offsetY = (canvasHeight - drawHeight) * HALF;

        ctx.drawImage(
          image,
          def.x,
          def.y,
          def.w,
          def.h,
          offsetX,
          offsetY,
          drawWidth,
          drawHeight,
        );
      } else {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const HALF = 0.5;
        ctx.fillText('ERR', canvas.width * HALF, canvas.height * HALF);
      }
    });

    return pieceElement;
  }

  showPlayerTradeSelection(player, opponent, renderer, onConfirm, onDecline) {
    const playerOptionsContainer = document.getElementById(
      'perform-trade-player-options',
    );
    const aiOptionsContainer = document.getElementById(
      'perform-trade-ai-options',
    );
    const confirmBtn = document.getElementById('perform-trade-confirm-btn');
    const declineBtn = document.getElementById('perform-trade-decline-btn');

    playerOptionsContainer.innerHTML = '';
    aiOptionsContainer.innerHTML = '';

    const selected = { givePiece: null, takePiece: null };

    for (const [key, pieces] of player.pieces.entries()) {
      if (pieces.length > 0) {
        const pieceEl = this._renderTradePiece(
          playerOptionsContainer,
          { piece: pieces[0], count: pieces.length },
          renderer,
          true,
        );
        pieceEl.addEventListener('click', () => {
          Array.from(playerOptionsContainer.children).forEach((c) =>
            c.classList.remove('selected'),
          );
          pieceEl.classList.add('selected');
          selected.givePiece = pieces[0];
          confirmBtn.disabled = !(selected.givePiece && selected.takePiece);
        });
      }
    }

    for (const [key, pieces] of opponent.pieces.entries()) {
      if (pieces.length > 0) {
        const pieceEl = this._renderTradePiece(
          aiOptionsContainer,
          { piece: pieces[0], count: pieces.length },
          renderer,
          true,
        );
        pieceEl.addEventListener('click', () => {
          Array.from(aiOptionsContainer.children).forEach((c) =>
            c.classList.remove('selected'),
          );
          pieceEl.classList.add('selected');
          selected.takePiece = pieces[0];
          confirmBtn.disabled = !(selected.givePiece && selected.takePiece);
        });
      }
    }

    const cleanup = () => {
      this._hideModals();
      confirmBtn.onclick = null;
      declineBtn.onclick = null;
    };

    confirmBtn.onclick = () => {
      cleanup();
      onConfirm(selected);
    };
    declineBtn.onclick = () => {
      cleanup();
      onDecline();
    };

    this._showModal(this.tradePerformModal);
  }

  showAITradeInitiation(tradeDecision, renderer, onComplete) {
    const aiGivesContainer = document.getElementById('forced-trade-ai-gives');
    const playerGivesContainer = document.getElementById(
      'forced-trade-player-gives',
    );
    const okBtn = document.getElementById('forced-trade-ok-btn');

    aiGivesContainer.innerHTML = '';
    playerGivesContainer.innerHTML = '';

    this._renderTradePiece(
      aiGivesContainer,
      { piece: tradeDecision.givePiece },
      renderer,
      false,
    );
    this._renderTradePiece(
      playerGivesContainer,
      { piece: tradeDecision.takePiece },
      renderer,
      false,
    );

    const cleanup = () => {
      this._hideModals();
      okBtn.onclick = null;
    };

    okBtn.onclick = () => {
      cleanup();
      onComplete();
    };

    this._showModal(this.tradeForcedModal);
  }

  getBoardContainer() {
    return this.boardContainer;
  }
}

class Player {
  constructor(name) {
    this.name = name;
    this.pieces = new Map();
    this.score = {
      base: 0,
      combo: 0,
      preview: 0,
      difficulty: 0,
      opponentPieces: 0,
      total: 0,
    };
    this.comboCount = 0;
  }

  addPiece(piece) {
    const key = piece.colors.join('-');
    if (!this.pieces.has(key)) this.pieces.set(key, []);
    this.pieces.get(key).push(piece);
  }

  popPiece(colorKey) {
    return this.pieces.has(colorKey) && this.pieces.get(colorKey).length > 0
      ? this.pieces.get(colorKey).pop()
      : null;
  }

  get totalPieces() {
    return Array.from(this.pieces.values()).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );
  }
}

class Agent {
  constructor(player) {
    this.player = player;
  }
  async tossPiece() {
    throw new Error('tossPiece not implemented');
  }
  async placePiece() {
    throw new Error('placePiece not implemented');
  }
  async forceTrade() {
    throw new Error('forceTrade not implemented');
  }
}

class PlayerAgent extends Agent {
  constructor(player, uiManager, vibrationManager, renderer) {
    super(player);
    this.uiManager = uiManager;
    this.vibrationManager = vibrationManager;
    this.renderer = renderer;

    this.inputState = {
      type: 'idle',
      piece: null,
      ghostElement: null,
      startElement: null,
      lastHoveredIndex: -1,
      previewedIndex: -1,
      isPress: false,
      startPoint: null,
    };
    this.resolvePromise = null;

    this._gotRendererMoveThisFrame = false;
    this._rafId = 0;
  }

  async placePiece(gameContext) {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.gameContext = gameContext;
      this._addInputListeners();
    });
  }

  _addInputListeners() {
    const playerHUD = this.uiManager.playerPiecesContainer;

    this.hudPointerDown = this._onHudPointerDown.bind(this);
    playerHUD.addEventListener('pointerdown', this.hudPointerDown, {
      passive: false,
    });

    this.boardClick = this._onBoardClick.bind(this);
    this.renderer.addEventListener('click', this.boardClick);

    const NOT_FOUND = -1;
    this.rendererMove = (arg) => {
      const index =
        typeof arg === 'number'
          ? arg
          : (arg?.index ?? arg?.detail?.index ?? NOT_FOUND);

      this._gotRendererMoveThisFrame = true;
      this._onRendererMove(index);
    };
    this.renderer.addEventListener('pointermove', this.rendererMove);

    this.windowPointerMove = this._onWindowPointerMove.bind(this);
    this.windowPointerUp = this._onWindowPointerUp.bind(this);
    window.addEventListener('pointermove', this.windowPointerMove, {
      passive: false,
    });
    window.addEventListener('pointerup', this.windowPointerUp, {
      passive: false,
    });
    window.addEventListener('pointercancel', this.windowPointerUp, {
      passive: false,
    });

    const tick = () => {
      this._gotRendererMoveThisFrame = false;
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  _removeInputListeners() {
    this.uiManager.playerPiecesContainer.removeEventListener(
      'pointerdown',
      this.hudPointerDown,
    );
    this.renderer.removeEventListener('click', this.boardClick);
    this.renderer.removeEventListener('pointermove', this.rendererMove);
    window.removeEventListener('pointermove', this.windowPointerMove);
    window.removeEventListener('pointerup', this.windowPointerUp);
    window.removeEventListener('pointercancel', this.windowPointerUp);
    cancelAnimationFrame(this._rafId);
  }

  _getCanvasForBoard() {
    if (!this.renderer) return null;
    if (typeof this.renderer.getCanvas === 'function') {
      return this.renderer.getCanvas();
    }
    if (this.renderer.canvas) return this.renderer.canvas;
    const container = this.uiManager.getBoardContainer();
    return container ? container.querySelector('canvas') : null;
  }

  _getPickingCanvas() {
    if (this.renderer?._canvas) return this.renderer._canvas;
    if (typeof this.renderer?.getCanvas === 'function') {
      return this.renderer.getCanvas();
    }
    if (this.renderer?.canvas) return this.renderer.canvas;
    const container = this.uiManager.getBoardContainer();
    return container ? container.querySelector('canvas') : null;
  }

  _computeBoardIndexFromClient(clientX, clientY) {
    const NOT_FOUND = -1;

    const canvas = this._getCanvasForBoard();
    if (!canvas) {
      return NOT_FOUND;
    }

    const rect = canvas.getBoundingClientRect();
    if (
      clientX < rect.left ||
      clientY < rect.top ||
      clientX > rect.right ||
      clientY > rect.bottom
    ) {
      return NOT_FOUND;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    try {
      const idx = this.renderer.getPieceIndexAt(x, y);
      console.log(
        'Computed board index:',
        idx,
        'from client coords:',
        clientX,
        clientY,
      );
      return typeof idx === 'number' ? idx : NOT_FOUND;
    } catch (err) {
      return NOT_FOUND;
    }
  }

  _fallbackComputeIndexFromClient(clientX, clientY) {
    const NOT_FOUND = -1;

    const canvas = this._getPickingCanvas();
    if (!canvas) return NOT_FOUND;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return NOT_FOUND;
    try {
      const idx = this.renderer.getPieceIndexAt(x, y);
      return typeof idx === 'number' ? idx : NOT_FOUND;
    } catch {
      return NOT_FOUND;
    }
  }

  _computeBoardIndexFromEvent(e) {
    const NOT_FOUND = -1;

    const canvas = this._getCanvasForBoard();
    if (!canvas) {
      return NOT_FOUND;
    }

    if (typeof this.renderer._getEventDeviceCoords === 'function') {
      try {
        const dev = this.renderer._getEventDeviceCoords(
          { clientX: e.clientX, clientY: e.clientY },
          canvas,
        );
        if (dev && typeof dev.x === 'number' && typeof dev.y === 'number') {
          const idx = this.renderer.getPieceIndexAt(dev.x, dev.y);
          if (typeof idx === 'number') return idx;
        }
      } catch {}
    }

    const rect = canvas.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientY < rect.top ||
      e.clientX > rect.right ||
      e.clientY > rect.bottom
    ) {
      return NOT_FOUND;
    }
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    try {
      const idxFallback = this.renderer.getPieceIndexAt(x, y);
      return typeof idxFallback === 'number' ? idxFallback : NOT_FOUND;
    } catch {
      return NOT_FOUND;
    }
  }

  _onHudPointerDown(e) {
    const startElement = e.target.closest('.piece-in-hud');
    if (!startElement) return;

    e.preventDefault();
    e.stopPropagation();

    if (this.inputState.type === 'selected') {
      if (this.inputState.startElement === startElement) {
        window.removeEventListener('pointermove', this._pendingPointerMove);
        window.removeEventListener('pointerup', this._pendingPointerUp);
        window.removeEventListener('pointercancel', this._pendingPointerUp);

        this.inputState.type = 'dragging';
        this._startDrag(e);
        return;
      }
    }

    if (this.inputState.type !== 'idle') return;

    this.inputState.type = 'pending';
    this.inputState.startElement = startElement;
    this.inputState.startPoint = { x: e.clientX, y: e.clientY };
    this.inputState.piece = this.player.pieces.get(
      startElement.dataset.colorKey,
    )?.[0];

    this._pendingPointerMove = this._pendingPointerMoveHandler.bind(this);
    this._pendingPointerUp = this._pendingPointerUpHandler.bind(this);
    window.addEventListener('pointermove', this._pendingPointerMove, {
      passive: false,
    });
    window.addEventListener('pointerup', this._pendingPointerUp, {
      passive: false,
    });
    window.addEventListener('pointercancel', this._pendingPointerUp, {
      passive: false,
    });
  }

  _pendingPointerMoveHandler(e) {
    const DRAG_THRESHOLD = 5;
    const { x, y } = this.inputState.startPoint;
    if (
      Math.abs(e.clientX - x) > DRAG_THRESHOLD ||
      Math.abs(e.clientY - y) > DRAG_THRESHOLD
    ) {
      window.removeEventListener('pointermove', this._pendingPointerMove, {
        passive: false,
      });
      window.removeEventListener('pointerup', this._pendingPointerUp, {
        passive: false,
      });
      window.removeEventListener('pointercancel', this._pendingPointerUp, {
        passive: false,
      });
      this.inputState.type = 'dragging';
      this._startDrag(e);
    }
  }

  _pendingPointerUpHandler(e) {
    window.removeEventListener('pointermove', this._pendingPointerMove, {
      passive: false,
    });
    window.removeEventListener('pointerup', this._pendingPointerUp, {
      passive: false,
    });
    window.removeEventListener('pointercancel', this._pendingPointerUp, {
      passive: false,
    });

    if (this.inputState.type === 'pending') {
      this.inputState.type = 'idle';
      this._handlePieceClick(this.inputState.startElement);
    }
  }

  _onWindowPointerMove(e) {
    if (this.inputState.isPress) this.inputState.isPress = false;
    if (this.inputState.type !== 'dragging') return;

    const { ghostElement } = this.inputState;
    if (ghostElement) {
      ghostElement.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    }

    if (this._gotRendererMoveThisFrame) return;

    const index = this._fallbackComputeIndexFromClient(e.clientX, e.clientY);
    this._onRendererMove(index);
  }

  _onWindowPointerUp(e) {
    if (this.inputState.type === 'dragging') {
      this._endDrag();
    } else if (this.inputState.isPress) {
      this.inputState.isPress = false;
      this._handlePieceClick(this.inputState.startElement);
    }
  }

  _onRendererMove(index) {
    if (
      this.inputState.type !== 'dragging' &&
      this.inputState.type !== 'selected'
    ) {
      return;
    }

    this.inputState.lastHoveredIndex = index;
    const isAvailable = this.gameContext.board
      .getAvailablePositions()
      .includes(index);

    if (this.gameContext.preview) {
      if (isAvailable) {
        this.renderer.previewPiece(index, this.inputState.piece);
        this.inputState.previewedIndex = index;
      } else {
        this.renderer.clearPreview();
        this.inputState.previewedIndex = -1;
      }

      if (this.inputState.ghostElement) {
        this.inputState.ghostElement.style.display = isAvailable
          ? 'none'
          : 'block';
      }
    } else {
      if (this.inputState.ghostElement) {
        this.inputState.ghostElement.style.display = 'block';
      }
    }
  }

  _onBoardClick(index) {
    if (this.inputState.type !== 'selected') return;

    const isAvailable = this.gameContext.board
      .getAvailablePositions()
      .includes(index);

    if (isAvailable) {
      if (this.gameContext.preview) {
        if (index === this.inputState.previewedIndex) {
          this._completeMove(index, this.inputState.piece);
        } else {
          this._onRendererMove(index);
        }
      } else {
        this._completeMove(index, this.inputState.piece);
      }
    } else {
      this._resetState();
    }
  }

  _startDrag(e) {
    this.vibrationManager.dragStart();
    const { startElement } = this.inputState;
    const colorKey = startElement.dataset.colorKey;
    const piece = this.player.pieces.get(colorKey)?.[0];
    if (!piece) return this._resetState();

    this.inputState.type = 'dragging';
    this.inputState.piece = piece;

    const startRect = startElement.getBoundingClientRect();
    const ghost = document.createElement('canvas');
    const dpi = window.devicePixelRatio || 1;
    ghost.width = startRect.width * dpi;
    ghost.height = startRect.height * dpi;
    this.uiManager._drawPieceMaintainAspectRatio(
      ghost,
      this.renderer.getTexture('tiles', piece.colors.join('-')),
    );

    Object.assign(ghost.style, {
      position: 'fixed',
      zIndex: '2000',
      pointerEvents: 'none',
      left: '0px',
      top: '0px',
      width: `${startRect.width}px`,
      height: `${startRect.height}px`,
      transform: `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`,
      opacity: '0.8',
    });

    document.body.appendChild(ghost);
    this.inputState.ghostElement = ghost;
    startElement.style.opacity = '0.4';

    return undefined;
  }

  _endDrag() {
    const RETRY_DELAY = 300;
    const { lastHoveredIndex, piece } = this.inputState;
    const isAvailable = this.gameContext.board
      .getAvailablePositions()
      .includes(lastHoveredIndex);

    if (isAvailable) {
      this._completeMove(lastHoveredIndex, piece);
    } else {
      if (this.inputState.ghostElement && this.inputState.startElement) {
        const startRect = this.inputState.startElement.getBoundingClientRect();
        this.inputState.ghostElement.style.transition =
          'transform 0.3s ease-out, opacity 0.3s ease-out';
        this.inputState.ghostElement.style.transform = `translate(${startRect.left + startRect.width / 2}px, ${startRect.top + startRect.height / 2}px) translate(-50%,-50%) scale(1)`;
        this.inputState.ghostElement.style.opacity = '0';
        setTimeout(() => this._resetState(), RETRY_DELAY);
      } else {
        this._resetState();
      }
    }
  }

  _handlePieceClick(element) {
    const colorKey = element.dataset.colorKey;
    const piece = this.player.pieces.get(colorKey)?.[0];
    if (!piece) return;

    if (
      this.inputState.type === 'selected' &&
      this.inputState.piece.colors.join('-') === colorKey
    ) {
      this._resetState();
    } else {
      this.inputState.type = 'selected';
      this.inputState.piece = piece;
      this.inputState.startElement = element;
      this._updateSelectionHighlight();
    }
  }

  _completeMove(position, piece) {
    const move = { position, piece };
    this._resetState();
    this._removeInputListeners();
    if (this.resolvePromise) {
      this.resolvePromise(move);
      this.resolvePromise = null;
    }
  }

  _resetState() {
    if (this.inputState.ghostElement) this.inputState.ghostElement.remove();
    if (this.inputState.startElement) {
      this.inputState.startElement.style.opacity = '1';
    }

    this._clearSelectionHighlight();
    this.renderer.clearPreview();

    this.inputState = {
      type: 'idle',
      piece: null,
      ghostElement: null,
      startElement: null,
      lastHoveredIndex: -1,
      previewedIndex: -1,
      isPress: false,
    };
  }

  _updateSelectionHighlight() {
    this._clearSelectionHighlight();
    if (this.inputState.startElement) {
      this.inputState.startElement.classList.add('selected');
    }
  }

  _clearSelectionHighlight() {
    const selected =
      this.uiManager.playerPiecesContainer.querySelector('.selected');
    if (selected) selected.classList.remove('selected');
  }

  async tossPiece() {
    const INFO_DURATION = 2000;
    return new Promise(async (resolve) => {
      this.uiManager.showInfoMessage('Your turn to toss!', INFO_DURATION);
      await delay(INFO_DURATION);
      resolve();
    });
  }

  async forceTrade() {
    return { accepted: false };
  }
}

class AIPlayerAgent extends Agent {
  constructor(player, uiManager, vibrationManager, renderer) {
    super(player);
    this.uiManager = uiManager;
    this.vibrationManager = vibrationManager;
    this.renderer = renderer;

    this.DIFFICULTY_SETTINGS = {
      beginner: {
        offense: 0,
        defense: false,
        cautious: 0,
        dominantColorThreshold: 3,
      },
      easy: {
        offense: 50,
        defense: false,
        cautious: 0,
        dominantColorThreshold: 3,
      },
      normal: {
        offense: 100,
        defense: true,
        cautious: 0,
        dominantColorThreshold: 3,
      },
      hard: {
        offense: 100,
        defense: true,
        cautious: 1,
        dominantColorThreshold: 2,
      },
      insane: {
        offense: 100,
        defense: true,
        cautious: 2,
        dominantColorThreshold: 1,
      },
    };
  }

  _getHandStats(player) {
    const stats = [];
    for (const [key, pieces] of player.pieces.entries()) {
      if (pieces.length > 0) {
        stats.push({ piece: pieces[0], count: pieces.length, key: key });
      }
    }
    stats.sort((a, b) => b.count - a.count);
    return stats;
  }

  _getScoringMoves(player, board) {
    const moves = [];
    for (const [key, pieces] of player.pieces.entries()) {
      if (pieces.length > 0) {
        const piece = pieces[0];
        const potentialMoves = board.getHexagonPositions(piece);
        potentialMoves.forEach(([position, hexagonsFormed]) => {
          moves.push({ piece, position, hexagonsFormed });
        });
      }
    }
    moves.sort((a, b) => b.hexagonsFormed - a.hexagonsFormed);
    return moves;
  }

  _getRandomMove(board) {
    const availablePositions = board.getAvailablePositions();
    if (availablePositions.length === 0) return null;

    const availablePieces = Array.from(this.player.pieces.values())
      .filter((p) => p.length > 0)
      .map((p) => p[0]);
    if (availablePieces.length === 0) return null;

    return {
      position:
        availablePositions[
          Math.floor(Math.random() * availablePositions.length)
        ],
      piece:
        availablePieces[Math.floor(Math.random() * availablePieces.length)],
    };
  }

  async forceTrade(gameContext) {
    const aiHandStats = this._getHandStats(this.player);
    const playerHandStats = this._getHandStats(gameContext.opponent);

    if (aiHandStats.length === 0 || playerHandStats.length === 0) {
      return { accepted: false };
    }

    const pieceToGive = aiHandStats[0].piece;
    const pieceToTake = playerHandStats[playerHandStats.length - 1].piece;

    return {
      accepted: true,
      givePiece: pieceToGive,
      takePiece: pieceToTake,
    };
  }

  async placePiece(gameContext) {
    const difficulty = app.location.params.difficulty || 'normal';
    const settings = this.DIFFICULTY_SETTINGS[difficulty];
    const board = gameContext.board;
    const opponent = gameContext.opponent;

    const scoringMoves = this._getScoringMoves(this.player, board);

    if (scoringMoves.length > 0) {
      const TRIDECCO = 3;
      const winningMove = scoringMoves.find(
        (m) => m.hexagonsFormed >= TRIDECCO,
      );
      if (winningMove) {
        return winningMove;
      }

      const PERCENT_MAX = 100;
      const isOffensive = Math.random() * PERCENT_MAX < settings.offense;

      if (isOffensive) {
        if (settings.cautious > 0) {
          const bestMove = this._findBestCautiousMove(
            scoringMoves,
            settings,
            board,
            opponent,
          );
          return bestMove || this._getRandomMove(board);
        } else {
          return scoringMoves[0];
        }
      } else {
        return this._getRandomMove(board);
      }
    } else {
      if (settings.defense) {
        const defensiveMove = this._findBestDefensiveMove(
          settings,
          board,
          opponent,
        );
        return defensiveMove || this._getRandomMove(board);
      } else {
        return this._getRandomMove(board);
      }
    }
  }

  _findBestCautiousMove(scoringMoves, settings, board, opponent) {
    const CAUTION_LEVELS_MAX = 2;
    if (settings.cautious === CAUTION_LEVELS_MAX) {
      const safeMoves = [];
      for (const move of scoringMoves) {
        board.place(move.position, move.piece);
        const opponentReplies = this._getScoringMoves(opponent, board);
        const TRIDECCO_HEXAGON_COUNT = 3;
        const isOpponentWinning = opponentReplies.some(
          (r) => r.hexagonsFormed >= TRIDECCO_HEXAGON_COUNT,
        );
        board.back();

        if (!isOpponentWinning) {
          safeMoves.push(move);
        }
      }
      if (safeMoves.length === 0) {
        return this._findBestDefensiveMove(settings, board, opponent);
      }
      return safeMoves[0];
    }

    if (settings.cautious === 1) {
      let bestMove = null;
      let minOpponentOpportunities = Infinity;

      for (const move of scoringMoves) {
        board.place(move.position, move.piece);
        const opponentOpportunities = this._getScoringMoves(
          opponent,
          board,
        ).length;
        board.back();

        if (opponentOpportunities < minOpponentOpportunities) {
          minOpponentOpportunities = opponentOpportunities;
          bestMove = move;
        }
      }
      return bestMove;
    }

    return scoringMoves[0];
  }

  _findBestDefensiveMove(settings, board, opponent) {
    const availablePositions = board.getAvailablePositions();
    const aiHandStats = this._getHandStats(this.player);

    if (availablePositions.length === 0 || aiHandStats.length === 0) {
      return null;
    }

    let piecesToConsider = [];
    if (aiHandStats.length > 1) {
      const mainColorCount = aiHandStats[0].count;
      const secondColorCount = aiHandStats[1].count;
      if (mainColorCount - secondColorCount > settings.dominantColorThreshold) {
        piecesToConsider.push(aiHandStats[0].piece);
      } else {
        piecesToConsider = aiHandStats.map((s) => s.piece);
      }
    } else {
      piecesToConsider.push(aiHandStats[0].piece);
    }

    let bestMove = null;
    let minOpponentHexagons = Infinity;

    for (const position of availablePositions) {
      for (const piece of piecesToConsider) {
        board.place(position, piece);
        const opponentReplies = this._getScoringMoves(opponent, board);

        const maxHexagonsForOpponent =
          opponentReplies.length > 0 ? opponentReplies[0].hexagonsFormed : 0;

        board.back();

        if (maxHexagonsForOpponent < minOpponentHexagons) {
          minOpponentHexagons = maxHexagonsForOpponent;
          bestMove = { position, piece };
        }
      }
    }

    return bestMove;
  }

  async animatePlacement(move) {
    const startElement = this.uiManager.aiPiecesContainer.querySelector(
      `[data-color-key="${move.piece.colors.join('-')}"]`,
    );

    const canvas = this.uiManager.getBoardContainer()?.querySelector('canvas');
    if (!canvas || !this.renderer || !startElement) {
      return;
    }

    const centerCoordsArray = this.renderer.getPieceCoordinates(move.position);
    const CENTER_COORDS_LENGTH = 2;
    if (
      !Array.isArray(centerCoordsArray) ||
      centerCoordsArray.length < CENTER_COORDS_LENGTH
    ) {
      return;
    }
    const centerCoordsInCanvas = {
      x: centerCoordsArray[0],
      y: centerCoordsArray[1],
    };

    const canvasRect = canvas.getBoundingClientRect();
    const endScreenCoords = {
      x: canvasRect.left + centerCoordsInCanvas.x,
      y: canvasRect.top + centerCoordsInCanvas.y,
    };

    const pieceRenderer = (targetCanvas, pieceData) =>
      this.uiManager._drawPieceMaintainAspectRatio(
        targetCanvas,
        this.renderer.getTexture('tiles', pieceData.colors.join('-')),
      );

    await this.uiManager.animateAIPiecePlacement(
      move.piece,
      startElement,
      endScreenCoords,
      pieceRenderer,
    );
  }

  async tossPiece() {
    const INFO_DURATION = 2000;
    return new Promise(async (resolve) => {
      this.uiManager.showInfoMessage('AI is tossing a piece...', INFO_DURATION);
      await delay(INFO_DURATION);
      resolve();
    });
  }
}

class Game {
  constructor(
    playerAgent,
    aiAgent,
    audioManager,
    vibrationManager,
    uiManager,
    gameHistory,
    options = {},
    onReady,
  ) {
    this.playerAgent = playerAgent;
    this.aiAgent = aiAgent;
    this.audioManager = audioManager;
    this.vibrationManager = vibrationManager;
    this.uiManager = uiManager;
    this.gameHistory = gameHistory;
    this.options = options;
    this.isGameOver = false;
    this.highScore = parseInt(app.data.single.highScore || '0');
    this.board = new Tridecco.Board();
    this.renderer = new Tridecco.Renderer(
      {
        ...options.renderer,
        board: this.board,
        container: uiManager.getBoardContainer(),
      },
      () => onReady?.(),
    );
  }

  async start() {
    this.uiManager.setHighScore(this.highScore);
    await this._dealPieces();
    this._updateAllHUDs();

    const HALF = 0.5;
    this.currentAgent = Math.random() < HALF ? this.playerAgent : this.aiAgent;
    await this.currentAgent.tossPiece({ board: this.board });

    const firstPieceKey = Array.from(this.currentAgent.player.pieces.keys())[0];
    const firstPiece = this.currentAgent.player.popPiece(firstPieceKey);
    this.board.place(this.board.getRandomPosition(false), firstPiece);
    this._updateAllHUDs();

    this._nextTurn();
    this._gameLoop();
  }

  _nextTurn() {
    this.currentAgent =
      this.currentAgent === this.playerAgent ? this.aiAgent : this.playerAgent;
  }

  async _gameLoop() {
    if (this.isGameOver) return;
    if (this.playerAgent.player.totalPieces === 0) {
      await this._endGame(true);
    }
    if (this.aiAgent.player.totalPieces === 0) {
      await this._endGame(false);
    }
    if (this.board.getAvailablePositions().length === 0) {
      await this._endGame(
        this.playerAgent.player.totalPieces < this.aiAgent.player.totalPieces,
      );
    }

    const opponentAgent =
      this.currentAgent === this.playerAgent ? this.aiAgent : this.playerAgent;
    const gameContext = {
      board: this.board,
      preview: this.options.preview,
      opponent: opponentAgent.player,
    };

    if (this.currentAgent === this.playerAgent && !gameContext.preview) {
      this.renderer.showAvailablePositions();
    }

    if (this.currentAgent === this.aiAgent) {
      const ONE_SECOND = 1000;
      await delay(ONE_SECOND);
    }

    const move = await this.currentAgent.placePiece(gameContext);

    if (this.currentAgent === this.playerAgent && !gameContext.preview) {
      this.renderer.clearAvailablePositions();
    }
    if (!move) {
      this._nextTurn();
      this._gameLoop();
      return;
    }

    if (this.currentAgent === this.aiAgent) {
      await this.aiAgent.animatePlacement(move);
    }

    this.currentAgent.player.popPiece(move.piece.colors.join('-'));
    const formedHexagons = this.board.place(move.position, move.piece);
    if (this.currentAgent === this.playerAgent) {
      this.vibrationManager.piecePlaced();
    }

    this._updateAllHUDs();
    await this._handlePlacementResult(formedHexagons.length);
  }

  async _handlePlacementResult(hexCount) {
    const humanPlayer = this.playerAgent.player;
    const aiPlayer = this.aiAgent.player;

    if (hexCount > 0) {
      if (this.currentAgent === this.playerAgent) {
        humanPlayer.comboCount++;
      } else {
        aiPlayer.comboCount++;
      }

      if (this.currentAgent === this.playerAgent) {
        const baseScore = { 1: 100, 2: 200, 3: 300 }[hexCount] || 0;
        const comboBonus = baseScore * (humanPlayer.comboCount - 1);
        const PREVIEW_BONUS_SCORE = 100;
        const previewBonus = !this.options.preview ? PREVIEW_BONUS_SCORE : 0;

        humanPlayer.score.base += baseScore;
        humanPlayer.score.combo += comboBonus;
        humanPlayer.score.preview += previewBonus;

        humanPlayer.score.total =
          humanPlayer.score.base +
          humanPlayer.score.combo +
          humanPlayer.score.preview;

        this.uiManager.setScore(humanPlayer.score.total);
        this.audioManager.playSfx(
          { 1: 'single', 2: 'double', 3: 'tridecco' }[hexCount],
        );

        if (humanPlayer.comboCount > 1) {
          this.uiManager.showInfoMessage(`Combo x${humanPlayer.comboCount}!`);
        }
      }
    } else {
      humanPlayer.comboCount = 0;
      aiPlayer.comboCount = 0;
      if (this.currentAgent === this.playerAgent) {
        this.audioManager.playSfx('pop');
      }
    }

    const TRIDECCO = 3;
    if (hexCount >= TRIDECCO) {
      const HALF_SECOND = 500;
      await delay(HALF_SECOND);
      return this._endGame(this.currentAgent === this.playerAgent);
    }

    const DOUBLE = 2;
    if (hexCount === DOUBLE) {
      this.audioManager.playSfx('double');
      const opponentAgent =
        this.currentAgent === this.playerAgent
          ? this.aiAgent
          : this.playerAgent;

      if (this.currentAgent === this.playerAgent) {
        this.uiManager.showPlayerTradeSelection(
          humanPlayer,
          opponentAgent.player,
          this.renderer,
          (tradeDecision) => {
            this._performTrade(tradeDecision);
            this._gameLoop();
          },
          () => {
            this._gameLoop();
          },
        );
      } else {
        const tradeDecision = await this.currentAgent.forceTrade({
          opponent: opponentAgent.player,
        });
        if (tradeDecision.accepted) {
          this.uiManager.showAITradeInitiation(
            tradeDecision,
            this.renderer,
            () => {
              this._performTrade(tradeDecision);
              this._gameLoop();
            },
          );
        } else {
          this._gameLoop();
        }
      }

      return;
    }

    if (hexCount === 1) {
      this.audioManager.playSfx('single');
      return this._gameLoop();
    }

    if (hexCount === 0) {
      this._nextTurn();
      return this._gameLoop();
    }
  }

  _performTrade({ givePiece, takePiece }) {
    if (!givePiece || !takePiece) return;

    const initiator = this.currentAgent.player;
    const receiver =
      this.currentAgent === this.playerAgent
        ? this.aiAgent.player
        : this.playerAgent.player;

    initiator.popPiece(givePiece.colors.join('-'));
    receiver.addPiece(givePiece);
    receiver.popPiece(takePiece.colors.join('-'));
    initiator.addPiece(takePiece);

    this._updateAllHUDs();
  }

  _endGame(playerWon) {
    if (this.isGameOver) return;
    this.isGameOver = true;

    const playerScore = this.playerAgent.player.score;

    if (playerWon) {
      const difficultyBonusMap = {
        beginner: 1000,
        easy: 2000,
        normal: 3000,
        hard: 4000,
        insane: 5000,
      };
      playerScore.difficulty = difficultyBonusMap[this.options.difficulty] || 0;

      const opponentRemainingPieces = this.aiAgent.player.totalPieces;
      const OPPONENT_PIECE_VALUE = 100;
      playerScore.opponentPieces =
        opponentRemainingPieces * OPPONENT_PIECE_VALUE;
    }

    playerScore.total =
      playerScore.base +
      playerScore.combo +
      playerScore.preview +
      playerScore.opponentPieces +
      playerScore.difficulty;

    if (playerScore.total > this.highScore) {
      this.highScore = playerScore.total;
      app.data.single.highScore = this.highScore;
    }

    const finalResult = {
      won: playerWon,
      title: playerWon ? 'You Won!' : 'You Lost',
      score: playerScore,
      highscore: this.highScore,
      difficulty: this.options.difficulty,
    };

    this.uiManager.showGameOver(finalResult);

    this.gameHistory.addGame(finalResult);

    if (playerWon) {
      this.audioManager.playSfx('victory');
      this.vibrationManager.win();
      if (window.confetti) {
        window.confetti({
          particleCount: 150,
          spread: 120,
          origin: { y: 0.6 },
        });
      }
    } else {
      this.audioManager.playSfx('defeat');
      this.vibrationManager.lose();
    }
  }

  _dealPieces() {
    const PIECE_CONFIG = [
      { key1: ['yellow', 'blue'], key2: ['white', 'red'] },
      { key1: ['blue', 'white'], key2: ['red', 'yellow'] },
    ];
    const EACH_PLAYER_COLOR_PIECES = 9;
    const HALF = 0.5;
    const playerGroupIndex = Math.random() < HALF ? 0 : 1;
    const aiGroupIndex = 1 - playerGroupIndex;
    const playerConfig = PIECE_CONFIG[playerGroupIndex];
    const aiConfig = PIECE_CONFIG[aiGroupIndex];

    for (let i = 0; i < EACH_PLAYER_COLOR_PIECES; i++) {
      this.playerAgent.player.addPiece(new Tridecco.Piece(playerConfig.key1));
      this.playerAgent.player.addPiece(new Tridecco.Piece(playerConfig.key2));
    }
    for (let i = 0; i < EACH_PLAYER_COLOR_PIECES; i++) {
      this.aiAgent.player.addPiece(new Tridecco.Piece(aiConfig.key1));
      this.aiAgent.player.addPiece(new Tridecco.Piece(aiConfig.key2));
    }
  }

  _updateAllHUDs() {
    const pieceRenderer = (canvas, piece) =>
      this.uiManager._drawPieceMaintainAspectRatio(
        canvas,
        this.renderer.getTexture('tiles', piece.colors.join('-')),
      );
    this.uiManager.renderPlayerHUD(this.playerAgent.player, pieceRenderer);
    this.uiManager.renderPlayerHUD(this.aiAgent.player, pieceRenderer);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const CDN_URL = typeof window.CDN_URL !== 'undefined' ? window.CDN_URL : '';

  if (
    !document.referrer ||
    performance.getEntriesByType('navigation')[0]?.type === 'reload'
  ) {
    app.location.redirect('/single');
  }

  const AUDIO_MANIFEST = {
    bgm: {
      dance: `${CDN_URL}/audio/bgm/dance.mp3`,
      chill: `${CDN_URL}/audio/bgm/nocturne.mp3`,
      epic: `${CDN_URL}/audio/bgm/waltz.mp3`,
    },
    sfx: {
      click: `${CDN_URL}/audio/sfx/click.wav`,
      pop: `${CDN_URL}/audio/sfx/pop.wav`,
      single: `${CDN_URL}/audio/sfx/single.wav`,
      double: `${CDN_URL}/audio/sfx/double.wav`,
      tridecco: `${CDN_URL}/audio/sfx/tridecco.wav`,
      victory: `${CDN_URL}/audio/sfx/victory.wav`,
      defeat: `${CDN_URL}/audio/sfx/defeat.wav`,
    },
  };

  if (typeof window.app.data.single.history === 'undefined') {
    window.app.data.single.history = [];
  }
  const gameHistory = new GameHistory(window.app.data.single.history);

  const difficulty = app.location.params.difficulty || 'normal';
  const settings = app.data.single.settings.game;
  const audioManager = new AudioManager(AUDIO_MANIFEST.sfx, AUDIO_MANIFEST.bgm);
  const vibrationManager = new VibrationManager();
  const uiManager = new UIManager();
  await audioManager.load();
  audioManager.setVolume('sfx', settings.volume.sfx);
  audioManager.setVolume('bgm', settings.volume.bgm);
  audioManager.playBgm();

  const gameOptions = {
    difficulty: difficulty,
    preview: settings.board.preview,
    renderer: {
      backgroundUrl: `${TRIDECCO_BOARD_ASSETS_URL}/backgrounds/${settings.board.background}.jpg`,
      gridUrl: `${TRIDECCO_BOARD_ASSETS_URL}/grids/${settings.board.grid}.png`,
      texturesIndexUrl: `${TRIDECCO_BOARD_ASSETS_URL}/textures-bundle/${settings.board.texture}/${settings.board.colorBlindness === 'none' ? 'normal' : settings.board.colorBlindness}/index.json`,
      texturesAtlasUrl: `${TRIDECCO_BOARD_ASSETS_URL}/textures-bundle/${settings.board.texture}/${settings.board.colorBlindness === 'none' ? 'normal' : settings.board.colorBlindness}/atlas.webp`,
    },
  };

  const game = new Game(
    new PlayerAgent(new Player('You'), uiManager, vibrationManager, null),
    new AIPlayerAgent(new Player('AI'), uiManager, vibrationManager, null, {}),
    audioManager,
    vibrationManager,
    uiManager,
    gameHistory,
    gameOptions,
    () => {
      game.playerAgent.renderer = game.renderer;
      game.aiAgent.renderer = game.renderer;
      game.start();
    },
  );
});
