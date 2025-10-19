class ApiService {
  constructor(api, cacheManager) {
    this.api = api;
    this.cache = cacheManager;
  }

  async testHypixelApiKey() {
    try {
      const apiKey = this.api.config.get("main.hypixelApiKey");
      if (!apiKey || apiKey === "YOUR_HYPIXEL_API_KEY_HERE") {
        return { isValid: false, reason: "API key not set." };
      }

      const response = await fetch(`https://api.hypixel.net/v2/counts`, {
        headers: { "API-Key": apiKey },
      });

      const data = await response.json();

      if (data.success) {
        return { isValid: true };
      } else {
        return { isValid: false, reason: data.cause || "Invalid API key." };
      }
    } catch (error) {
      console.error(`[BWU HYPIXEL API] API key test failed: ${error.message}`);
      return { isValid: false, reason: "Failed to connect to Hypixel API." };
    }
  }

  async getUuid(playerName) {
    // try to get uuid from starfish first
    const playerFromProxy = this.api.getPlayerByName(playerName);
    if (playerFromProxy?.uuid) {
      return playerFromProxy.uuid;
    }

    // try to use cache to get uuid if starfish fails
    const cached = this.cache.getUuid(playerName);
    if (cached) return cached;

    // use mojang api to get uuid if starfish and cache fails
    try {
      const response = await fetch(
        `https://api.mojang.com/users/profiles/minecraft/${playerName}`
      );
      if (!response.ok) return null;

      const data = await response.json();
      this.cache.setUuid(playerName, data.id);
      return data.id;
    } catch (error) {
      console.error(
        `[BWU MOJANG API] Failed to fetch UUID for ${playerName}: ${error.message}`
      );
      return null;
    }
  }

  async getPlayerStats(playerName) {
    const cached = this.cache.getPlayerStats(playerName);
    if (cached) return cached;

    try {
      const apiKey = this.api.config.get("main.hypixelApiKey");
      if (!apiKey || apiKey === "YOUR_HYPIXEL_API_KEY_HERE") return null;

      const uuid = await this.getUuid(playerName);
      if (!uuid) return { isNicked: true };

      const response = await fetch(
        `https://api.hypixel.net/v2/player?uuid=${uuid}`,
        { headers: { "API-Key": apiKey } }
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (!data.success || !data.player) return { isNicked: true };

      const stats = data.player.stats?.Bedwars || {};
      const finalKills = stats.final_kills_bedwars || 0;
      const finalDeaths = stats.final_deaths_bedwars || 0;
      const wins = stats.wins_bedwars || 0;
      const losses = stats.losses_bedwars || 0;

      const relevantStats = {
        isNicked: false,
        stars: data.player.achievements?.bedwars_level || 0,
        fkdr: finalKills / Math.max(1, finalDeaths),
        final_kills: finalKills,
        final_deaths: finalDeaths,
        beds_broken: stats.beds_broken_bedwars || 0,
        winstreak: stats.winstreak || 0,
        wins: wins,
        losses: losses,
        wlr: wins / Math.max(1, losses),
      };

      this.cache.setPlayerStats(playerName, relevantStats);
      return relevantStats;
    } catch (error) {
      console.error(
        `[BWU HYPIXEL API] Failed to fetch player stats for ${playerName}: ${error.message}`
      );
      return null;
    }
  }

  async getPlayerPing(uuid) {
    const cached = this.cache.getPing(uuid);
    if (cached !== null) return cached;

    try {
      const apiKey = this.api.config.get("main.polsuApiKey");
      if (!apiKey || apiKey === "YOUR_POLSU_API_KEY_HERE") return null;

      const response = await fetch(
        `https://api.polsu.xyz/polsu/ping?uuid=${uuid}`,
        { headers: { "API-Key": apiKey } }
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (!data.success || !data.data?.stats?.avg) return null;

      const avgPing = Math.round(data.data.stats.avg);
      this.cache.setPing(uuid, avgPing);
      return avgPing;
    } catch (error) {
      console.error(
        `[BWU POLSU API] Failed to fetch ping for ${uuid}: ${error.message}`
      );
      return null;
    }
  }
}

module.exports = ApiService;

