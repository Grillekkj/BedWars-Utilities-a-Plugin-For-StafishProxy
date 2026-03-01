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

  _getRankDisplay(player) {
    const colorMap = {
      BLACK: "§0",
      DARK_BLUE: "§1",
      DARK_GREEN: "§2",
      DARK_AQUA: "§3",
      DARK_RED: "§4",
      DARK_PURPLE: "§5",
      GOLD: "§6",
      GRAY: "§7",
      DARK_GRAY: "§8",
      BLUE: "§9",
      GREEN: "§a",
      AQUA: "§b",
      RED: "§c",
      LIGHT_PURPLE: "§d",
      YELLOW: "§e",
      WHITE: "§f",
    };

    let plusColor = "§c";
    if (player.rankPlusColor && colorMap[player.rankPlusColor]) {
      plusColor = colorMap[player.rankPlusColor];
    }

    // Need to check this shit ai made this bitch ass code
    if (player.rank && player.rank !== "NORMAL") {
      const r = player.rank;
      if (r === "YOUTUBER") return "§c[§fYOUTUBE§c]";
      if (r === "GAME_MASTER") return "§2[GM]";
      if (r === "ADMIN") return "§c[ADMIN]";
      if (r === "MODERATOR") return "§2[MOD]";
      if (r === "HELPER") return "§9[HELPER]";
      if (r === "MAYOR") return "§d[MAYOR]";
    }

    if (player.monthlyPackageRank === "SUPERSTAR") {
      let rankColor = "§6";
      if (player.monthlyRankColor === "AQUA") rankColor = "§b";
      return `${rankColor}[MVP${plusColor}++${rankColor}]`;
    }

    if (player.newPackageRank === "MVP_PLUS") {
      return `§b[MVP${plusColor}+§b]`;
    }

    if (player.newPackageRank === "MVP") {
      return "§b[MVP]";
    }

    if (player.newPackageRank === "VIP_PLUS") {
      return "§a[VIP§6+§a]";
    }

    if (player.newPackageRank === "VIP") {
      return "§a[VIP]";
    }

    return "§7";
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

      const rankDisplay = this._getRankDisplay(data.player);      const stats = data.player.stats?.Bedwars || {};
      const finalKills = stats.final_kills_bedwars || 0;
      const finalDeaths = stats.final_deaths_bedwars || 0;
      const wins = stats.wins_bedwars || 0;
      const losses = stats.losses_bedwars || 0;
      const kills = stats.kills_bedwars || 0;
      const deaths = stats.deaths_bedwars || 0;
      const bedsBroken = stats.beds_broken_bedwars || 0;
      const bedsLost = stats.beds_lost_bedwars || 0;

      const relevantStats = {
        rank: rankDisplay,
        isNicked: false,
        stars: data.player.achievements?.bedwars_level || 0,
        fkdr: finalKills / Math.max(1, finalDeaths),
        kdr: kills / Math.max(1, deaths),
        wlr: wins / Math.max(1, losses),
        bblr: bedsBroken / Math.max(1, bedsLost),
        final_kills: finalKills,
        final_deaths: finalDeaths,
        kills: kills,
        deaths: deaths,
        beds_broken: bedsBroken,
        beds_lost: bedsLost,
        winstreak: stats.winstreak || 0,
        wins: wins,
        losses: losses,
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
      const apiKey = this.api.config.get("main.auroraApiKey");
      if (!apiKey || apiKey === "YOUR_AURORA_API_KEY_HERE") return null;

      const response = await fetch(
        `https://bordic.xyz/api/v2/resources/ping?key=${apiKey}&uuid=${uuid}`
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (!data.success || !Array.isArray(data.data) || data.data.length === 0)
        return null;

      const avgPing = Math.round(data.data[0].avg);
      this.cache.setPing(uuid, avgPing);
      return avgPing;
    } catch (error) {
      console.error(
        `[BWU AURORA API] Failed to fetch ping for ${uuid}: ${error.message}`
      );
      return null;
    }
  }

  async getNameHistory(playerName) {
    try {
      const response = await fetch(
        `https://laby.net/api/v3/search/profiles/${playerName}`
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (
        !data.users ||
        !Array.isArray(data.users) ||
        data.users.length === 0
      ) {
        return null;
      }

      const user = data.users[0];
      if (!user.history || !Array.isArray(user.history)) {
        return null;
      }

      return {
        currentName: user.name,
        uuid: user.uuid,
        history: user.history.map((entry) => ({
          name: entry.name,
          changedAt: entry.changed_at,
          accurate: entry.accurate,
          lastSeenAt: entry.last_seen_at,
        })),
      };
    } catch (error) {
      console.error(
        `[BWU LABY API] Failed to fetch name history for ${playerName}: ${error.message}`
      );
      return null;
    }
  }
}

module.exports = ApiService;
