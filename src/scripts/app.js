/**
 * @fileoverview Main Application Class
 * @description The main application class for the frontend.
 */

/**
 * @class Data
 * @description Handles the data of the application.
 */
class Data {
  /**
   * @constructor - Initializes the Data class.
   * @param {Object} app - The App class instance.
   */
  constructor(app) {
    this.app = app;
    this.key = 'appData';
    this._data = this.loadData();

    return this.createProxy(this._data);
  }

  /**
   * @method createProxy - Creates a proxy for the data object.
   * @param {Object} data - The data object to proxy.
   * @returns {Object} - The proxied data object.
   */
  createProxy(data) {
    const handler = {
      set: (target, prop, value) => {
        if (typeof value === 'object' && value !== null) {
          value = this.createProxy(value);
        }
        target[prop] = value;
        this.saveData(); // Save data when any property is set
        return true;
      },
      get: (target, prop) => {
        if (prop in target) {
          if (typeof target[prop] === 'object' && target[prop] !== null) {
            return this.createProxy(target[prop]);
          }
          return target[prop];
        }
        return undefined;
      },
    };

    return new Proxy(data, handler);
  }

  /**
   * @method loadData - Loads data from the local-storage.
   */
  loadData() {
    const storedData = localStorage.getItem(this.key);
    return storedData ? JSON.parse(storedData) : {};
  }

  /**
   * @method saveData - Saves data to the local-storage.
   */
  saveData() {
    localStorage.setItem(this.key, JSON.stringify(this._data));
  }
}

/**
 * @class Cache
 * @description Handles the cache of the application.
 */
class Cache {
  /**
   * @constructor - Initializes the Cache class.
   * @param {Object} app - The App class instance.
   */
  constructor(app) {
    this.app = app;
    this.key = 'appCache';
    this._data = this.loadCache();

    return this.createProxy(this._data);
  }

  /**
   * @method createProxy - Creates a proxy for the cache object.
   * @param {Object} data - The cache object to proxy.
   * @returns {Object} - The proxied cache object.
   */
  createProxy(data) {
    const handler = {
      set: (target, prop, value) => {
        if (typeof value === 'object' && value !== null) {
          value = this.createProxy(value);
        }
        target[prop] = value;
        this.saveCache(); // Save cache when any property is set
        return true;
      },
      get: (target, prop) => {
        if (prop in target) {
          if (typeof target[prop] === 'object' && target[prop] !== null) {
            return this.createProxy(target[prop]);
          }
          return target[prop];
        }
        return undefined;
      },
    };

    return new Proxy(data, handler);
  }

  /**
   * @method loadCache - Loads cache from the session-storage.
   */
  loadCache() {
    const storedCache = sessionStorage.getItem(this.key);
    return storedCache ? JSON.parse(storedCache) : {};
  }

  /**
   * @method saveCache - Saves cache to the session-storage.
   */
  saveCache() {
    sessionStorage.setItem(this.key, JSON.stringify(this._data));
  }
}

/**
 * @class Auth
 * @description Handles the authentication of the application.
 */
class Auth {
  /**
   * @constructor - Initializes the Auth class.
   * @param {Object} app - The App class instance.
   */
  constructor(app) {
    this.app = app;

    this.authenticated = false;
    this.userId = this.app.data.auth && this.app.data.auth.userId;
    this.identities = this.app.data.auth && this.app.data.auth.identities;
    this.accessToken = this.app.data.auth && this.app.data.auth.accessToken;
    this.refreshToken = this.app.data.auth && this.app.data.auth.refreshToken;

    this._refreshing = null; // Prevent concurrent refreshes
  }

  static ERROR_CODES = {
    INVALID: 400,
    UNAUTHORIZED: 401,
  };

  /**
   * @method init - Initializes the Auth class.
   * @returns {boolean} - True if the user is authenticated, false otherwise.
   */
  init() {
    if (
      (this.refreshToken || this.accessToken) &&
      !(this.refreshToken && this.accessToken && this.userId)
    ) {
      this.destroy();
      return false;
    } else if (this.refreshToken && this.accessToken && this.userId) {
      this.authenticated = true;
      this._wrapFetch();
      return true;
    } else {
      this.authenticated = false;
      this._wrapFetch();
      return false;
    }
  }

