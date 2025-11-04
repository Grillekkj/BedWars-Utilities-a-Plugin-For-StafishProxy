module.exports = [
  {
    label: "API - Hypixel",
    description:
      "Set your Hypixel API key and cache duration. Use: /bwu setkey <key>",
    defaults: {
      main: {
        hypixelApiKey: "YOUR_HYPIXEL_API_KEY_HERE",
      },
      performance: {
        cacheTTL: 300,
      },
    },
    settings: [
      {
        key: "main.hypixelApiKey",
        type: "text",
        description:
          "Hypixel API key. Get one at https://developer.hypixel.net/. Use: /bwu setkey <key>",
      },
      {
        key: "performance.cacheTTL",
        type: "cycle",
        description: "Cache duration for stats. Recommended: 300s or more.",
        values: [
          { text: "60s", value: 60 },
          { text: "120s", value: 120 },
          { text: "180s", value: 180 },
          { text: "240s", value: 240 },
          { text: "300s (Recommended)", value: 300 },
          { text: "360s", value: 360 },
          { text: "420s", value: 420 },
        ],
      },
    ],
  },
  {
    label: "API - Polsu (Ping)",
    description:
      "Set your Polsu API key and cache duration. Use: /bwu setpolsu <key>",
    defaults: {
      main: {
        polsuApiKey: "YOUR_POLSU_API_KEY_HERE",
      },
      performance: {
        pingCacheTTL: 60,
      },
    },
    settings: [
      {
        key: "main.polsuApiKey",
        type: "text",
        description:
          "Polsu API key for showing ping. Get one at polsu.xyz/api/apikey. Use: /bwu setpolsu <key>",
      },
      {
        key: "performance.pingCacheTTL",
        type: "cycle",
        description: "Cache duration for ping. Recommended: 60s.",
        values: [
          { text: "30s", value: 30 },
          { text: "60s (Recommended)", value: 60 },
          { text: "90s", value: 90 },
          { text: "120s", value: 120 },
        ],
      },
    ],
  },
  {
    label: "Team Ranking",
    description:
      "Automatically ranks enemy teams by threat level (FKDR and Stars).",
    defaults: {
      teamRanking: {
        enabled: true,
        separateMessages: false,
        displayMode: "total",
      },
      privateRanking: {
        alwaysPrivate: false,
      },
    },
    settings: [
      {
        key: "teamRanking.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Enable or disable automatic team ranking.",
      },
      {
        key: "teamRanking.displayMode",
        type: "cycle",
        description: "Display total or average stats in team ranking.",
        values: [
          { text: "Stat Mode: Total", value: "total" },
          { text: "Stat Mode: Average", value: "avg" },
        ],
      },
      {
        key: "privateRanking.alwaysPrivate",
        type: "cycle",
        description:
          "Force the ranking message to always be sent privately to you.",
        values: [
          { text: "Private: ON", value: true },
          { text: "Private: OFF", value: false },
        ],
      },
      {
        key: "teamRanking.separateMessages",
        type: "cycle",
        description: "Display each team's ranking in a separate chat message.",
        values: [
          { text: "Separate Msgs: ON", value: true },
          { text: "Separate Msgs: OFF", value: false },
        ],
      },
    ],
  },
  {
    label: "Auto /who",
    description:
      "Automatically run /who at the start of the match (Bedwars only)",
    defaults: {
      autoWho: {
        enabled: true,
        delay: 0,
      },
    },
    settings: [
      {
        type: "toggle",
        key: "autoWho.enabled",
        text: ["OFF", "ON"],
        description:
          "Automatically executes /who when starting a Bedwars match.",
      },
      {
        type: "cycle",
        key: "autoWho.delay",
        description: "Delay before executing the command.",
        values: [
          { text: "0ms", value: 0 },
          { text: "500ms", value: 500 },
          { text: "1000ms", value: 1000 },
        ],
      },
    ],
  },
  {
    label: "Automatic Stats & Requeue",
    description: "Automations for pre-game lobby analysis.",
    defaults: {
      autoStats: { enabled: true },
      mentionStats: { enabled: true },
      autoRequeue: {
        enabled: false,
        fkdrThreshold: 5,
      },
    },
    settings: [
      {
        key: "autoStats.enabled",
        type: "cycle",
        description: "Show stats of players who chat in the pre-game lobby.",
        values: [
          { text: "Lobby Stats: ON", value: true },
          { text: "Lobby Stats: OFF", value: false },
        ],
      },
      {
        key: "mentionStats.enabled",
        type: "cycle",
        description: "Show stats of players who mention your nickname in chat.",
        values: [
          { text: "Mention Stats: ON", value: true },
          { text: "Mention Stats: OFF", value: false },
        ],
      },
      {
        key: "autoRequeue.enabled",
        type: "cycle",
        description: "Enable auto /requeue based on FKDR.",
        values: [
          { text: "Auto Requeue: ON", value: true },
          { text: "Auto Requeue: OFF", value: false },
        ],
      },
      {
        key: "autoRequeue.fkdrThreshold",
        type: "text",
        description:
          "The FKDR limit that will trigger a /requeue. Use: /bwu setthreshold <fkdr>",
      },
    ],
  },
  {
    label: "Stats - Level (Stars)",
    description: "Show the level (stars).",
    defaults: {
      stats: {
        showStars: {
          enabled: true,
          displayMode: "both",
          showPrefix: true,
          prefixColor: "§7",
        },
      },
    },
    settings: [
      {
        key: "stats.showStars.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the level (stars).",
      },
      {
        key: "stats.showStars.displayMode",
        type: "cycle",
        description: "Where to show stars.",
        values: [
          { text: "Chat", value: "chat" },
          { text: "Tab", value: "tab" },
          { text: "Both", value: "both" },
        ],
      },
    ],
  },
  {
    label: "Stats - FKDR",
    description: "Show the Final Kills / Deaths ratio.",
    defaults: {
      stats: {
        showFkdr: {
          enabled: true,
          displayMode: "both",
          showPrefix: true,
          prefixColor: "§7",
        },
      },
    },
    settings: [
      {
        key: "stats.showFkdr.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the Final Kills / Deaths ratio.",
      },
      {
        key: "stats.showFkdr.displayMode",
        type: "cycle",
        description: "Where to show FKDR.",
        values: [
          { text: "Chat", value: "chat" },
          { text: "Tab", value: "tab" },
          { text: "Both", value: "both" },
        ],
      },
      {
        key: "stats.showFkdr.showPrefix",
        type: "cycle",
        description: "Show prefix in tab.",
        values: [
          { text: "Prefix ON", value: true },
          { text: "Prefix OFF", value: false },
        ],
      },
      {
        key: "stats.showFkdr.prefixColor",
        type: "cycle",
        description: "Prefix color in chat and tab.",
        values: [
          { text: "§0Black", value: "§0" },
          { text: "§1Dark Blue", value: "§1" },
          { text: "§2Dark Green", value: "§2" },
          { text: "§3Dark Aqua", value: "§3" },
          { text: "§4Dark Red", value: "§4" },
          { text: "§5Dark Purple", value: "§5" },
          { text: "§6Gold", value: "§6" },
          { text: "§7Gray", value: "§7" },
          { text: "§8Dark Gray", value: "§8" },
          { text: "§9Blue", value: "§9" },
          { text: "§aGreen", value: "§a" },
          { text: "§bAqua", value: "§b" },
          { text: "§cRed", value: "§c" },
          { text: "§dLight Purple", value: "§d" },
          { text: "§eYellow", value: "§e" },
          { text: "§fWhite", value: "§f" },
        ],
      },
    ],
  },
  {
    label: "Stats - Final Kills",
    description: "Show the total Final Kills.",
    defaults: {
      stats: {
        showFK: {
          enabled: true,
          displayMode: "both",
          showPrefix: true,
          prefixColor: "§7",
        },
      },
    },
    settings: [
      {
        key: "stats.showFK.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the total Final Kills.",
      },
      {
        key: "stats.showFK.displayMode",
        type: "cycle",
        description: "Where to show Final Kills.",
        values: [
          { text: "Chat", value: "chat" },
          { text: "Tab", value: "tab" },
          { text: "Both", value: "both" },
        ],
      },
      {
        key: "stats.showFK.showPrefix",
        type: "cycle",
        description: "Show prefix in tab.",
        values: [
          { text: "Prefix ON", value: true },
          { text: "Prefix OFF", value: false },
        ],
      },
      {
        key: "stats.showFK.prefixColor",
        type: "cycle",
        description: "Prefix color in chat and tab.",
        values: [
          { text: "§0Black", value: "§0" },
          { text: "§1Dark Blue", value: "§1" },
          { text: "§2Dark Green", value: "§2" },
          { text: "§3Dark Aqua", value: "§3" },
          { text: "§4Dark Red", value: "§4" },
          { text: "§5Dark Purple", value: "§5" },
          { text: "§6Gold", value: "§6" },
          { text: "§7Gray", value: "§7" },
          { text: "§8Dark Gray", value: "§8" },
          { text: "§9Blue", value: "§9" },
          { text: "§aGreen", value: "§a" },
          { text: "§bAqua", value: "§b" },
          { text: "§cRed", value: "§c" },
          { text: "§dLight Purple", value: "§d" },
          { text: "§eYellow", value: "§e" },
          { text: "§fWhite", value: "§f" },
        ],
      },
    ],
  },
  {
    label: "Stats - Final Deaths",
    description: "Show the total Final Deaths.",
    defaults: {
      stats: {
        showFD: {
          enabled: true,
          displayMode: "both",
          showPrefix: true,
          prefixColor: "§7",
        },
      },
    },
    settings: [
      {
        key: "stats.showFD.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the total Final Deaths.",
      },
      {
        key: "stats.showFD.displayMode",
        type: "cycle",
        description: "Where to show Final Deaths.",
        values: [
          { text: "Chat", value: "chat" },
          { text: "Tab", value: "tab" },
          { text: "Both", value: "both" },
        ],
      },
      {
        key: "stats.showFD.showPrefix",
        type: "cycle",
        description: "Show prefix in tab.",
        values: [
          { text: "Prefix ON", value: true },
          { text: "Prefix OFF", value: false },
        ],
      },
      {
        key: "stats.showFD.prefixColor",
        type: "cycle",
        description: "Prefix color in chat and tab.",
        values: [
          { text: "§0Black", value: "§0" },
          { text: "§1Dark Blue", value: "§1" },
          { text: "§2Dark Green", value: "§2" },
          { text: "§3Dark Aqua", value: "§3" },
          { text: "§4Dark Red", value: "§4" },
          { text: "§5Dark Purple", value: "§5" },
          { text: "§6Gold", value: "§6" },
          { text: "§7Gray", value: "§7" },
          { text: "§8Dark Gray", value: "§8" },
          { text: "§9Blue", value: "§9" },
          { text: "§aGreen", value: "§a" },
          { text: "§bAqua", value: "§b" },
          { text: "§cRed", value: "§c" },
          { text: "§dLight Purple", value: "§d" },
          { text: "§eYellow", value: "§e" },
          { text: "§fWhite", value: "§f" },
        ],
      },
    ],
  },
  {
    label: "Stats - WLR",
    description: "Show the Win / Loss ratio.",
    defaults: {
      stats: {
        showWlr: {
          enabled: true,
          displayMode: "chat",
          showPrefix: true,
          prefixColor: "§7",
        },
      },
    },
    settings: [
      {
        key: "stats.showWlr.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the Win / Loss ratio.",
      },
      {
        key: "stats.showWlr.displayMode",
        type: "cycle",
        description: "Where to show WLR.",
        values: [
          { text: "Chat", value: "chat" },
          { text: "Tab", value: "tab" },
          { text: "Both", value: "both" },
        ],
      },
      {
        key: "stats.showWlr.showPrefix",
        type: "cycle",
        description: "Show prefix in tab.",
        values: [
          { text: "Prefix ON", value: true },
          { text: "Prefix OFF", value: false },
        ],
      },
      {
        key: "stats.showWlr.prefixColor",
        type: "cycle",
        description: "Prefix color in chat and tab.",
        values: [
          { text: "§0Black", value: "§0" },
          { text: "§1Dark Blue", value: "§1" },
          { text: "§2Dark Green", value: "§2" },
          { text: "§3Dark Aqua", value: "§3" },
          { text: "§4Dark Red", value: "§4" },
          { text: "§5Dark Purple", value: "§5" },
          { text: "§6Gold", value: "§6" },
          { text: "§7Gray", value: "§7" },
          { text: "§8Dark Gray", value: "§8" },
          { text: "§9Blue", value: "§9" },
          { text: "§aGreen", value: "§a" },
          { text: "§bAqua", value: "§b" },
          { text: "§cRed", value: "§c" },
          { text: "§dLight Purple", value: "§d" },
          { text: "§eYellow", value: "§e" },
          { text: "§fWhite", value: "§f" },
        ],
      },
    ],
  },
  {
    label: "Stats - Wins",
    description: "Show the total Wins.",
    defaults: {
      stats: {
        showWins: {
          enabled: true,
          displayMode: "chat",
          showPrefix: true,
          prefixColor: "§7",
        },
      },
    },
    settings: [
      {
        key: "stats.showWins.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the total Wins.",
      },
      {
        key: "stats.showWins.displayMode",
        type: "cycle",
        description: "Where to show Wins.",
        values: [
          { text: "Chat", value: "chat" },
          { text: "Tab", value: "tab" },
          { text: "Both", value: "both" },
        ],
      },
      {
        key: "stats.showWins.showPrefix",
        type: "cycle",
        description: "Show prefix in tab.",
        values: [
          { text: "Prefix ON", value: true },
          { text: "Prefix OFF", value: false },
        ],
      },
      {
        key: "stats.showWins.prefixColor",
        type: "cycle",
        description: "Prefix color in chat and tab.",
        values: [
          { text: "§0Black", value: "§0" },
          { text: "§1Dark Blue", value: "§1" },
          { text: "§2Dark Green", value: "§2" },
          { text: "§3Dark Aqua", value: "§3" },
          { text: "§4Dark Red", value: "§4" },
          { text: "§5Dark Purple", value: "§5" },
          { text: "§6Gold", value: "§6" },
          { text: "§7Gray", value: "§7" },
          { text: "§8Dark Gray", value: "§8" },
          { text: "§9Blue", value: "§9" },
          { text: "§aGreen", value: "§a" },
          { text: "§bAqua", value: "§b" },
          { text: "§cRed", value: "§c" },
          { text: "§dLight Purple", value: "§d" },
          { text: "§eYellow", value: "§e" },
          { text: "§fWhite", value: "§f" },
        ],
      },
    ],
  },
  {
    label: "Stats - Losses",
    description: "Show the total Losses.",
    defaults: {
      stats: {
        showLosses: {
          enabled: true,
          displayMode: "chat",
          showPrefix: true,
          prefixColor: "§7",
        },
      },
    },
    settings: [
      {
        key: "stats.showLosses.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the total Losses.",
      },
      {
        key: "stats.showLosses.displayMode",
        type: "cycle",
        description: "Where to show Losses.",
        values: [
          { text: "Chat", value: "chat" },
          { text: "Tab", value: "tab" },
          { text: "Both", value: "both" },
        ],
      },
      {
        key: "stats.showLosses.showPrefix",
        type: "cycle",
        description: "Show prefix in tab.",
        values: [
          { text: "Prefix ON", value: true },
          { text: "Prefix OFF", value: false },
        ],
      },
      {
        key: "stats.showLosses.prefixColor",
        type: "cycle",
        description: "Prefix color in chat and tab.",
        values: [
          { text: "§0Black", value: "§0" },
          { text: "§1Dark Blue", value: "§1" },
          { text: "§2Dark Green", value: "§2" },
          { text: "§3Dark Aqua", value: "§3" },
          { text: "§4Dark Red", value: "§4" },
          { text: "§5Dark Purple", value: "§5" },
          { text: "§6Gold", value: "§6" },
          { text: "§7Gray", value: "§7" },
          { text: "§8Dark Gray", value: "§8" },
          { text: "§9Blue", value: "§9" },
          { text: "§aGreen", value: "§a" },
          { text: "§bAqua", value: "§b" },
          { text: "§cRed", value: "§c" },
          { text: "§dLight Purple", value: "§d" },
          { text: "§eYellow", value: "§e" },
          { text: "§fWhite", value: "§f" },
        ],
      },
    ],
  },
  {
    label: "Stats - Winstreak",
    description: "Show the current Winstreak",
    defaults: {
      stats: {
        showWinstreak: {
          enabled: true,
          displayMode: "both",
          showPrefix: true,
          prefixColor: "§7",
        },
      },
    },
    settings: [
      {
        key: "stats.showWinstreak.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the current Winstreak",
      },
      {
        key: "stats.showWinstreak.displayMode",
        type: "cycle",
        description: "Where to show Winstreak.",
        values: [
          { text: "Chat", value: "chat" },
          { text: "Tab", value: "tab" },
          { text: "Both", value: "both" },
        ],
      },
      {
        key: "stats.showWinstreak.showPrefix",
        type: "cycle",
        description: "Show prefix in tab.",
        values: [
          { text: "Prefix ON", value: true },
          { text: "Prefix OFF", value: false },
        ],
      },
      {
        key: "stats.showWinstreak.prefixColor",
        type: "cycle",
        description: "Prefix color in chat and tab.",
        values: [
          { text: "§0Black", value: "§0" },
          { text: "§1Dark Blue", value: "§1" },
          { text: "§2Dark Green", value: "§2" },
          { text: "§3Dark Aqua", value: "§3" },
          { text: "§4Dark Red", value: "§4" },
          { text: "§5Dark Purple", value: "§5" },
          { text: "§6Gold", value: "§6" },
          { text: "§7Gray", value: "§7" },
          { text: "§8Dark Gray", value: "§8" },
          { text: "§9Blue", value: "§9" },
          { text: "§aGreen", value: "§a" },
          { text: "§bAqua", value: "§b" },
          { text: "§cRed", value: "§c" },
          { text: "§dLight Purple", value: "§d" },
          { text: "§eYellow", value: "§e" },
          { text: "§fWhite", value: "§f" },
        ],
      },
    ],
  },
  {
    label: "Stats - Beds Broken",
    description: "Show the total Beds Broken.",
    defaults: {
      stats: {
        showBeds: {
          enabled: true,
          displayMode: "both",
          showPrefix: true,
          prefixColor: "§7",
        },
      },
    },
    settings: [
      {
        key: "stats.showBeds.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the total Beds Broken.",
      },
      {
        key: "stats.showBeds.displayMode",
        type: "cycle",
        description: "Where to show Beds Broken.",
        values: [
          { text: "Chat", value: "chat" },
          { text: "Tab", value: "tab" },
          { text: "Both", value: "both" },
        ],
      },
      {
        key: "stats.showBeds.showPrefix",
        type: "cycle",
        description: "Show prefix in tab.",
        values: [
          { text: "Prefix ON", value: true },
          { text: "Prefix OFF", value: false },
        ],
      },
      {
        key: "stats.showBeds.prefixColor",
        type: "cycle",
        description: "Prefix color in chat and tab.",
        values: [
          { text: "§0Black", value: "§0" },
          { text: "§1Dark Blue", value: "§1" },
          { text: "§2Dark Green", value: "§2" },
          { text: "§3Dark Aqua", value: "§3" },
          { text: "§4Dark Red", value: "§4" },
          { text: "§5Dark Purple", value: "§5" },
          { text: "§6Gold", value: "§6" },
          { text: "§7Gray", value: "§7" },
          { text: "§8Dark Gray", value: "§8" },
          { text: "§9Blue", value: "§9" },
          { text: "§aGreen", value: "§a" },
          { text: "§bAqua", value: "§b" },
          { text: "§cRed", value: "§c" },
          { text: "§dLight Purple", value: "§d" },
          { text: "§eYellow", value: "§e" },
          { text: "§fWhite", value: "§f" },
        ],
      },
    ],
  },
  {
    label: "Stats - Ping",
    description: "Show the player's ping (requires Polsu API).",
    defaults: {
      stats: {
        showPing: {
          enabled: true,
          displayMode: "both",
          showPrefix: true,
          prefixColor: "§7",
        },
      },
    },
    settings: [
      {
        key: "stats.showPing.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the player's ping.",
      },
      {
        key: "stats.showPing.displayMode",
        type: "cycle",
        description: "Where to show Ping.",
        values: [
          { text: "Chat", value: "chat" },
          { text: "Tab", value: "tab" },
          { text: "Both", value: "both" },
        ],
      },
      {
        key: "stats.showPing.prefixColor",
        type: "cycle",
        description: "Prefix color in chat and tab.",
        values: [
          { text: "§0Black", value: "§0" },
          { text: "§1Dark Blue", value: "§1" },
          { text: "§2Dark Green", value: "§2" },
          { text: "§3Dark Aqua", value: "§3" },
          { text: "§4Dark Red", value: "§4" },
          { text: "§5Dark Purple", value: "§5" },
          { text: "§6Gold", value: "§6" },
          { text: "§7Gray", value: "§7" },
          { text: "§8Dark Gray", value: "§8" },
          { text: "§9Blue", value: "§9" },
          { text: "§aGreen", value: "§a" },
          { text: "§bAqua", value: "§b" },
          { text: "§cRed", value: "§c" },
          { text: "§dLight Purple", value: "§d" },
          { text: "§eYellow", value: "§e" },
          { text: "§fWhite", value: "§f" },
        ],
      },
    ],
  },
];
