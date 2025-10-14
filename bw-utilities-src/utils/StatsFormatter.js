class StatsFormatter {
  constructor(api) {
    this.api = api;
  }

  formatMythicNumber(stars, colorPattern) {
    const starStr = stars.toString();
    const firstDigit = starStr.charAt(0);
    const middleDigits = starStr.substring(1, starStr.length - 1);
    const lastDigit = starStr.charAt(starStr.length - 1);

    return `${colorPattern[0]}${firstDigit}${colorPattern[1]}${middleDigits}${colorPattern[2]}${lastDigit}`;
  }

  getPrestigeTag(stars) {
    const prestige = Math.floor(stars / 100);
    let symbol;

    if (stars < 1100) {
      symbol = "✫";
    } else if (stars < 2100) {
      symbol = "✪";
    } else {
      symbol = "⚝";
    }

    // Prestiges 0-999
    if (prestige < 10) {
      const colors = [
        "§7",
        "§f",
        "§6",
        "§b",
        "§2",
        "§3",
        "§4",
        "§d",
        "§9",
        "§5",
      ];
      return `${colors[prestige]}[${stars}${symbol}]`;
    }

    // Prestiges 1000+
    switch (prestige) {
      case 10: {
        return `§c[§6${stars.toString()[0]}§e${stars.toString()[1]}§a${
          stars.toString()[2]
        }§b${stars.toString()[3]}§d${symbol}§5]`;
      }
      case 11:
        return `§7[§f${stars}§7${symbol}]`;
      case 12:
        return `§7[§e${stars}§6${symbol}§7]`;
      case 13:
        return `§7[§b${stars}§3${symbol}§7]`;
      case 14:
        return `§7[§a${stars}§2${symbol}§7]`;
      case 15:
        return `§7[§3${stars}§9${symbol}§7]`;
      case 16:
        return `§7[§c${stars}§4${symbol}§7]`;
      case 17:
        return `§7[§d${stars}§5${symbol}§7]`;
      case 18:
        return `§7[§9${stars}§1${symbol}§7]`;
      case 19:
        return `§7[§5${stars}§8${symbol}§7]`;

      case 20:
        return `§8[${this.formatMythicNumber(stars, [
          "§7",
          "§f",
          "§7",
        ])}${symbol}§8]`;
      case 21:
        return `§f[${this.formatMythicNumber(stars, [
          "§f",
          "§e",
          "§6",
        ])}${symbol}]`;
      case 22:
        return `§6[${this.formatMythicNumber(stars, [
          "§6",
          "§f",
          "§b",
        ])}${symbol}§3]`;
      case 23:
        return `§5[${this.formatMythicNumber(stars, [
          "§5",
          "§d",
          "§6",
        ])}${symbol}§e]`;
      case 24:
        return `§b[${this.formatMythicNumber(stars, [
          "§b",
          "§f",
          "§7",
        ])}${symbol}§8]`;
      case 25:
        return `§f[${this.formatMythicNumber(stars, [
          "§f",
          "§a",
          "§2",
        ])}${symbol}]`;
      case 26:
        return `§4[${this.formatMythicNumber(stars, [
          "§4",
          "§c",
          "§d",
        ])}${symbol}§5]`;
      case 27:
        return `§e[${this.formatMythicNumber(stars, [
          "§e",
          "§f",
          "§8",
        ])}${symbol}]`;
      case 28:
        return `§a[${this.formatMythicNumber(stars, [
          "§a",
          "§2",
          "§6",
        ])}${symbol}§e]`;
      case 29:
        return `§b[${this.formatMythicNumber(stars, [
          "§b",
          "§3",
          "§9",
        ])}${symbol}§1]`;
      case 30:
        return `§e[${this.formatMythicNumber(stars, [
          "§e",
          "§6",
          "§c",
        ])}${symbol}§4]`;

      default:
        // For any prestige above 3000, use the Fire prestige style
        if (prestige > 30) {
          return `§e[${this.formatMythicNumber(stars, [
            "§e",
            "§6",
            "§c",
          ])}${symbol}§4]`;
        }
        return `§f[${stars}${symbol}]`;
    }
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

      const starsValue = this.getPrestigeTag(stats.stars);
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
        parts.push(this.getPrestigeTag(stats.stars));

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