  /**
   * @method _wrapFetch - Wraps the fetch function to handle JWT and refresh logic.
   */
  _wrapFetch() {
    const self = this;
    window.originalFetch = window.originalFetch || window.fetch;

    window.fetch = async function fetchWithAuth(url, options = {}) {
      const currentOrigin = window.location.origin;

      let targetUrl = url;
      if (!url.startsWith('http') && !url.startsWith('https')) {
        targetUrl = currentOrigin + url;
      }

      let targetOrigin;
      try {
        targetOrigin = new URL(targetUrl).origin;
      } catch (error) {
        targetOrigin = '';
      }

      // Add Authorization header for same-origin requests
      if (targetOrigin === currentOrigin && self.accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${self.accessToken}`,
        };
      }

      let response;
      try {
        response = await window.originalFetch(url, options);
      } catch (err) {
        // Network error, propagate to caller
        throw err;
      }

      // If unauthorized, try to refresh token
      if (response.status === Auth.ERROR_CODES.UNAUTHORIZED) {
        try {
          await self._refreshTokenOnce();
          // Retry original request with new token
          if (targetOrigin === currentOrigin && self.accessToken) {
            options.headers = {
              ...options.headers,
              Authorization: `Bearer ${self.accessToken}`,
            };
          }
          return await window.originalFetch(url, options);
        } catch (refreshErr) {
          // Only destroy if token is truly expired/invalid
          if (refreshErr && refreshErr.isTokenExpired) {
            self.destroy();
            self.app.location.init();
            return null;
          }
          // Other errors (e.g. network), propagate to caller
          throw refreshErr;
        }
      }

      return response;
    };
  }

  /**
   * @method _refreshTokenOnce - Ensures only one refresh is in progress.
   * @private
   */
  async _refreshTokenOnce() {
    if (!this._refreshing) {
      this._refreshing = this.authenticate()
        .catch((err) => {
          throw err;
        })
        .finally(() => {
          this._refreshing = null;
        });
    }
    return this._refreshing;
  }

  /**
   * @method authenticate - Refreshes the JWT token.
   * @throws {Error} - If the token is invalid or expired.
   */
  async authenticate() {
    if (!this.refreshToken) {
      const err = new Error('Invalid or expired token.');
      err.isTokenExpired = true;
      throw err;
    }

    let response;
    try {
      response = await window.originalFetch(
        `${this.app.apiURL}/auth/refresh-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: this.refreshToken,
          }),
        },
      );
    } catch (err) {
      // Network error, propagate
      throw err;
    }

    // Parse response JSON only once
    let responseJson = null;
    try {
      responseJson = await response.clone().json();
    } catch (e) {
      // Ignore JSON parse error, will be handled by status code
    }

    // Destroy if any of these error codes are present
    const shouldDestroy =
      (response.status === Auth.ERROR_CODES.INVALID &&
        responseJson &&
        responseJson.error &&
        (responseJson.error.code === 'INVALID_REFRESH_TOKEN' ||
          responseJson.error.code === 'INVALID_TOKEN')) ||
      (response.status === Auth.ERROR_CODES.UNAUTHORIZED &&
        responseJson &&
        responseJson.error &&
        responseJson.error.code === 'TOKEN_EXPIRED');

    if (shouldDestroy) {
      this.authenticated = false;
      const err = new Error('Invalid or expired token.');
      err.isTokenExpired = true;
      throw err;
    }

    if (!response.ok) {
      // Other server errors
      throw new Error('Failed to refresh token.');
    }

    const data =
      responseJson && responseJson.data
        ? responseJson.data
        : (await response.json()).data;

    this.authenticated = true;
    this.accessToken = data.accessToken;
    this.app.data.auth.accessToken = data.accessToken;

    this.identities = data.identities;
    this.app.data.auth.identities = data.identities;

    // Re-wrap fetch with new token
    this._wrapFetch();
  }

  /**
   * @method set - Sets the user id and tokens.
   * @param {string} userId - The user ID.
   * @param {string} accessToken - The access token.
   * @param {string} refreshToken - The refresh token.
   * @param {string} identities - The identities of the user.
   * @returns {Object} - The data with the tokens set.
   */
  set(userId, accessToken, refreshToken, identities) {
    this.app.data.auth = {
      userId,
      accessToken,
      refreshToken,
      identities,
    };
    this.userId = userId;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.identities = identities;
    this.authenticated = !!(userId && accessToken && refreshToken);
    this._wrapFetch();
    return this.app.data.auth;
  }

  /**
   * @method destroy - Destroys the tokens.
   */
  destroy() {
    this.app.data.auth = {};
    this.userId = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.identities = null;
    this.authenticated = false;
    this._wrapFetch();
  }
}

