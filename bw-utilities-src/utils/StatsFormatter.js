const STAT_DEFINITIONS = [
  { configKey: "showStars", formatter: "_formatStars" },
  {
    configKey: "showFkdr",
    formatter: "_formatFkdr",
    chatPrefix: "§9FKDR: ",
    tabPrefix: "§9FKDR ",
  },
  {
    configKey: "showFK",
    dataKey: "final_kills",
    formatter: "_formatSimpleStat",
    chatPrefix: "§6FK: ",
    tabPrefix: "§6FK ",
  },
  {
    configKey: "showFD",
    dataKey: "final_deaths",
    formatter: "_formatSimpleStat",
    chatPrefix: "§cFD: ",
    tabPrefix: "§cFD ",
  },
  {
    configKey: "showBeds",
    dataKey: "beds_broken",
    formatter: "_formatSimpleStat",
    chatPrefix: "§eBeds: ",
    tabPrefix: "§eBB ",
  },
  {
    configKey: "showWinstreak",
    dataKey: "winstreak",
    formatter: "_formatSimpleStat",
    chatPrefix: "§dWS: ",
    tabPrefix: "§dWS ",
  },
  { configKey: "showPing", formatter: "_formatPing", chatPrefix: "§aPing: " },
];

class StatsFormatter {
  constructor(api) {
    this.api = api;
  }

  _formatMythicNumber(stars, colorPattern) {
    const starStr = stars.toString();
    const firstDigit = starStr.charAt(0);
    const middleDigits = starStr.substring(1, starStr.length - 1);
    const lastDigit = starStr.charAt(starStr.length - 1);

    return `${colorPattern[0]}${firstDigit}${colorPattern[1]}${middleDigits}${colorPattern[2]}${lastDigit}`;
  }

