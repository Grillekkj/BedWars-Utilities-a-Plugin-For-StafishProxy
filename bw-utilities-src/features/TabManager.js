class TabManager {
  constructor(api, apiService, statsFormatter, bwuInstance) {
    this.api = api;
    this.apiService = apiService;
    this.statsFormatter = statsFormatter;
    this.bwu = bwuInstance;
    this.managedPlayers = new Map();
  }

  clearManagedPlayers(type = "all") {
    for (const [name, data] of this.managedPlayers.entries()) {
      if (type === "all" || data.type === type) {
        if (data.uuid) {
          this.api.clearDisplayNameSuffix(data.uuid);
        }
        this.managedPlayers.delete(name);
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

      this.api.setDisplayNameSuffix(player.uuid, statsSuffix);
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
