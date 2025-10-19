const CacheManager = require("./cache/CacheManager");
const ApiService = require("./api/ApiService");
const StatsFormatter = require("./utils/StatsFormatter");
const ChatHandler = require("./handlers/ChatHandler");
const CommandHandler = require("./handlers/CommandHandler");
const GameHandler = require("./handlers/GameHandler");
const TeamRanking = require("./services/TeamRanking");
const TabManager = require("./services/TabManager");
const PartyFinder = require("./services/PartyFinder");

class BedWarsUtilities {
  constructor(api) {
    this.api = api;
    this.cacheManager = new CacheManager(api);
    this.apiService = new ApiService(api, this.cacheManager);
    this.statsFormatter = new StatsFormatter(api);
    this.teamRanking = new TeamRanking(api, this.apiService, this);
    this.partyFinder = new PartyFinder(api, this.apiService);
    this.tabManager = new TabManager(
      api,
      this.apiService,
      this.statsFormatter,
      this
    );

    this.chatHandler = new ChatHandler(
      api,
      this.apiService,
      this.statsFormatter,
      this.tabManager,
      this
    );
    this.commandHandler = new CommandHandler(
      api,
      this.tabManager,
      this.chatHandler,
      this.partyFinder
    );
    this.gameHandler = new GameHandler(api, this.chatHandler, this.tabManager);
    this.autoStatsMode = false;
    this.checkedPlayersInAutoMode = new Set();
    this.lastCleanMessage = null;
    this.requeueTriggered = false;
    this.rankingSentThisMatch = false;
    this.resolvedNicks = new Map();
    this.realNameToNickMap = new Map();
  }

  _getDenickerInstance() {
    try {
      return this.api.getPluginInstance("denicker");
    } catch (e) {
      console.warn(`[BWU] Failed to get denicker instance: ${e?.stack ?? e}`);
      return null;
    }
  }

  registerHandlers() {
    this.api.on("player_join", () => this._initialApiKeyCheck());
    this.api.on("chat", (event) => this.onChat(event));
    this.api.on("respawn", () => this.onWorldChange());
    this.api.on("denicker:nick_resolved", (data) => this.onNickResolved(data));

    this.api.commands((registry) => {
      registry
        .command("find")
        .description("Finds players for your party based on criteria.")
        .argument("<mode>", { description: "Mode (2, 3, 4) or 'stop'" })
        .argument("[playersToFind]", {
          description: "Number of players to find",
          // Not rlly optional, just so ppl can /bwu find stop
          optional: true,
        })
        .argument("[fkdrThreshold]", {
          description: "Minimum FKDR required",
          // Not rlly optional, just so ppl can /bwu find stop
          optional: true,
        })
        .argument("positions", {
          description: "Optional positions",
          optional: true,
          type: "greedy",
        })
        .handler((ctx) => this.commandHandler.handleFindCommand(ctx));

      registry
        .command("stats")
        .description("Shows the Bedwars statistics for a player.")
        .argument("<nickname>", { description: "The player to check" })
        .handler((ctx) => this.commandHandler.handleStatsCommand(ctx));

      registry
        .command("setthreshold")
        .description("Sets the FKDR threshold for auto-requeue.")
        .argument("<threshold>", { description: "The FKDR value (e.g., 10.0)" })
        .handler((ctx) => this.commandHandler.handleSetThresholdCommand(ctx));

      registry
        .command("clearstats")
        .description("Clears stats of players.")
        .handler((ctx) => this.commandHandler.handleClearCommand(ctx));

      registry
        .command("setkey")
        .description("Set your Hypixel API key")
        .argument("<apikey>", { description: "Your Hypixel API key" })
        .handler((ctx) => this.commandHandler.handleSetKeyCommand(ctx));

      registry
        .command("setpolsu")
        .description("Set your Polsu API key")
        .argument("<apikey>", { description: "Your Polsu API key" })
        .handler((ctx) => this.commandHandler.handleSetPolsuCommand(ctx));
    });
  }

