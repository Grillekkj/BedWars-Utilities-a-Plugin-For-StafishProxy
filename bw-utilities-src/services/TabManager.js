class TabManager {
  constructor(api, apiService, statsFormatter) {
    this.api = api;
    this.apiService = apiService;
    this.statsFormatter = statsFormatter;
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

  async addPlayerStatsToTab(playerName) {
    try {
      const player = this.api.getPlayerByName(playerName);
      if (!player?.uuid) return;
      if (this.managedPlayers.has(playerName)) return;

      const promises = [this.apiService.getPlayerStats(playerName)];

      if (this.api.config.get("stats.showPing") && player.uuid) {
        promises.push(this.apiService.getPlayerPing(player.uuid));
      } else {
        promises.push(Promise.resolve(null));
      }

      const [stats, ping] = await Promise.all(promises);
      //suffix
      const statsSuffix = this.statsFormatter.formatStats(
        "tab",
        null,
        stats,
        ping
      );

      this.api.setDisplayNameSuffix(player.uuid, statsSuffix);
      this.managedPlayers.set(playerName, {
        type: "auto-stats",
        uuid: player.uuid,
      });
    } catch (error) {
      console.error(
        `[BWU] Failed to add stats to tab for ${playerName}: ${error.stack}`
      );
    }
  }
}

module.exports = TabManager;
