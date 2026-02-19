class TabManager {
  constructor(api, apiService, statsFormatter, bwuInstance) {
    this.api = api;
    this.apiService = apiService;
    this.statsFormatter = statsFormatter;
    this.bwu = bwuInstance;
    this.managedPlayers = new Map();
    
    // Tab alternation state
    this.showingGameStats = false;
    this.tabAlternationInterval = null;
    this.cachedRegularStats = new Map(); // Store regular stats suffixes
  }

  /**
   * Start alternating between regular stats and game stats in tab
   */
  startTabAlternation() {
    if (this.tabAlternationInterval) {
      return; // Already running
    }

    if (!this.api.config.get("inGameTracker.showInTab")) {
      return; // Feature disabled
    }

    const delaySeconds = this.api.config.get("inGameTracker.tabDelay") || 5;
    const delayMs = delaySeconds * 1000;

    this.api.debugLog(`[BWU TabManager] Starting tab alternation with ${delaySeconds}s delay`);

    this.tabAlternationInterval = setInterval(() => {
      this._toggleTabStats();
    }, delayMs);
  }

  /**
   * Stop tab alternation and restore regular stats
   */
  stopTabAlternation() {
    if (this.tabAlternationInterval) {
      clearInterval(this.tabAlternationInterval);
      this.tabAlternationInterval = null;
    }

    // Restore regular stats
    if (this.showingGameStats) {
      this.showingGameStats = false;
      this._restoreRegularStats();
    }

    this.cachedRegularStats.clear();
    this.api.debugLog(`[BWU TabManager] Stopped tab alternation`);
  }

  /**
   * Toggle between regular stats and game stats display
   */
  _toggleTabStats() {
    if (!this.bwu.inGameTracker.isTracking) {
      return; // No game in progress
    }

    this.showingGameStats = !this.showingGameStats;

    if (this.showingGameStats) {
      this._showGameStats();
    } else {
      this._restoreRegularStats();
    }
  }

  /**
   * Show game stats in tab for all managed players
   */
  _showGameStats() {
    for (const [playerName, data] of this.managedPlayers.entries()) {
      if (!data.uuid) continue;

      // Get game stats for this player
      const gameStats = this.bwu.inGameTracker.getPlayerStats(playerName);
      if (!gameStats) continue;

      const gameStatsSuffix = this.statsFormatter.formatGameStatsForTab(gameStats);
      if (gameStatsSuffix) {
        this.api.setDisplayNameSuffix(data.uuid, gameStatsSuffix);
      }
    }
  }

  /**
   * Restore regular stats from cache
   */
  _restoreRegularStats() {
    for (const [playerName, data] of this.managedPlayers.entries()) {
      if (!data.uuid) continue;

      const cachedSuffix = this.cachedRegularStats.get(playerName);
      if (cachedSuffix) {
        this.api.setDisplayNameSuffix(data.uuid, cachedSuffix);
      }
    }
  }

  /**
   * Update game stats for a specific player (called when stats change)
   */
  updatePlayerGameStats(playerName) {
    if (!this.showingGameStats) return;
    if (!this.api.config.get("inGameTracker.showInTab")) return;

    const data = this.managedPlayers.get(playerName);
    if (!data?.uuid) return;

    const gameStats = this.bwu.inGameTracker.getPlayerStats(playerName);
    if (!gameStats) return;

    const gameStatsSuffix = this.statsFormatter.formatGameStatsForTab(gameStats);
    if (gameStatsSuffix) {
      this.api.setDisplayNameSuffix(data.uuid, gameStatsSuffix);
    }
  }
  clearManagedPlayers(type = "all") {
    for (const [name, data] of this.managedPlayers.entries()) {
      if (type === "all" || data.type === type) {
        if (data.uuid) {
          this.api.clearDisplayNameSuffix(data.uuid);
        }
        this.managedPlayers.delete(name);
        this.cachedRegularStats.delete(name);
      }
    }
  }

  async addPlayerStatsToTab(originalPlayerName, resolvedPlayerName) {
    try {
      let player = null;
      const me = this.api.getCurrentPlayer();
      const myRealName = me ? me.name : null;

      if (
        myRealName &&
        resolvedPlayerName.toLowerCase() === myRealName.toLowerCase()
      ) {
        player = me;
        const playerByNick = this.api.getPlayerByName(originalPlayerName);
        if (playerByNick) {
          player.uuid = playerByNick.uuid;
        }
      } else {
        player = this.api.getPlayerByName(originalPlayerName);
      }

      if (!player?.uuid) {
        return;
      }
      if (this.managedPlayers.has(originalPlayerName)) return;

      const finalNameForStats = resolvedPlayerName || originalPlayerName;

      const promises = [this.apiService.getPlayerStats(finalNameForStats)];

      if (this.api.config.get("stats.showPing")) {
        const pingPromise = (async () => {
          const realUuid = await this.apiService.getUuid(finalNameForStats);
          if (realUuid) {
            return this.apiService.getPlayerPing(realUuid);
          }
          return null;
        })();
        promises.push(pingPromise);
      } else {
        promises.push(Promise.resolve(null));
      }

      const [stats, ping] = await Promise.all(promises);

      const statsSuffix = this.statsFormatter.formatStats(
        "tab",
        finalNameForStats,
        stats,
        ping
      );

      // Cache the regular stats suffix for alternation
      this.cachedRegularStats.set(originalPlayerName, statsSuffix);

      // Only set regular stats if not currently showing game stats
      if (!this.showingGameStats) {
        this.api.setDisplayNameSuffix(player.uuid, statsSuffix);
      } else {
        // If showing game stats, show game stats for this player too
        const gameStats = this.bwu.inGameTracker.getPlayerStats(originalPlayerName);
        if (gameStats) {
          const gameStatsSuffix = this.statsFormatter.formatGameStatsForTab(gameStats);
          this.api.setDisplayNameSuffix(player.uuid, gameStatsSuffix || statsSuffix);
        } else {
          this.api.setDisplayNameSuffix(player.uuid, statsSuffix);
        }
      }

      this.managedPlayers.set(originalPlayerName, {
        type: "auto-stats",
        uuid: player.uuid,
      });
    } catch (error) {
      console.error(
        `[BWU] Failed to add stats to tab for ${originalPlayerName}: ${error.stack}`
      );
    }
  }
}

module.exports = TabManager;