  onNickResolved({ nickName, realName }) {
    this.resolvedNicks.set(nickName.toLowerCase(), realName);
    this.realNameToNickMap.set(realName.toLowerCase(), nickName);

    if (this.tabManager.managedPlayers.has(nickName)) {
      this.tabManager.addPlayerStatsToTab(nickName, realName);
    }
  }

  async _initialApiKeyCheck() {
    setTimeout(async () => {
      const result = await this.apiService.testHypixelApiKey();
      if (result.isValid) {
        this.api.sendTitle(
          "§6BW Utilities",
          "§aHypixel API key is functional!",
          10, // Fade in (ticks)
          40, // Stay (ticks)
          10 // Fade out (ticks)
        );
      } else {
        this.api.sendTitle(
          "§6BW Utilities",
          "§cHypixel API key is not functional! Please set a valid key",
          10, // Fade in (ticks)
          40, // Stay (ticks)
          10 // Fade out (ticks)
        );
      }
    }, 3000);
  }

  async onChat(event) {
    try {
      const cleanMessage = event.message.replaceAll(/§[0-9a-fk-or]/g, "");

      if (this.partyFinder.isActive) {
        this.partyFinder.handleChatMessage(cleanMessage);
      }

      await this.gameHandler.handleGameStart(
        cleanMessage,
        this.lastCleanMessage
      );
      this.lastCleanMessage = cleanMessage;

      const whoMatch = cleanMessage.match(/^ONLINE: (.*)$/);
      if (whoMatch) {
        if (this.autoStatsMode) {
          this.autoStatsMode = false;
          this.checkedPlayersInAutoMode.clear();
          this.api.chat(
            `${this.api.getPrefix()} §cAutomatic stats mode DISABLED.`
          );
        }
        this.tabManager.clearManagedPlayers("all");

        const originalPlayerNames = whoMatch[1]
          .split(", ")
          .map((p) => p.trim())
          .filter(Boolean);

        const denicker = this._getDenickerInstance();

        const resolvedPlayerNames = originalPlayerNames.map((nickName) => {
          let realName = this.resolvedNicks.get(nickName.toLowerCase());

          if (!realName && denicker) {
            realName = denicker.getRealName(nickName);
          }

          const finalName = realName || nickName;

          if (nickName.toLowerCase() !== finalName.toLowerCase()) {
            this.realNameToNickMap.set(finalName.toLowerCase(), nickName);
          }

          return finalName;
        });

        await this.processPlayerData(originalPlayerNames, resolvedPlayerNames);
        return;
      }

      await this.chatHandler.handleChat(
        cleanMessage,
        this.autoStatsMode,
        this.checkedPlayersInAutoMode,
        (mode) => {
          this.autoStatsMode = mode;
        }
      );
    } catch (error) {
      console.error(`[BWU CRITICAL ON_CHAT]: ${error.stack}`);
    }
  }

  onWorldChange() {
    this.tabManager.clearManagedPlayers("all");
    this.gameHandler.resetGameState();
    this.lastCleanMessage = null;
    this.requeueTriggered = false;
    this.rankingSentThisMatch = false;
    this.resolvedNicks.clear();
    this.realNameToNickMap.clear();

    if (this.autoStatsMode) {
      this.autoStatsMode = false;
      this.checkedPlayersInAutoMode.clear();
      this.api.chat(`${this.api.getPrefix()} §cAutomatic stats mode DISABLED.`);
    }
  }

  async processPlayerData(originalPlayerNames, resolvedPlayerNames) {
    for (let i = 0; i < originalPlayerNames.length; i++) {
      const originalName = originalPlayerNames[i];
      const resolvedName = resolvedPlayerNames[i];
      this.tabManager.addPlayerStatsToTab(originalName, resolvedName);
    }

    await this.teamRanking.processAndDisplayRanking(
      originalPlayerNames,
      this.rankingSentThisMatch
    );

    this.rankingSentThisMatch = true;
  }
}

module.exports = BedWarsUtilities;
