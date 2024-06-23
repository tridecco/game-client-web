/**
 * The authentication class.
 * @module js/auth
 */

class Auth {
  /**
   * Create a new Auth object.
   */
  constructor() {
    this.authenticated = null;
  }

  /**
   * Remove last notification.
   */
  removeLastNotification() {
    if (this.lastNotification) {
      this.lastNotification.remove();
    }
  }

  /**
   * Get email verification code.
   * @param {string} email - The user's email.
   */
  async getEmailVerificationCode(email) {
    this.removeLastNotification();

    const response = await fetch(`${app.serverUrl}/users/verification-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (data.status === "success") {
      this.lastNotification = app.notification(
        "alert",
        data.message,
        "success",
        document.getElementById("auth-form")
      );
    } else {
      this.lastNotification = app.notification(
        "alert",
        data.message,
        "error",
        document.getElementById("auth-form")
      );
    }
  }

  /**
   * Log in.
   * @param {string} identifier - The user's identifier.
   * @param {string} password - The user's password.
   */
  async login(identifier, password) {
    this.removeLastNotification();

    const response = await fetch(`${app.serverUrl}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json();
    const userData = data.data;

    if (data.status === "success") {
      if (data.message === "User logged in successfully. 2FA required.") {
        localStorage.setItem("userEmail", userData.email);

        setTimeout(() => {
          window.location.href = "/two-factor-authentication";
        }, 2000);
      } else {
        this.authenticated = true;

        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }

      this.lastNotification = app.notification(
        "alert",
        data.message,
        "success",
        document.getElementById("auth-form")
      );
    } else {
      this.lastNotification = app.notification(
        "alert",
        data.message,
        "error",
        document.getElementById("auth-form")
      );
    }
  }

  /**
   * Two-factor authentication.
   * @param {string} code - The two-factor authentication code.
   */
  async twoFactorAuthentication(code) {
    this.removeLastNotification();

    code = parseInt(code);

    const response = await fetch(`${app.serverUrl}/users/2fa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    if (data.status === "success") {
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);

      localStorage.removeItem("userEmail");

      this.lastNotification = app.notification(
        "alert",
        data.message,
        "success",
        document.getElementById("auth-form")
      );
    } else {
      if (data.error.code === "NOT_LOGGED_IN") {
        window.location.href = "/login";
      }

      this.lastNotification = app.notification(
        "alert",
        data.message,
        "error",
        document.getElementById("auth-form")
      );
    }
  }

  /**
   * Register.
   * @param {string} username - The user's username.
   * @param {string} email - The user's email.
   * @param {string} code - The verification code.
   * @param {string} password - The user's password.
   */
  async register(username, email, code, password) {
    this.removeLastNotification();

    code = parseInt(code);

    const response = await fetch(`${app.serverUrl}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, code, password }),
    });

    const data = await response.json();
    const userData = data.data;

    if (data.status === "success") {
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);

      this.lastNotification = app.notification(
        "alert",
        data.message,
        "success",
        document.getElementById("auth-form")
      );
    } else {
      this.lastNotification = app.notification(
        "alert",
        data.message,
        "error",
        document.getElementById("auth-form")
      );
    }
  }

  /**
   * Password reset.
   * @param {string} email - The user's email.
   * @param {string} code - The verification code.
   * @param {string} password - The user's password.
   */
  async passwordReset(email, code, password) {
    this.removeLastNotification();

    code = parseInt(code);

    const response = await fetch(
      `${app.serverUrl}/users/reset-password-by-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code, password }),
      }
    );

    const data = await response.json();

    if (data.status === "success") {
      this.lastNotification = app.notification(
        "alert",
        data.message,
        "success",
        document.getElementById("auth-form")
      );
    } else {
      this.lastNotification = app.notification(
        "alert",
        data.message,
        "error",
        document.getElementById("auth-form")
      );
    }
  }
}
