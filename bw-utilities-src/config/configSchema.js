module.exports = [
  {
    label: "API - Hypixel",
    description: "Set your Hypixel API key. Use: /bwu setkey <key>",
    defaults: {
      main: {
        hypixelApiKey: "YOUR_HYPIXEL_API_KEY_HERE",
      },
    },
    settings: [
      {
        key: "main.hypixelApiKey",
        type: "text",
        description:
          "Hypixel API key. Get one at https://developer.hypixel.net/. Use: /bwu setkey <key>",
      },
    ],
  },
  {
    label: "API - Polsu (Ping)",
    description: "Set your Polsu API key. Use: /bwu setpolsu <key>",
    defaults: {
      main: {
        polsuApiKey: "YOUR_POLSU_API_KEY_HERE",
      },
    },
    settings: [
      {
        key: "main.polsuApiKey",
        type: "text",
        description:
          "Polsu API key for showing ping. Get one at polsu.xyz/api/apikey. Use: /bwu setpolsu <key>",
      },
    ],
  },
  {
    label: "Your Nickname",
    description:
      "Set your Minecraft username or Hypixel nickname (not tested/supported(?) with nicknames). Use: /bwu setnick <nick>",
    defaults: {
      main: {
        MY_NICK: "YOUR_NICK_HERE",
      },
    },
    settings: [
      {
        key: "main.MY_NICK",
        type: "text",
        description:
          "Your Minecraft username (case-sensitive). Use: /bwu setnick <nick>",
      },
    ],
  },
  {
    label: "Team Ranking",
    description:
      "Automatically ranks enemy teams by threat level (FKDR and Stars) at the start of the match.",
    defaults: {
      teamRanking: {
        enabled: true,
      },
    },
    settings: [
      {
        key: "teamRanking.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Enable or disable automatic team ranking.",
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
    label: "Stats on Mention",
    description: "Show stats of the player who mentions your nickname in chat.",
    defaults: {
      mentionStats: { enabled: true },
    },
    settings: [
      {
        key: "mentionStats.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description:
          "Shows the stats of anyone who mentions your nickname in chat (private to you).",
      },
    ],
  },
  {
    label: "Automatic Stats (Pre-game lobby)",
    description:
      "Show stats of players who chat in the pre-game lobby (private to you).",
    defaults: {
      autoStats: { enabled: true },
    },
    settings: [
      {
        key: "autoStats.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description:
          "Show stats of players who chat in the pre-game lobby (private to you).",
      },
    ],
  },
  {
    label: "Auto Requeue",
    description:
      "Automatically types /requeue if a player in the pre-game lobby has an FKDR above your defined limit.",
    defaults: {
      autoRequeue: {
        enabled: false,
        fkdrThreshold: 5.0,
      },
    },
    settings: [
      {
        key: "autoRequeue.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Enable or disable automatic /requeue.",
      },
      {
        key: "autoRequeue.fkdrThreshold",
        type: "text",
        description: "The FKDR limit that will trigger a /requeue.",
      },
    ],
  },
  {
    label: "Cache - Hypixel",
    description: "Hypixel stats cache duration.",
    defaults: {
      performance: {
        cacheTTL: 300,
      },
    },
    settings: [
      {
        key: "performance.cacheTTL",
        type: "text",
        description: "Time in seconds. Recommended: 300 (5 minutes).",
      },
    ],
  },
  {
    label: "Cache - Polsu",
    description: "Polsu ping cache duration.",
    defaults: {
      performance: {
        pingCacheTTL: 60,
      },
    },
    settings: [
      {
        key: "performance.pingCacheTTL",
        type: "text",
        description: "Time in seconds. Recommended: 60 (1 minute).",
      },
    ],
  },
  {
    label: "Stats - Level (Stars)",
    description: "Show the level (stars).",
    defaults: {
      stats: {
        showStars: true,
      },
    },
    settings: [
      {
        key: "stats.showStars",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the level (stars).",
      },
    ],
  },
  {
    label: "Stats - FKDR",
    description: "Show the Final Kills / Deaths ratio.",
    defaults: {
      stats: {
        showFkdr: true,
      },
    },
    settings: [
      {
        key: "stats.showFkdr",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the Final Kills / Deaths ratio.",
      },
    ],
  },
  {
    label: "Stats - Final Kills",
    description: "Show the total Final Kills.",
    defaults: {
      stats: {
        showFK: true,
      },
    },
    settings: [
      {
        key: "stats.showFK",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the total Final Kills.",
      },
    ],
  },
  {
    label: "Stats - Final Deaths",
    description: "Show the total Final Deaths.",
    defaults: {
      stats: {
        showFD: true,
      },
    },
    settings: [
      {
        key: "stats.showFD",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the total Final Deaths.",
      },
    ],
  },
  {
    label: "Stats - Beds Broken",
    description: "Show the total Beds Broken.",
    defaults: {
      stats: {
        showBeds: true,
      },
    },
    settings: [
      {
        key: "stats.showBeds",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the total Beds Broken.",
      },
    ],
  },
  {
    label: "Stats - Winstreak",
    description: "Show the current Winstreak",
    defaults: {
      stats: {
        showWinstreak: true,
      },
    },
    settings: [
      {
        key: "stats.showWinstreak",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the current Winstreak",
      },
    ],
  },
  {
    label: "Stats - Ping",
    description: "Show the player's ping (requires Polsu API).",
    defaults: {
      stats: {
        showPing: true,
      },
    },
    settings: [
      {
        key: "stats.showPing",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the player's ping.",
      },
    ],
  },
];