/**
 * @class Location
 * @description Handles the location of the application.
 */
class Location {
  /**
   * @constructor - Initializes the Location class.
   * @param {Object} app - The App class instance.
   */
  constructor(app) {
    this.app = app;

    this.path = window.location.pathname;

    const searchParams = new URLSearchParams(window.location.search);
    this.params = Object.fromEntries(searchParams.entries());
  }

  /**
   * @method init - Initializes the redirect.
   */
  init() {
    const HOME = '/';
    const AUTH = '/login';
    const FORBIDDEN = 403;

    const actionMatrix = [
      [null, null, null],
      [AUTH, null, null],
      [AUTH, FORBIDDEN, null],
      [null, HOME, HOME],
    ];
    const routeTypeIndex = [
      this.isPublicRoute(this.path),
      this.isUserRoute(this.path),
      this.isAdminRoute(this.path),
      this.isAuthRoute(this.path),
    ].indexOf(true);
    const authStateIndex = [
      !this.app.auth.authenticated,
      this.app.auth.authenticated &&
        !['founder', 'developer', 'admin'].some((role) =>
          this.app.auth.identities.includes(role),
        ),
      this.app.auth.authenticated &&
        ['founder', 'developer', 'admin'].some((role) =>
          this.app.auth.identities.includes(role),
        ),
    ].indexOf(true);
    const action = actionMatrix[routeTypeIndex][authStateIndex];
    if (action) {
      if (action === AUTH) {
        this.redirect(`/login?redirect=${this.path}`);
      } else if (action === FORBIDDEN) {
        this.showForbidden();
      } else if (action === HOME) {
        this.redirect('/');
      } else {
        this.redirect(action);
      }
    }
  }

  /**
   * @method isPublicRoute - Checks if the route is public.
   * @param {string} route - The route to check.
   * @returns {boolean} - True if the route is public, false otherwise.
   */
  isPublicRoute(route) {
    return ['/', '/more', '/404', '/403', '/leaderboards', '/offline'].includes(route);
  }

  /**
   * @method isUserRoute - Checks if the route needs user authentication.
   * @param {string} route - The route to check.
   * @returns {boolean} - True if the route needs user authentication, false otherwise.
   */
  isUserRoute(route) {
    return !(
      this.isPublicRoute(route) ||
      this.isAdminRoute(route) ||
      this.isAuthRoute(route)
    );
  }

  /**
   * @method isAdminRoute - Checks if the route needs admin authentication.
   * @param {string} route - The route to check.
   * @returns {boolean} - True if the route needs admin authentication, false otherwise.
   */
  isAdminRoute(route) {
    return route.startsWith('/admin');
  }

  /**
   * @method isAuthRoute - Checks if the route is for authentication purposes.
   * @param {string} route - The route to check.
   * @returns {boolean} - True if the route is authentication required, false otherwise.
   */
  isAuthRoute(route) {
    return [
      '/login',
      '/register',
      '/register/complete',
      '/password-reset',
      '/password-reset/complete',
    ].includes(route);
  }

  /**
   * @method redirect - Redirects the user to the specified URL.
   * @param {string} url - The URL to redirect to.
   */
  redirect(url) {
    const sanitizedUrl = new URL(url, window.location.origin).href;

    if (
      (sanitizedUrl.startsWith('http') || sanitizedUrl.startsWith('https')) &&
      !sanitizedUrl.startsWith(window.location.origin)
    ) {
      throw new Error('Cannot redirect to an external URL.');
    }

    if (window.location.href !== sanitizedUrl) {
      window.location.href = sanitizedUrl;
    }
  }

  /**
   * @method refresh - Refreshes the page.
   */
  refresh() {
    window.location.reload();
  }

  /**
   * @method showNotFound - Shows the 404 page.
   */
  showNotFound() {
    this.redirect(`/404?path=${this.path}`);
  }

