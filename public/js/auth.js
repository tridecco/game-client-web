/**
 * The authentication class.
 * @module js/auth
 */

class Auth {
  /**
   * Get email verification code.
   * @param {string} email - The user's email.
   */
  async getEmailVerificationCode(email) {
    const response = await fetch(`${app.serverUrl}/users/verification-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      credentials: "include",
    });

    const data = await response.json();

    return data;
  }

  /**
   * Log in.
   * @param {string} identifier - The user's identifier.
   * @param {string} password - The user's password.
   */
  async login(identifier, password) {
    const response = await fetch(`${app.serverUrl}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
      credentials: "include",
    });

    const data = await response.json();

    return data;
  }

  /**
   * Two-factor authentication.
   * @param {string} code - The two-factor authentication code.
   */
  async twoFactorAuthentication(code) {
    code = parseInt(code);

    const response = await fetch(`${app.serverUrl}/users/2fa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
      credentials: "include",
    });

    const data = await response.json();

    return data;
  }

  /**
   * Register.
   * @param {string} username - The user's username.
   * @param {string} email - The user's email.
   * @param {string} code - The verification code.
   * @param {string} password - The user's password.
   */
  async register(username, email, code, password) {
    code = parseInt(code);

    const response = await fetch(`${app.serverUrl}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, code, password }),
      credentials: "include",
    });

    const data = await response.json();

    return data;
  }

  /**
   * Password reset.
   * @param {string} email - The user's email.
   * @param {string} code - The verification code.
   * @param {string} password - The user's password.
   */
  async passwordReset(email, code, password) {
    code = parseInt(code);

    const response = await fetch(
      `${app.serverUrl}/users/reset-password-by-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code, password }),
        credentials: "include",
      }
    );

    const data = await response.json();

    return data;
  }
}
