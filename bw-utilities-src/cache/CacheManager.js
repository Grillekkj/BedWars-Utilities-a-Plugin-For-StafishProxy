class CacheManager {
  constructor(api) {
    this.api = api;
    this.playerStatsCache = new Map();
    this.pingCache = new Map();
    this.uuidCache = new Map();
  }

  getPlayerStats(playerName) {
    const lowerCaseName = playerName.toLowerCase();
    const cacheTTL =
      (this.api.config.get("performance.cacheTTL") || 300) * 1000;
    const cached = this.playerStatsCache.get(lowerCaseName);

    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      return cached.data;
    }
    return null;
  }

  setPlayerStats(playerName, stats) {
    const lowerCaseName = playerName.toLowerCase();
    this.playerStatsCache.set(lowerCaseName, {
      data: stats,
      timestamp: Date.now(),
    });
  }

  getPing(uuid) {
    const pingCacheTTL =
      (this.api.config.get("performance.pingCacheTTL") || 60) * 1000;
    const cached = this.pingCache.get(uuid);

    if (cached && Date.now() - cached.timestamp < pingCacheTTL) {
      return cached.data;
    }
    return null;
  }

  setPing(uuid, ping) {
    this.pingCache.set(uuid, { data: ping, timestamp: Date.now() });
  }

  getUuid(playerName) {
    return this.uuidCache.get(playerName.toLowerCase());
  }

  setUuid(playerName, uuid) {
    this.uuidCache.set(playerName.toLowerCase(), uuid);
  }
}

module.exports = CacheManager;