  /**
   * @method showForbidden - Shows the 403 page.
   */
  showForbidden() {
    this.redirect(`/403?path=${this.path}`);
  }
}

/**
 * @class UI
 * @description Handles the user interface of the application.
 */
class UI {
  /**
   * @constructor - Initializes the UI class.
   * @param {Object} app - The App class instance.
   */
  constructor(app) {
    this.app = app;

    this.notifications = new Map();

    this.DEFAULT_ALERT_DURATION = 3000;
  }

  /**
   * @method alert - Displays an alert message at the top-left corner of the page.
   * @param {string} message - The message to display.
   * @param {string} status - The status of the alert (e.g., "success", "info", "warning", "error").
   * @param {number} duration - The duration in milliseconds for which the alert should be visible.
   */
  alert(message, status = 'info', duration = this.DEFAULT_ALERT_DURATION) {
    const FADE_IN_DELAY = 10;
    const FADE_OUT_DURATION = 500;

    const COLOR_CLASSES = {
      success: 'text-green-800 border-green-300 bg-green-50',
      info: 'text-blue-800 border-blue-300 bg-blue-50',
      warning: 'text-yellow-800 border-yellow-300 bg-yellow-50',
      error: 'text-red-800 border-red-300 bg-red-50',
      default: 'text-gray-800 border-gray-300 bg-gray-50',
    };

    const alertBox = document.createElement('div');
    const colorClasses = COLOR_CLASSES[status] || COLOR_CLASSES.default;

    alertBox.className = `fixed right-4 top-4 z-50 p-4 text-sm ${colorClasses} border rounded-lg opacity-0 transition-opacity duration-500`;
    alertBox.role = 'alert';
    alertBox.innerHTML = `
          <div class="flex items-center">
            <span>${message}</span>
          </div>`;

    document.body.appendChild(alertBox);

    setTimeout(() => {
      alertBox.classList.add('opacity-100');
    }, FADE_IN_DELAY);

    setTimeout(() => {
      alertBox.classList.remove('opacity-100');
      alertBox.classList.add('opacity-0');

      setTimeout(() => {
        alertBox.remove();
      }, FADE_OUT_DURATION);
    }, duration);
  }

  /**
   * @method notification - Displays a notification message in an element.
   * @param {string} type - The type of notification.
   * @param {string | string[]} message - The message to display.
   * @param {string} status - The status of the notification.
   * @param {HTMLElement} parentElement - The parent element to append the notification to.
   * @param {string} messageGroup - The message group, auto-removes when a new message is added to the group.
   * @param {boolean} scrollTo - Whether to scroll to the notification.
   * @returns {HTMLElement} The notification element.
   */
  notification(
    type = 'alert',
    message,
    status = 'info',
    parentElement,
    messageGroup,
    scrollTo = false,
  ) {
    const alert = document.createElement('div');

    let colorClasses = '';
    switch (status) {
      case 'success':
        colorClasses = 'text-green-800 border-green-300 bg-green-50';
        break;
      case 'info':
        colorClasses = 'text-gray-800 border-gray-300 bg-gray-50';
        break;
      case 'warning':
        colorClasses = 'text-yellow-800 border-yellow-300 bg-yellow-50';
        break;
      case 'error':
        colorClasses = 'text-red-800 border-red-300 bg-red-50';
        break;
      default:
        colorClasses = 'text-gray-800 border-gray-300 bg-gray-50';
        break;
    }

    if (type === 'alert') {
      alert.className = `flex items-center p-4 mt-2 mb-4 text-sm ${colorClasses} border rounded-lg`;
      alert.role = 'alert';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'flex-shrink-0 inline w-4 h-4 me-3');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('fill', 'currentColor');
      svg.setAttribute('viewBox', '0 0 20 20');

      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path',
      );
      path.setAttribute(
        'd',
        'M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 1 1 1 1v4h1a1 1 0 0 1 0 2Z',
      );
      svg.appendChild(path);

      const srOnly = document.createElement('span');
      srOnly.setAttribute('class', 'sr-only');
      srOnly.textContent = 'Info';

      const div = document.createElement('div');
      const fontMedium = document.createElement('span');
      fontMedium.setAttribute('class', 'font-medium');
      fontMedium.textContent = message;

      div.appendChild(fontMedium);

