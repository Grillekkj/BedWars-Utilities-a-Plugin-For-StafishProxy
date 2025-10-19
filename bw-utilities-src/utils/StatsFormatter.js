const STAT_DEFINITIONS = [
  { configKey: "showStars", formatter: "_formatStars" },
  {
    configKey: "showFkdr",
    dataKey: "fkdr",
    formatter: "_formatStat",
    chatPrefix: "§9FKDR: ",
    tabPrefix: "§9FKDR ",
  },
  {
    configKey: "showFK",
    dataKey: "final_kills",
    formatter: "_formatStat",
    chatPrefix: "§6FK: ",
    tabPrefix: "§6FK ",
  },
  {
    configKey: "showFD",
    dataKey: "final_deaths",
    formatter: "_formatStat",
    chatPrefix: "§cFD: ",
    tabPrefix: "§cFD ",
  },
  {
    configKey: "showWlr",
    dataKey: "wlr",
    formatter: "_formatStat",
    chatPrefix: "§bWLR: ",
    tabPrefix: "§bWLR ",
  },
  {
    configKey: "showWins",
    dataKey: "wins",
    formatter: "_formatStat",
    chatPrefix: "§aWins: ",
    tabPrefix: "§aW ",
  },
  {
    configKey: "showLosses",
    dataKey: "losses",
    formatter: "_formatStat",
    chatPrefix: "§cLosses: ",
    tabPrefix: "§cL ",
  },
  {
    configKey: "showBeds",
    dataKey: "beds_broken",
    formatter: "_formatStat",
    chatPrefix: "§eBeds: ",
    tabPrefix: "§eBB ",
  },
  {
    configKey: "showWinstreak",
    dataKey: "winstreak",
    formatter: "_formatStat",
    chatPrefix: "§dWS: ",
    tabPrefix: "§dWS ",
  },
  {
    configKey: "showPing",
    dataKey: "ping",
    formatter: "_formatStat",
    chatPrefix: "§aPing: ",
  },
];

class StatsFormatter {
  constructor(api) {
    this.api = api;

    this.colorRules = {
      fkdr: [
        { max: 0.99, color: "§7" },
        { max: 1.49, color: "§f" },
        { max: 2.99, color: "§a" },
        { max: 4.99, color: "§2" },
        { max: 6.99, color: "§e" },
        { max: 9.99, color: "§6" },
        { max: 19.99, color: "§c" },
        { max: 29.99, color: "§4" },
        { max: 49.99, color: "§d" },
        { min: 50, color: "§5" },
      ],
      wlr: [
        { max: 0.29, color: "§7" },
        { max: 0.89, color: "§f" },
        { max: 1.49, color: "§a" },
        { max: 2.09, color: "§2" },
        { max: 2.99, color: "§e" },
        { max: 5.99, color: "§6" },
        { max: 8.99, color: "§c" },
        { max: 14.99, color: "§4" },
        { max: 29.99, color: "§d" },
        { min: 30, color: "§5" },
      ],
      wins: [
        { max: 149, color: "§7" },
        { max: 299, color: "§f" },
        { max: 449, color: "§a" },
        { max: 1499, color: "§2" },
        { max: 2249, color: "§e" },
        { max: 4499, color: "§6" },
        { max: 7499, color: "§c" },
        { max: 14999, color: "§4" },
        { max: 29999, color: "§d" },
        { min: 30000, color: "§5" },
      ],
      losses: [
        { max: 149, color: "§7" },
        { max: 299, color: "§f" },
        { max: 449, color: "§a" },
        { max: 1499, color: "§2" },
        { max: 2249, color: "§e" },
        { max: 4499, color: "§6" },
        { max: 7499, color: "§c" },
        { max: 14999, color: "§4" },
        { max: 29999, color: "§d" },
        { min: 30000, color: "§5" },
      ],
      final_kills: [
        { max: 499, color: "§7" },
        { max: 999, color: "§f" },
        { max: 2499, color: "§a" },
        { max: 4999, color: "§2" },
        { max: 7499, color: "§e" },
        { max: 14999, color: "§6" },
        { max: 24999, color: "§c" },
        { max: 49999, color: "§4" },
        { max: 99999, color: "§d" },
        { min: 100000, color: "§5" },
      ],
      final_deaths: [
        { max: 499, color: "§7" },
        { max: 999, color: "§f" },
        { max: 2499, color: "§a" },
        { max: 4999, color: "§2" },
        { max: 7499, color: "§e" },
        { max: 14999, color: "§6" },
        { max: 24999, color: "§c" },
        { max: 49999, color: "§4" },
        { max: 99999, color: "§d" },
        { min: 100000, color: "§5" },
      ],
      beds_broken: [
        { max: 249, color: "§7" },
        { max: 499, color: "§f" },
        { max: 1249, color: "§a" },
        { max: 2499, color: "§2" },
        { max: 3749, color: "§e" },
        { max: 7499, color: "§6" },
        { max: 12499, color: "§c" },
        { max: 24999, color: "§4" },
        { max: 49999, color: "§d" },
        { min: 50000, color: "§5" },
      ],
      winstreak: [
        { max: 4, color: "§7" },
        { max: 14, color: "§f" },
        { max: 24, color: "§a" },
        { max: 39, color: "§2" },
        { max: 49, color: "§e" },
        { max: 74, color: "§6" },
        { max: 99, color: "§c" },
        { max: 249, color: "§4" },
        { max: 499, color: "§d" },
        { min: 500, color: "§5" },
      ],
      ping: [
        { max: 49, color: "§a" },
        { max: 99, color: "§e" },
        { max: 149, color: "§6" },
        { max: 199, color: "§c" },
        { min: 200, color: "§4" },
      ],
    };
  }

