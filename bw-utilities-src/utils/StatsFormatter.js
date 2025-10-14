class StatsFormatter {
  constructor(api) {
    this.api = api;
  }

  getStarColor(stars) {
    if (stars === undefined || stars === null) return "§7";
    if (stars < 100) return "§7";
    if (stars < 200) return "§f";
    if (stars < 300) return "§6";
    if (stars < 400) return "§b";
    if (stars < 500) return "§2";
    if (stars < 600) return "§3";
    if (stars < 700) return "§4";
    if (stars < 800) return "§d";
    if (stars < 900) return "§9";
    if (stars < 1000) return "§5";

    const prestige = Math.floor(stars / 1000);
    const colors = ["§c", "§6", "§b", "§a", "§d", "§5", "§f", "§e", "§1", "§7"];
    return colors[prestige - 1] || "§5";
  }

  applyColor(field, value) {
    if (value === undefined || value === null) return "§c";

    const defaults = {
      fkdr: [
        { max: 0.99, color: "§7" },
        { max: 1.99, color: "§f" },
        { max: 4.99, color: "§a" },
        { max: 9.99, color: "§2" },
        { max: 49.99, color: "§6" },
        { min: 50, color: "§c" },
      ],
      winstreak: [
        { max: 0, color: "§7" },
        { max: 4, color: "§f" },
        { max: 14, color: "§a" },
        { min: 15, color: "§c" },
      ],
    };

    const fieldDefaults = defaults[field.toLowerCase()];
    if (fieldDefaults) {
      for (const rule of fieldDefaults) {
        if (
          (rule.min === undefined || value >= rule.min) &&
          (rule.max === undefined || value <= rule.max)
        ) {
          return rule.color;
        }
      }
    }
    return `§f`;
  }

  formatStatsSuffix(stats, ping) {
    const notFound = "§c?";
    const parts = [];

    if (!stats || stats.isNicked) {
      parts.push(notFound);
      parts.push(`§bFKDR ${notFound}`);
      parts.push(`§aFK ${notFound}`);
      parts.push(`§cFD ${notFound}`);
      parts.push(`§6Beds ${notFound}`);
      parts.push(`§bWS ${notFound}`);
    } else {
      const formatStat = (value) =>
        value !== undefined && value !== null ? `${value}` : notFound;

      const starsValue =
        stats.stars !== undefined && stats.stars !== null
          ? `${this.getStarColor(stats.stars)}[${stats.stars}✫]`
          : notFound;
      parts.push(starsValue);

      const fkdrValue = `${this.applyColor(
        "fkdr",
        stats.fkdr
      )}${stats.fkdr.toFixed(2)}`;
      parts.push(`§bFKDR ${fkdrValue}`);
      parts.push(`§aFK ${formatStat(stats.final_kills)}`);
      parts.push(`§cFD ${formatStat(stats.final_deaths)}`);
      parts.push(`§6Beds ${formatStat(stats.beds_broken)}`);

      const wsValue = `${this.applyColor(
        "winstreak",
        stats.winstreak
      )}${formatStat(stats.winstreak)}`;
      parts.push(`§bWS ${wsValue}`);
    }

    const pingValue = typeof ping === "number" ? `§a${ping}ms` : notFound;
    parts.push(pingValue);

    return ` §f| ${parts.join(" §f| ")}`;
  }

  formatStatsMessage(playerName, stats, ping) {
    const parts = [];

    if (stats.isNicked) {
      parts.push(`§cNicked`);
    } else {
      if (this.api.config.get("stats.showStars"))
        parts.push(`${this.getStarColor(stats.stars)}[${stats.stars}✫]`);

      if (this.api.config.get("stats.showFkdr")) {
        const fkdrColor = this.applyColor("fkdr", stats.fkdr);
        parts.push(`§bFKDR: ${fkdrColor}${stats.fkdr.toFixed(2)}`);
      }

      if (this.api.config.get("stats.showFK"))
        parts.push(`§aFK: ${stats.final_kills}`);
      if (this.api.config.get("stats.showFD"))
        parts.push(`§cFD: ${stats.final_deaths}`);
      if (this.api.config.get("stats.showBeds"))
        parts.push(`§6Beds: ${stats.beds_broken}`);

      if (this.api.config.get("stats.showWinstreak")) {
        const wsColor = this.applyColor("winstreak", stats.winstreak);
        parts.push(`§bWS: ${wsColor}${stats.winstreak}`);
      }
    }

    if (this.api.config.get("stats.showPing") && ping) {
      parts.push(`§aPing: ${ping}ms`);
    }

    let playerNameDisplay = playerName;
    const playerObject = this.api.getPlayerByName(playerName);
    if (playerObject?.team?.prefix) {
      playerNameDisplay = `${playerObject.team.prefix}${playerName}`;
    }
    return `${this.api.getPrefix()} ${playerNameDisplay} §8- §7${parts.join(
      " §8|§7 "
    )}`;
  }
}

module.exports = StatsFormatter;