      alert.appendChild(svg);
      alert.appendChild(srOnly);
      alert.appendChild(div);
    } else if (type === 'list') {
      alert.className = `flex p-4 mt-2 mb-4 text-sm ${colorClasses} rounded-lg`;
      alert.role = 'alert';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'flex-shrink-0 inline w-4 h-4 me-3 mt-[2px]');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('fill', 'currentColor');
      svg.setAttribute('viewBox', '0 0 20 20');

      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path',
      );
      path.setAttribute(
        'd',
        'M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 1 1 1 1v4h1a1 1 0 0 1 0 2Z',
      );
      svg.appendChild(path);

      const srOnly = document.createElement('span');
      srOnly.setAttribute('class', 'sr-only');
      srOnly.textContent = message[0];

      const div = document.createElement('div');

      const fontMedium = document.createElement('span');
      fontMedium.setAttribute('class', 'font-medium');
      fontMedium.textContent = 'Ensure that these requirements are met:';

      const ul = document.createElement('ul');
      ul.setAttribute('class', 'mt-1.5 list-disc list-inside');

      message.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
      });

      div.appendChild(fontMedium);
      div.appendChild(ul);

      alert.appendChild(svg);
      alert.appendChild(srOnly);
      alert.appendChild(div);
    }

    parentElement.appendChild(alert);

    if (messageGroup) {
      if (this.notifications.has(messageGroup)) {
        this.notifications.get(messageGroup).remove();
      }

      this.notifications.set(messageGroup, alert);
    }

    if (scrollTo) {
      alert.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }

    return alert;
  }
}

/**
 * @class Network
 * @description Handles network requests.
 */
class Network {
  /**
   * @constructor - Initializes the Network class.
   * @param {Object} app - The App class instance.
   */
  constructor(app) {
    this.app = app;

    this.online = navigator.onLine;
    this.app.online = this.init();
  }

  /**
   * @method init - Initializes the Network class.
   * @returns {boolean} - True if the user is online, false otherwise.
   */
  init() {
    window.addEventListener('online', () => {
      this.online = true;
      this.app.online = true;
      this.app.ui.alert('You are back online!', 'success');
    });

    window.addEventListener('offline', () => {
      this.online = false;
      this.app.online = false;
      this.app.ui.alert('You are offline!', 'info');
    });

    return this.online;
  }
}

/**
 * @class Utils
 * @description Utility functions for the application.
 */
class Utils {
  /**
   * @method getRank - Gets the rank of the user based on their elo score.
   * @param {number} score - The elo score of the user.
   * @returns {Object} - The rank of the user.
   */
  static getRank(score) {
    const TRIDECCO_SUPREME = 8400;
    const TRIDECCO_DIVISION = 300;
    const ONE_HUNDRED = 100;

    const tiers = [
      { name: 'Iron', divisions: ['I'] },
      { name: 'Bronze', divisions: ['II', 'I'] },
      { name: 'Silver', divisions: ['III', 'II', 'I'] },
      { name: 'Gold', divisions: ['IV', 'III', 'II', 'I'] },
      { name: 'Platinum', divisions: ['V', 'IV', 'III', 'II', 'I'] },
      { name: 'Diamond', divisions: ['VI', 'V', 'IV', 'III', 'II', 'I'] },
      {
        name: 'Tridecco',
        divisions: ['VII', 'VI', 'V', 'IV', 'III', 'II', 'I'],
      },
    ];

    if (score >= TRIDECCO_SUPREME) {
      const stars =
        Math.floor((score - TRIDECCO_SUPREME) / TRIDECCO_DIVISION) + 1;
      return {
        name: `Tridecco S. ★${stars}`,
        tier: 7,
        division: stars,
        nextRankElo: TRIDECCO_SUPREME + stars * TRIDECCO_DIVISION,
        eloToNextRank:
          TRIDECCO_DIVISION - ((score - TRIDECCO_SUPREME) % TRIDECCO_DIVISION),
        progress:
          (((score - TRIDECCO_SUPREME) % TRIDECCO_DIVISION) /
            TRIDECCO_DIVISION) *
          ONE_HUNDRED,
      };
    }

    let base = 0;
    for (let i = 0; i < tiers.length; i++) {
      const divisions = tiers[i].divisions.length;
      const range = divisions * TRIDECCO_DIVISION;
      if (score < base + range) {
        const divisionIndex = Math.floor((score - base) / TRIDECCO_DIVISION);
        const division = divisions - divisionIndex;
        const currentTierMaxElo = base + range;

        return {
          name: `${tiers[i].name} ${tiers[i].divisions[divisions - division]}`,
          tier: i,
          division: division,
          nextRankElo: currentTierMaxElo,
          eloToNextRank: currentTierMaxElo - score,
          progress:
            (((score - base) % TRIDECCO_DIVISION) / TRIDECCO_DIVISION) *
            ONE_HUNDRED,
        };
      }
      base += range;
    }

    return {
      name: 'Unranked',
      tier: -1,
      division: 0,
      nextRankElo: 0,
      eloToNextRank: 0,
      progress: 0,
    };
  }