  _applyColor(stat, value) {
    if (value === undefined || value === null) {
      return "§c";
    }

    const rules = this.colorRules[stat];
    if (!rules) {
      return "§f";
    }

    for (const element of rules) {
      const rule = element;
      const minOk = rule.min === undefined || value >= rule.min;
      const maxOk = rule.max === undefined || value <= rule.max;
      if (minOk && maxOk) {
        return rule.color;
      }
    }

    return "§f";
  }

  _getPrefix(mode, definition, statConfig) {
    if (mode === "chat" || statConfig.showPrefix) {
      if (mode === "chat") {
        return definition.chatPrefix ? definition.chatPrefix : "";
      } else {
        return definition.tabPrefix ? definition.tabPrefix : "";
      }
    }
    return "";
  }

  _formatStars({ stats }) {
    return this._getPrestigeTag(stats.stars);
  }

  _formatStat({ stats, ping, mode, definition, statConfig }) {
    const statKey = definition.dataKey;
    let value = null;

    if (statKey === "ping") {
      value = ping;
    } else if (stats[statKey] !== undefined && stats[statKey] !== null) {
      value = stats[statKey];
    }

    const color = this._applyColor(statKey, value);
    const prefix = this._getPrefix(mode, definition, statConfig);
    let formattedValue = "§c?";

    if (value !== undefined && value !== null) {
      if (statKey === "fkdr" || statKey === "wlr") {
        formattedValue = value.toFixed(2);
      } else {
        formattedValue = value.toString();
      }
    }

    if (statKey === "ping" && value !== undefined && value !== null) {
      formattedValue = formattedValue + "ms";
    }

    if (mode === "tab" && !statConfig.showPrefix) {
      return color + formattedValue;
    }

    return prefix + color + formattedValue;
  }

  _formatMythicNumber(stars, colorPattern) {
    const starStr = stars.toString();
    const firstDigit = starStr.charAt(0);
    const middleDigits = starStr.substring(1, starStr.length - 1);
    const lastDigit = starStr.at(-1);

    return (
      colorPattern[0] +
      firstDigit +
      colorPattern[1] +
      middleDigits +
      colorPattern[2] +
      lastDigit
    );
  }

  _getPrestigeTag(stars) {
    const prestige = Math.floor(stars / 100);
    let symbol = "✫";
    if (stars >= 1100 && stars < 2100) symbol = "✪";
    if (stars >= 2100) symbol = "⚝";

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
      return colors[prestige] + "[" + stars + symbol + "]";
    }

    // Prestiges 1000+
    switch (prestige) {
      case 10:
        return `§c[§6${stars.toString()[0]}§e${stars.toString()[1]}§a${
          stars.toString()[2]
        }§b${stars.toString()[3]}§d${symbol}§5]`;
      case 11:
        return `§7[§f${stars}${symbol}§7]`;
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
        if (prestige > 30)
          return `§e[${this._formatMythicNumber(stars, [
            "§e",
            "§6",
            "§c",
          ])}${symbol}§4]`;
        return `§f[${stars}${symbol}]`;
    }
  }

  _buildStatsParts(stats, ping, mode) {
    const config = this.api.config.get("stats");
    const isTabMode = mode === "tab";
    const parts = [];

    for (const element of STAT_DEFINITIONS) {
      const definition = element;
      const statConfig = config[definition.configKey];

      if (!statConfig?.enabled) {
        continue;
      }

      const displayMode = statConfig.displayMode;
      const shouldShow =
        displayMode === "both" ||
        (displayMode === "chat" && !isTabMode) ||
        (displayMode === "tab" && isTabMode);

      if (!shouldShow) {
        continue;
      }

      const part = this[definition.formatter]({
        stats: stats,
        ping: ping,
        mode: mode,
        definition: definition,
        statConfig: statConfig,
      });

      parts.push(part);
    }

    return parts;
  }

  formatStats(mode, playerName, stats, ping) {
    const isTab = mode === "tab";
    let playerDisplay = playerName;

    if (!isTab) {
      const playerObject = this.api.getPlayerByName(playerName);
      if (playerObject?.team?.prefix) {
        playerDisplay = playerObject.team.prefix + playerName;
      }
    }

    if (!stats || stats.isNicked) {
      if (isTab) {
        return " §f| §cNicked";
      } else {
        return this.api.getPrefix() + " " + playerDisplay + " §8- §cNicked";
      }
    }

    const parts = this._buildStatsParts(stats, ping, mode);

    if (parts.length === 0) {
      if (isTab) {
        return "";
      } else {
        return this.api.getPrefix() + " §cYou have all stats disabled.";
      }
    }

    if (isTab) {
      return " §f| " + parts.join(" §f| ");
    } else {
      return (
        this.api.getPrefix() +
        " " +
        playerDisplay +
        " §8- §7" +
        parts.join(" §8|§7 ")
      );
    }
  }
}

module.exports = StatsFormatter;
