/**
 * @fileoverview Game History Management
 * @description Implements the GameHistory class to manage and analyze game history data.
 */

class GameHistory {
  /**
   * @param {Array<Object>} historyArray - A reference to the array where game records will be stored.
   */
  constructor(historyArray) {
    if (!Array.isArray(historyArray)) {
      throw new Error('GameHistory must be initialized with an array.');
    }
    /**
     * @private
     * @type {Array<Object>}
     */
    this.history = historyArray;
  }

  /**
   * @method addGame - Adds a new game record to the history.
   * @param {object} gameResult The result object from a completed game.
   * @param {boolean} gameResult.won - Whether the player won.
   * @param {string} gameResult.difficulty - The difficulty level string.
   * @param {object} gameResult.score - The detailed score object.
   */
  addGame(gameResult) {
    const newRecord = {
      timestamp: new Date().toISOString(),
      won: gameResult.won,
      difficulty: gameResult.difficulty,
      score: {
        total: gameResult.score.total || 0,
        base: gameResult.score.base || 0,
        combo: gameResult.score.combo || 0,
        preview: gameResult.score.preview || 0,
        opponentPieces: gameResult.score.opponentPieces || 0,
        difficultyBonus: gameResult.score.difficulty || 0,
      },
    };
    this.history.push(newRecord);
  }

  /**
   * @method getHistory - Retrieves a sorted copy of the game history.
   * @returns {Array<Object>} - A sorted copy of the game history.
   */
  getHistory() {
    return [...this.history].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );
  }

  /**
   * @method getStatistics - Computes overall and per-difficulty statistics.
   * @returns {object} - An object containing overall and per-difficulty statistics.
   */
  getStatistics() {
    const statsTemplate = () => ({
      highScore: 0,
      winRate: 0,
      totalGames: 0,
      wins: 0,
    });

    const result = {
      overall: statsTemplate(),
      byDifficulty: {},
    };

    if (this.history.length === 0) {
      return result;
    }

    for (const game of this.history) {
      const difficulty = game.difficulty;

      result.overall.totalGames++;
      result.overall.highScore = Math.max(
        result.overall.highScore,
        game.score.total,
      );
      if (game.won) {
        result.overall.wins++;
      }

      if (!result.byDifficulty[difficulty]) {
        result.byDifficulty[difficulty] = statsTemplate();
      }
      const diffStats = result.byDifficulty[difficulty];
      diffStats.totalGames++;
      diffStats.highScore = Math.max(diffStats.highScore, game.score.total);
      if (game.won) {
        diffStats.wins++;
      }
    }

    const calculateWinRate = (statsObj) => {
      if (statsObj.totalGames > 0) {
        const HUNDRED = 100;
        statsObj.winRate = parseFloat(
          ((statsObj.wins / statsObj.totalGames) * HUNDRED).toFixed(1),
        );
      }
    };

    calculateWinRate(result.overall);
    for (const difficulty in result.byDifficulty) {
      calculateWinRate(result.byDifficulty[difficulty]);
    }

    return result;
  }
}

window.GameHistory = GameHistory;