  /**
   * @method getLevel - Gets the level of the user based on their experience points.
   * @param {number} xp - The experience points of the user.
   * @returns {Object} - The level of the user.
   */
  static getLevel(xp) {
    const BASE_XP = 100;
    const EXPONENTIAL_FACTOR = 2;
    const LEVELS = 50;
    const TITLE_UP = 5;
    const TO_FIXED = 2;
    const ONE_HUNDRED = 100;

    const levelThresholds = (n) => BASE_XP * Math.pow(n, EXPONENTIAL_FACTOR);

    const levels = [
      { title: 'Novice', color: 'Gray', code: '#808080' },
      { title: 'Initiate', color: 'Bronze', code: '#CD7F32' },
      { title: 'Apprentice', color: 'Silver', code: '#C0C0C0' },
      { title: 'Journeyman', color: 'Gold', code: '#FFD700' },
      { title: 'Adept', color: 'Emerald', code: '#50C878' },
      { title: 'Expert', color: 'Sapphire', code: '#0F52BA' },
      { title: 'Master', color: 'Amethyst', code: '#9966CC' },
      { title: 'Grandmaster', color: 'Ruby', code: '#E0115F' },
      { title: 'Legend', color: 'Platinum', code: '#E5E4E2' },
      { title: 'Mythic', color: 'Diamond', code: '#B9F2FF' },
      { title: 'Ascendant', color: 'Agate', code: '#A8C3BC' },
    ];

    const maxXpThreshold = levelThresholds(LEVELS);
    let level = 0;

    if (xp >= maxXpThreshold) {
      level = LEVELS;
    } else {
      for (let i = 1; i <= LEVELS; i++) {
        if (xp < levelThresholds(i)) {
          level = i - 1;
          break;
        }
      }
    }

    const isMaxLevel = level === LEVELS;

    const nextLevelXp = isMaxLevel ? null : levelThresholds(level + 1);
    const currentLevelXp = levelThresholds(level);
    const progress = isMaxLevel
      ? ONE_HUNDRED
      : ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * ONE_HUNDRED;
    const xpToNextLevel = isMaxLevel ? 0 : nextLevelXp - xp;

    const titleIndex = Math.min(
      Math.floor(level / TITLE_UP),
      levels.length - 1,
    );
    const levelTitle = levels[titleIndex];

    return {
      level: level,
      title: levelTitle.title,
      color: levelTitle.color,
      colorCode: levelTitle.code,
      nextLevelXp: isMaxLevel ? 'Max Level Reached' : nextLevelXp,
      xpToNextLevel: xpToNextLevel,
      progress: progress.toFixed(TO_FIXED),
    };
  }
}

/**
 * @class App
 * @description Main application class.
 */
class App {
  /**
   * @constructor - Initializes the App class.
   * @param {string} cdnURL - The CDN URL of the application.
   * @param {string} apiURL - The API URL of the application.
   */
  constructor(cdnURL, apiURL) {
    this.cdnURL = cdnURL;
    this.baseURL = window.location.origin;
    this.apiURL = apiURL;

    this.data = new Data(this);
    this.cache = new Cache(this);
    this.auth = new Auth(this);
    this.location = new Location(this);
    this.ui = new UI(this);
    this.network = new Network(this);
    this.utils = Utils;

    this.init();
  }

  /**
   * @method init - Initializes the App class.
   */
  async init() {
    this.auth.init();
    this.location.init();
  }
}

// Initialize the App (Client-side)
const app = new App(CDN_URL, API_URL);

window.app = app;