  _getPrestigeTag(stars) {
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
        return `§8[${this._formatMythicNumber(stars, [
          "§7",
          "§f",
          "§7",
        ])}${symbol}§8]`;
      case 21:
        return `§f[${this._formatMythicNumber(stars, [
          "§f",
          "§e",
          "§6",
        ])}${symbol}]`;
      case 22:
        return `§6[${this._formatMythicNumber(stars, [
          "§6",
          "§f",
          "§b",
        ])}${symbol}§3]`;
      case 23:
        return `§5[${this._formatMythicNumber(stars, [
          "§5",
          "§d",
          "§6",
        ])}${symbol}§e]`;
      case 24:
        return `§b[${this._formatMythicNumber(stars, [
          "§b",
          "§f",
          "§7",
        ])}${symbol}§8]`;
      case 25:
        return `§f[${this._formatMythicNumber(stars, [
          "§f",
          "§a",
          "§2",
        ])}${symbol}]`;
      case 26:
        return `§4[${this._formatMythicNumber(stars, [
          "§4",
          "§c",
          "§d",
        ])}${symbol}§5]`;
      case 27:
        return `§e[${this._formatMythicNumber(stars, [
          "§e",
          "§f",
          "§8",
        ])}${symbol}]`;
      case 28:
        return `§a[${this._formatMythicNumber(stars, [
          "§a",
          "§2",
          "§6",
        ])}${symbol}§e]`;
      case 29:
        return `§b[${this._formatMythicNumber(stars, [
          "§b",
          "§3",
          "§9",
        ])}${symbol}§1]`;
      case 30:
        return `§e[${this._formatMythicNumber(stars, [
          "§e",
          "§6",
          "§c",
        ])}${symbol}§4]`;

      default:
        // For any prestige above 3000, use the Fire prestige style (adding this shit is a fucking pain omg)
        if (prestige > 30) {
          return `§e[${this._formatMythicNumber(stars, [
            "§e",
            "§6",
            "§c",
          ])}${symbol}§4]`;
        }
        return `§f[${stars}${symbol}]`;
    }
  }

  _applyFkdrColor(value) {
    if (value === undefined || value === null) return "§c";
    const rules = [
      { max: 0.99, color: "§7" }, // Gray: very weak
      { max: 1.49, color: "§f" }, // White: low
      { max: 1.99, color: "§b" }, // Light Aqua: low-medium
      { max: 2.49, color: "§a" }, // Green: medium
      { max: 2.99, color: "§2" }, // Dark Green: medium-high
      { max: 3.99, color: "§e" }, // Yellow: above average
      { max: 4.99, color: "§6" }, // Orange: good
      { max: 6.99, color: "§d" }, // Pink: very good
      { max: 9.99, color: "§5" }, // Dark Purple: excellent
      { max: 19.99, color: "§4" }, // Dark Red: top player
      { min: 20, color: "§c" }, // Red: supreme
    ];

    for (const rule of rules) {
      if (
        (rule.min === undefined || value >= rule.min) &&
        (rule.max === undefined || value <= rule.max)
      ) {
        return rule.color;
      }
    }
    return `§f`;
  }

  _formatStars({ stats }) {
    return this._getPrestigeTag(stats.stars);
  }

  _formatFkdr({ stats, mode, definition }) {
    const fkdrColor = this._applyFkdrColor(stats.fkdr);
    const fkdrValue =
      stats.fkdr !== undefined && stats.fkdr !== null
        ? stats.fkdr.toFixed(2)
        : "§c?";
    const prefix =
      (mode === "chat" ? definition.chatPrefix : definition.tabPrefix) ?? "";
    return `${prefix}${fkdrColor}${fkdrValue}`;
  }

  _formatSimpleStat({ stats, mode, definition }) {
    const value = stats[definition.dataKey];
    const prefix =
      (mode === "chat" ? definition.chatPrefix : definition.tabPrefix) ?? "";
    return `${prefix}${value !== undefined && value !== null ? value : "§c?"}`;
  }

  _formatPing({ ping, mode, definition }) {
    const prefix =
      (mode === "chat" ? definition.chatPrefix : definition.tabPrefix) ?? "";
    const value = typeof ping === "number" ? `§a${ping}ms` : "§c?";
    return `${prefix}${value}`;
  }

  _buildStatsParts(stats, ping, mode) {
    const config = this.api.config.get("stats");
    const isTabMode = mode === "tab";

    return STAT_DEFINITIONS.reduce((parts, definition) => {
      const statConfig = config[definition.configKey];

      if (!statConfig?.enabled) {
        return parts;
      }

      const displayMode = statConfig.displayMode;

      const shouldShow =
        displayMode === "both" ||
        (displayMode === "chat" && !isTabMode) ||
        (displayMode === "tab" && isTabMode);

      if (shouldShow) {
        const part = this[definition.formatter]({
          stats,
          ping,
          mode,
          definition,
        });
        parts.push(part);
      }
      return parts;
    }, []);
  }

  formatStats(mode, playerName, stats, ping) {
    const isTab = mode === "tab";

    let playerDisplay = playerName;
    if (!isTab) {
      const playerObject = this.api.getPlayerByName(playerName);
      if (playerObject?.team?.prefix) {
        playerDisplay = `${playerObject.team.prefix}${playerName}`;
      }
    }

    if (!stats || stats.isNicked) {
      if (isTab) return " §f| §cNicked";
      return `${this.api.getPrefix()} ${playerDisplay} §8- §cNicked`;
    }

    const parts = this._buildStatsParts(stats, ping, isTab ? "tab" : "chat");
    if (parts.length === 0) {
      return isTab
        ? ""
        : `${this.api.getPrefix()} §cYou have all stats disabled.`;
    }

    if (isTab) {
      return ` §f| ${parts.join(" §f| ")}`;
    } else {
      return `${this.api.getPrefix()} ${playerDisplay} §8- §7${parts.join(
        " §8|§7 "
      )}`;
    }
  }
}

module.exports = StatsFormatter;
