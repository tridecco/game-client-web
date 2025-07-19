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
