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
    label: "API - Aurora (Ping)",
    description:
      "Set your Aurora API key and cache duration. Use: /bwu setaurora <key>",
    defaults: {
      main: {
        auroraApiKey: "YOUR_AURORA_API_KEY_HERE",
      },
      performance: {
        pingCacheTTL: 60,
      },
    },
    settings: [
      {
        key: "main.auroraApiKey",
        type: "text",
        description:
          "Aurora API key for showing ping. Use: /bwu setaurora <key>",
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
      "Automatically ranks enemy teams by threat level (FKDR and Stars).",    defaults: {
      teamRanking: {
        enabled: true,
        separateMessages: true,
        displayMode: "total",
        sendType: "private",
        maxTeams: 4,
        showYourTeam: true,
        firstRushesPlayerStats: true,
        rankEquation: "",
        // Sigmoid normalization overrides (null = use hardcoded default)
        sig_fkdr_mid:  null, sig_fkdr_steep:  null,
        sig_wlr_mid:   null, sig_wlr_steep:   null,
        sig_kdr_mid:   null, sig_kdr_steep:   null,
        sig_bblr_mid:  null, sig_bblr_steep:  null,
        sig_fk_mid:    null, sig_fk_steep:    null,
        sig_fd_mid:    null, sig_fd_steep:    null,
        sig_k_mid:     null, sig_k_steep:     null,
        sig_d_mid:     null, sig_d_steep:     null,
        sig_bb_mid:    null, sig_bb_steep:    null,
        sig_bl_mid:    null, sig_bl_steep:    null,
        sig_w_mid:     null, sig_w_steep:     null,
        sig_l_mid:     null, sig_l_steep:     null,
        sig_stars_mid: null, sig_stars_steep: null,
        sig_ws_mid:    null, sig_ws_steep:    null,
      },
    },
    settings: [
      {
        key: "teamRanking.enabled",
        type: "cycle",
        description: "Enable or disable automatic team ranking.",
        values: [
          { text: "Team Ranking: ON", value: true },
          { text: "Team Ranking: OFF", value: false },
        ],
      },
      {
        key: "teamRanking.firstRushesPlayerStats",
        type: "cycle",
        description: "Show individual player stats for neighboring teams (first rushes) at game start. If OFF, neighboring team info is skipped entirely.",
        values: [
          { text: "First Rush Stats: ON", value: true },
          { text: "First Rush Stats: OFF", value: false },
        ],
      },      {
        key: "teamRanking.rankEquation",
        type: "text",
        description: "Custom ranking equation using normalized vars (0-1 scale): fkdr, wlr, kdr, bblr, fk, fd, k, d, bb, bl, w, l, stars, ws. Use /bwu setrankeqn to set. Empty = default sigmoid formula.",
      },
      // Sigmoid normalization overrides — set via /bwu setnormalizestat
      { key: "teamRanking.sig_fkdr_mid",  type: "text", description: "Sigmoid midpoint for fkdr (null = default 3.0)" },
      { key: "teamRanking.sig_fkdr_steep", type: "text", description: "Sigmoid steepness for fkdr (null = default 0.8)" },
      { key: "teamRanking.sig_wlr_mid",   type: "text", description: "Sigmoid midpoint for wlr (null = default 2.0)" },
      { key: "teamRanking.sig_wlr_steep",  type: "text", description: "Sigmoid steepness for wlr (null = default 1.0)" },
      { key: "teamRanking.sig_kdr_mid",   type: "text", description: "Sigmoid midpoint for kdr (null = default 2.0)" },
      { key: "teamRanking.sig_kdr_steep",  type: "text", description: "Sigmoid steepness for kdr (null = default 0.8)" },
      { key: "teamRanking.sig_bblr_mid",  type: "text", description: "Sigmoid midpoint for bblr (null = default 1.5)" },
      { key: "teamRanking.sig_bblr_steep", type: "text", description: "Sigmoid steepness for bblr (null = default 1.0)" },
      { key: "teamRanking.sig_fk_mid",    type: "text", description: "Sigmoid midpoint for fk (null = default 500)" },
      { key: "teamRanking.sig_fk_steep",   type: "text", description: "Sigmoid steepness for fk (null = default 0.005)" },
      { key: "teamRanking.sig_fd_mid",    type: "text", description: "Sigmoid midpoint for fd (null = default 200)" },
      { key: "teamRanking.sig_fd_steep",   type: "text", description: "Sigmoid steepness for fd (null = default 0.008)" },
      { key: "teamRanking.sig_k_mid",     type: "text", description: "Sigmoid midpoint for k (null = default 1000)" },
      { key: "teamRanking.sig_k_steep",    type: "text", description: "Sigmoid steepness for k (null = default 0.003)" },
      { key: "teamRanking.sig_d_mid",     type: "text", description: "Sigmoid midpoint for d (null = default 500)" },
      { key: "teamRanking.sig_d_steep",    type: "text", description: "Sigmoid steepness for d (null = default 0.005)" },
      { key: "teamRanking.sig_bb_mid",    type: "text", description: "Sigmoid midpoint for bb (null = default 200)" },
      { key: "teamRanking.sig_bb_steep",   type: "text", description: "Sigmoid steepness for bb (null = default 0.01)" },
      { key: "teamRanking.sig_bl_mid",    type: "text", description: "Sigmoid midpoint for bl (null = default 100)" },
      { key: "teamRanking.sig_bl_steep",   type: "text", description: "Sigmoid steepness for bl (null = default 0.015)" },
      { key: "teamRanking.sig_w_mid",     type: "text", description: "Sigmoid midpoint for w (null = default 200)" },
      { key: "teamRanking.sig_w_steep",    type: "text", description: "Sigmoid steepness for w (null = default 0.008)" },
      { key: "teamRanking.sig_l_mid",     type: "text", description: "Sigmoid midpoint for l (null = default 100)" },
      { key: "teamRanking.sig_l_steep",    type: "text", description: "Sigmoid steepness for l (null = default 0.015)" },
      { key: "teamRanking.sig_stars_mid", type: "text", description: "Sigmoid midpoint for stars (null = default 250)" },
      { key: "teamRanking.sig_stars_steep", type: "text", description: "Sigmoid steepness for stars (null = default 0.01)" },
      { key: "teamRanking.sig_ws_mid",    type: "text", description: "Sigmoid midpoint for ws (null = default 3.0)" },
      { key: "teamRanking.sig_ws_steep",   type: "text", description: "Sigmoid steepness for ws (null = default 0.5)" },
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
        key: "teamRanking.separateMessages",
        type: "cycle",
        description: "Display each team's ranking in a separate chat message.",
        values: [
          { text: "Separate Msgs: ON", value: true },
          { text: "Separate Msgs: OFF", value: false },
        ],
      },
      {
        key: "teamRanking.sendType",
        type: "cycle",
        description: "Choose where to send team ranking messages.",
        values: [
          { text: "Send in Chat: Private", value: "private" },
          { text: "Send in Chat: Party", value: "party" },
          { text: "Send in Chat: Team", value: "team" },
        ],
      },
      {
        key: "teamRanking.maxTeams",
        type: "cycle",
        description: "Maximum number of top enemy teams to display in ranking.",
        values: [
          { text: "Max Teams: 1", value: 1 },
          { text: "Max Teams: 2", value: 2 },
          { text: "Max Teams: 3", value: 3 },
          { text: "Max Teams: 4", value: 4 },
          { text: "Max Teams: 5", value: 5 },
          { text: "Max Teams: 6", value: 6 },
          { text: "Max Teams: 7", value: 7 },
        ],
      },
      {
        key: "teamRanking.showYourTeam",
        type: "cycle",
        description: "Show your team in the ranking for reference (doesn't count toward max teams).",
        values: [
          { text: "Your Team: OFF", value: false },
          { text: "Your Team: ON", value: true },
        ],
      },
    ],
  },
  {
    label: "Auto Requeue (Game End)",
    description: "Automatically run /requeue after a game finishes.",
    defaults: {
      autoRequeueGameEnd: {
        enabled: true,
        delay: 1000,
      },
    },
    settings: [
      {
        type: "toggle",
        key: "autoRequeueGameEnd.enabled",
        text: ["OFF", "ON"],
        description:
          "Automatically executes /requeue when the game end message is detected.",
      },
      {
        type: "cycle",
        key: "autoRequeueGameEnd.delay",
        description: "Delay before executing the command.",
        values: [
          { text: "0ms", value: 0 },
          { text: "500ms", value: 500 },
          { text: "1000ms", value: 1000 },
          { text: "1500ms", value: 1500 },
          { text: "2000ms", value: 2000 },
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
      {
        key: "autoStats.sendType",
        type: "cycle",
        description: "Choose where to send automatic stats messages.",
        values: [
          { text: "Send in Chat: Party", value: "party" },
          { text: "Send in Chat: Private", value: "private" },
        ],
      },
    ],
  },
  {
    label: "Auto Party & All Chat",
    description: "Enable or disable automatic switching to party and all chat messages together.",
    defaults: {
      autoPartyAllChat: {
        enabled: true,
      },
    },
    settings: [
      {
        key: "autoPartyAllChat.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Enable or disable automatic switching to party and all chat messages.",
      },
    ],
  },
  {
    label: "Queue Dodge Messages",
    description: "Sends a random message 10s before the game starts.",
    defaults: {
      autoQdmsg: {
        enabled: false,
        msg1: "",
        msg2: "",
        msg3: "",
        msg4: "",
        msg5: "",
      },
    },
    settings: [
      {
        key: "autoQdmsg.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Enable or disable automatically sending a message.",
      },
      {
        key: "autoQdmsg.msg1",
        type: "text",
        description: "Message Slot 1. Use: /bwu setqdmsg 1 <message>",
      },
      {
        key: "autoQdmsg.msg2",
        type: "text",
        description: "Message Slot 2. Use: /bwu setqdmsg 2 <message>",
      },
      {
        key: "autoQdmsg.msg3",
        type: "text",
        description: "Message Slot 3. Use: /bwu setqdmsg 3 <message>",
      },
      {
        key: "autoQdmsg.msg4",
        type: "text",
        description: "Message Slot 4. Use: /bwu setqdmsg 4 <message>",
      },
      {
        key: "autoQdmsg.msg5",
        type: "text",
        description: "Message Slot 5. Use: /bwu setqdmsg 5 <message>",
      },
    ],
  },
  {
    label: "Sniped Messages",
    description: "Saves messages for the /bwu sniped command.",
    defaults: {
      snipedMsg: {
        msg1: "",
        msg2: "",
        msg3: "",
        msg4: "",
        msg5: "",
      },
    },
    settings: [
      {
        key: "snipedMsg.msg1",
        type: "text",
        description: "Message Slot 1. Use: /bwu setsniped 1 <message>",
      },
      {
        key: "snipedMsg.msg2",
        type: "text",
        description: "Message Slot 2. Use: /bwu setsniped 2 <message>",
      },
      {
        key: "snipedMsg.msg3",
        type: "text",
        description: "Message Slot 3. Use: /bwu setsniped 3 <message>",
      },
      {
        key: "snipedMsg.msg4",
        type: "text",
        description: "Message Slot 4. Use: /bwu setsniped 4 <message>",
      },
      {
        key: "snipedMsg.msg5",
        type: "text",
        description: "Message Slot 5. Use: /bwu setsniped 5 <message>",
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
    description: "Show the player's ping (requires Aurora API).",
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
  {
    label: "Stats - Rank",
    description: "Show the player's rank (MVP+, MVP++, etc).",
    defaults: {
      stats: {
        showRank: {
          enabled: true,
          displayMode: "chat",
        },
      },
    },
    settings: [
      {
        key: "stats.showRank.enabled",
        type: "toggle",
        text: ["OFF", "ON"],
        description: "Show the player's rank.",
      },
      {
        key: "stats.showRank.displayMode",
        type: "cycle",
        description: "Where to show Rank.",
        values: [
          { text: "Chat", value: "chat" },
          { text: "Tab", value: "tab" },
          { text: "Both", value: "both" },
        ],
      },
    ],
  },
  {
    label: "In-Game Tracker",
    description: "Track real-time events during BedWars matches (beds, kills, deaths, final kills).",
    defaults: {
      inGameTracker: {
        enabled: true,
        showNotifications: false,
        notifyKills: false,
        notifyDeaths: false,
        notifyFinalKills: false,
        notifyBedBreaks: false,
        saveGameLogs: false,
      },
    },
    settings: [
      {
        key: "inGameTracker.enabled",
        type: "cycle",
        description: "Enable real-time tracking of in-game events.",
        values: [
          { text: "Tracking: OFF", value: false },
          { text: "Tracking: ON", value: true },
        ],
      },
      {
        key: "inGameTracker.showNotifications",
        type: "cycle",
        description: "Show chat notifications when tracked events occur.",
        values: [
          { text: "Notifications: OFF", value: false },
          { text: "Notifications: ON", value: true },
        ],
      },
      {
        key: "inGameTracker.notifyKills",
        type: "cycle",
        description: "Show notification when a player gets a kill.",
        values: [
          { text: "Notify Kills: OFF", value: false },
          { text: "Notify Kills: ON", value: true },
        ],
      },
      {
        key: "inGameTracker.notifyDeaths",
        type: "cycle",
        description: "Show notification when a player dies.",
        values: [
          { text: "Notify Deaths: OFF", value: false },
          { text: "Notify Deaths: ON", value: true },
        ],
      },
      {
        key: "inGameTracker.notifyFinalKills",
        type: "cycle",
        description: "Show notification when a player gets a final kill.",
        values: [
          { text: "Notify Final Kills: OFF", value: false },
          { text: "Notify Final Kills: ON", value: true },
        ],
      },
      {
        key: "inGameTracker.notifyBedBreaks",
        type: "cycle",
        description: "Show notification when a player breaks a bed.",
        values: [
          { text: "Notify Bed Breaks: OFF", value: false },
          { text: "Notify Bed Breaks: ON", value: true },
        ],
      },
      {
        key: "inGameTracker.saveGameLogs",
        type: "cycle",
        description: "Save game messages to log files for debugging/review.",
        values: [
          { text: "Save Logs: OFF", value: false },
          { text: "Save Logs: ON", value: true },
        ],
      },
    ],
  },
  {
    label: "In-Game Tracker - Tab Display",
    description: "Show real-time game stats in tab list. Alternates between regular stats and game stats.",
    defaults: {
      inGameTracker: {
        showInTab: false,
        tabDelay: 5,
        tabShowKills: true,
        tabShowDeaths: true,
        tabShowFinalKills: true,
        tabShowBedBreaks: true,
      },
    },
    settings: [
      {
        key: "inGameTracker.showInTab",
        type: "cycle",
        description: "Show real-time game stats in tab. Alternates with regular stats.",
        values: [
          { text: "Show In Tab: OFF", value: false },
          { text: "Show In Tab: ON", value: true },
        ],
      },
      {
        key: "inGameTracker.tabDelay",
        type: "cycle",
        description: "Delay between alternating regular stats and game stats in tab.",
        values: [
          { text: "Delay: 5 seconds", value: 5 },
          { text: "Delay: 6 seconds", value: 6 },
          { text: "Delay: 7 seconds", value: 7 },
          { text: "Delay: 8 seconds", value: 8 },
          { text: "Delay: 9 seconds", value: 9 },
          { text: "Delay: 10 seconds", value: 10 },
        ],
      },
      {
        key: "inGameTracker.tabShowKills",
        type: "cycle",
        description: "Show kills in tab game stats.",
        values: [
          { text: "Show Kills: OFF", value: false },
          { text: "Show Kills: ON", value: true },
        ],
      },
      {
        key: "inGameTracker.tabShowDeaths",
        type: "cycle",
        description: "Show deaths in tab game stats.",
        values: [
          { text: "Show Deaths: OFF", value: false },
          { text: "Show Deaths: ON", value: true },
        ],
      },
      {
        key: "inGameTracker.tabShowFinalKills",
        type: "cycle",
        description: "Show final kills in tab game stats.",
        values: [
          { text: "Show Final Kills: OFF", value: false },
          { text: "Show Final Kills: ON", value: true },
        ],
      },
      {
        key: "inGameTracker.tabShowBedBreaks",
        type: "cycle",
        description: "Show bed breaks in tab game stats.",
        values: [
          { text: "Show Bed Breaks: OFF", value: false },
          { text: "Show Bed Breaks: ON", value: true },
        ],
      },
    ],
  },
];