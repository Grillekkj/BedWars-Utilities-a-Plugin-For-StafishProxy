const path = require("node:path");
const fs = require("node:fs");

class CommandHandler {
  constructor(
    api,
    apiService,
    tabManager,
    chatHandler,
    partyFinder,
    bwuInstance
  ) {
    this.api = api;
    this.apiService = apiService;
    this.tabManager = tabManager;
    this.chatHandler = chatHandler;
    this.partyFinder = partyFinder;
    this.bwu = bwuInstance;
    this.fs = fs;
    const baseDir = process.pkg
      ? path.dirname(process.execPath)
      : path.join(__dirname, "..", "..", "..");

    const dataDir = path.join(baseDir, "data");

    if (!this.fs.existsSync(dataDir)) {
      this.fs.mkdirSync(dataDir, { recursive: true });
    }

    this.macrosFilePath = path.join(dataDir, "bwu_macros.json");

    this.shoutCooldown = 65000;
    this.lastShoutTime = 0;
    this.pendingShoutMessage = null;
    this.shoutTimer = null;
  }

  _getMacros() {
    try {
      if (this.fs.existsSync(this.macrosFilePath)) {
        const data = this.fs.readFileSync(this.macrosFilePath, "utf8");
        return JSON.parse(data);
      }
    } catch (e) {
      this.api.debugLog(`[BWU] Error reading macros file: ${e.message}`);
      return {};
    }
    return {};
  }

  _saveMacros(macros) {
    try {
      const data = JSON.stringify(macros, null, 2);
      this.fs.writeFileSync(this.macrosFilePath, data, "utf8");
    } catch (e) {
      this.api.debugLog(`[BWU] Error saving macros file: ${e.message}`);
    }
  }

  handleSetMacroCommand(ctx) {
    const name = ctx.args.name;
    const contentArray = ctx.args.content;

    if (!name || !contentArray || contentArray.length === 0) {
      this.api.chat(
        `${this.api.getPrefix()} §cUsage: /bwu setmacro <name> <content...>`
      );
      return;
    }

    const content = contentArray.join(" ");
    const macros = this._getMacros();

    macros[name.toLowerCase()] = content;

    this._saveMacros(macros);
    this.api.chat(
      `${this.api.getPrefix()} §aMacro '${name}' saved with content: §f${content}`
    );
  }

  handleDelMacroCommand(ctx) {
    const name = ctx.args.name;
    if (!name) {
      this.api.chat(`${this.api.getPrefix()} §cUsage: /bwu delmacro <name>`);
      return;
    }

    const nameLower = name.toLowerCase();
    const macros = this._getMacros();

    if (macros[nameLower]) {
      delete macros[nameLower];
      this._saveMacros(macros);
      this.api.chat(
        `${this.api.getPrefix()} §aMacro '${name}' successfully removed!`
      );
    } else {
      this.api.chat(`${this.api.getPrefix()} §cMacro '${name}' not found.`);
    }
  }

  handleListMacrosCommand(ctx) {
    const macros = this._getMacros();
    const names = Object.keys(macros);

    if (names.length === 0) {
      this.api.chat(
        `${this.api.getPrefix()} §cYou have no saved macros. Use /bwu setmacro <name> <content...>`
      );
      return;
    }

    this.api.chat(`${this.api.getPrefix()} §6Saved Macros (${names.length}):`);

    for (const name of names) {
      const content = macros[name];

      const chatComponent = {
        text: `§e${name}: §f${content} `,
        extra: [
          {
            text: "§a[Run]",
            color: "green",
            hoverEvent: {
              action: "show_text",
              value: "§aClick to run /bwu m " + name,
            },
            clickEvent: {
              action: "run_command",
              value: `/bwu m ${name}`,
            },
          },
          {
            text: " §e[Edit]",
            color: "yellow",
            hoverEvent: {
              action: "show_text",
              value: "§eClick to edit this macro",
            },
            clickEvent: {
              action: "suggest_command",
              value: `/bwu setmacro ${name} ${content}`,
            },
          },
          {
            text: " §c[Remove]",
            color: "red",
            hoverEvent: {
              action: "show_text",
              value: "§cClick to remove /bwu delmacro " + name,
            },
            clickEvent: {
              action: "run_command",
              value: `/bwu delmacro ${name}`,
            },
          },
        ],
      };
      this.api.chat(chatComponent);
    }
  }

  handleRunMacroCommand(ctx) {
    const name = ctx.args.name;
    if (!name) {
      this.api.chat(`${this.api.getPrefix()} §cUsage: /bwu m <name>`);
      return;
    }

    const nameLower = name.toLowerCase();
    const macros = this._getMacros();
    const content = macros[nameLower];

    if (content) {
      this.api.sendChatToServer(content);
    } else {
      this.api.chat(
        `${this.api.getPrefix()} §cMacro '${name}' not found. Use /bwu macros to list.`
      );
    }
  }

  handleFindCommand(ctx) {
    if (ctx.args.mode && ctx.args.mode.toLowerCase() === "stop") {
      this.partyFinder.stop();
      return;
    }

    const mode = ctx.args.mode;
    const playersToFind = ctx.args.playersToFind;
    const fkdrThreshold = ctx.args.fkdrThreshold;
    const positions = ctx.args.positions || [];

    const args = [mode, playersToFind, fkdrThreshold, ...positions];

    this.partyFinder.start(args);
  }

  async handleStatsCommand(ctx) {
    const playerName = ctx.args.nickname;

    if (
      !playerName ||
      typeof playerName !== "string" ||
      playerName.trim().length === 0
    ) {
      this.api.chat(`${this.api.getPrefix()} §cUsage: /bwu stats <nickname>`);
      return;
    }

    await this.chatHandler.displayStatsForPlayer(playerName.trim());
  }

  handleSetThresholdCommand(ctx) {
    const threshold = ctx.args.threshold;

    const numericThreshold = Number.parseFloat(threshold);

    if (Number.isNaN(numericThreshold) || numericThreshold < 0) {
      this.api.chat(
        `${this.api.getPrefix()} §cError: Please provide a valid number for the threshold (e.g., 10.0).`
      );
      return;
    }

    this.api.config.set("autoRequeue.fkdrThreshold", numericThreshold);

    this.api.chat(
      `${this.api.getPrefix()} §aFKDR threshold for auto-requeue set to §f${numericThreshold.toFixed(
        2
      )}§a.`
    );
  }

  handleClearCommand(ctx) {
    this.tabManager.clearManagedPlayers("all");
    this.api.chat(`${this.api.getPrefix()} §aStats cleared successfully!`);
  }

  handleSetKeyCommand(ctx) {
    const apikey = ctx.args.apikey;

    if (!apikey || typeof apikey !== "string") {
      this.api.chat(
        `${this.api.getPrefix()} §cError: Please provide a valid API key!`
      );
      return;
    }

    const trimmedKey = apikey.trim();
    if (trimmedKey.length === 0) {
      this.api.chat(
        `${this.api.getPrefix()} §cError: The key cannot be empty!`
      );
      return;
    }

    this.api.config.set("main.hypixelApiKey", trimmedKey);
    this.api.chat(
      `${this.api.getPrefix()} §aHypixel API key set successfully!`
    );
  }

  handleSetAuroraCommand(ctx) {
    const apikey = ctx.args.apikey;

    if (!apikey || typeof apikey !== "string") {
      this.api.chat(
        `${this.api.getPrefix()} §cError: Please provide a valid API key!`
      );
      return;
    }

    const trimmedKey = apikey.trim();
    if (trimmedKey.length === 0) {
      this.api.chat(
        `${this.api.getPrefix()} §cError: The key cannot be empty!`
      );
      return;
    }

    this.api.config.set("main.auroraApiKey", trimmedKey);
    this.api.chat(`${this.api.getPrefix()} §aAurora API key set successfully!`);
  }

  sendQdMessage(slot) {
    if (!slot || slot < 1 || slot > 5) {
      this.api.chat(
        `${this.api.getPrefix()} §cInvalid slot. Use a number from 1 to 5.`
      );
      return;
    }

    const message = this.api.config.get(`autoQdmsg.msg${slot}`);
    if (!message || message.trim().length === 0) {
      this.api.chat(
        `${this.api.getPrefix()} §cSlot ${slot} is empty. Use /bwu setqdmsg ${slot} <message> to save.`
      );
      return;
    }

    this.api.sendChatToServer(`/ac ${message}`);
  }

  handleQdmsgCommand(ctx) {
    const slot = Number.parseInt(ctx.args.slot, 10);
    if (Number.isNaN(slot)) {
      this.api.chat(
        `${this.api.getPrefix()} §cUsage: /bwu qdmsg <slot_number: 1-5>`
      );
      return;
    }
    this.sendQdMessage(slot);
  }

  handleSetQdmsgCommand(ctx) {
    const slot = Number.parseInt(ctx.args.slot, 10);
    const messageArray = ctx.args.message;

    if (Number.isNaN(slot) || slot < 1 || slot > 5) {
      this.api.chat(
        `${this.api.getPrefix()} §cUsage: /bwu setqdmsg <slot: 1-5> <message>`
      );
      return;
    }

    let finalMessage = "";
    if (Array.isArray(messageArray) && messageArray.length > 0) {
      finalMessage = messageArray.join(" ");
    }

    if (finalMessage.length === 0) {
      this.api.config.set(`autoQdmsg.msg${slot}`, "");
      this.api.chat(
        `${this.api.getPrefix()} §aMessage from Slot ${slot} has been cleared.`
      );
      return;
    }

    this.api.config.set(`autoQdmsg.msg${slot}`, finalMessage);
    this.api.chat(
      `${this.api.getPrefix()} §aSlot ${slot} saved: §f${finalMessage}`
    );
  }

  handleListQdmsgCommand(_ctx) {
    this.api.chat(`${this.api.getPrefix()} §6Saved Messages (Queue Dodge):`);
    let hasMessages = false;
    for (let i = 1; i <= 5; i++) {
      const msg = this.api.config.get(`autoQdmsg.msg${i}`);
      if (msg && msg.trim().length > 0) {
        hasMessages = true;
        const chatComponent = {
          text: `§eSlot ${i}: §f${msg} `,
          extra: [
            {
              text: "§7[Send]",
              color: "gray",
              hoverEvent: {
                action: "show_text",
                value: "§aClick to send this message",
              },
              clickEvent: {
                action: "run_command",
                value: `/bwu qdmsg ${i}`,
              },
            },
            {
              text: " §c[Edit]",
              color: "red",
              hoverEvent: {
                action: "show_text",
                value: "§eClick to edit this message",
              },
              clickEvent: {
                action: "suggest_command",
                value: `/bwu setqdmsg ${i} ${msg}`,
              },
            },
          ],
        };
        this.api.chat(chatComponent);
      } else {
        this.api.chat(`§eSlot ${i}: §7[Empty]`);
      }
    }
    if (!hasMessages) {
      this.api.chat(`§cNo saved messages. Use /bwu setqdmsg <1-5> <message>`);
    }
  }

  sendSnipedMessage(slot, channel) {
    if (!slot || slot < 1 || slot > 5) {
      this.api.chat(
        `${this.api.getPrefix()} §cInvalid slot. Use a number from 1 to 5.`
      );
      return;
    }

    const message = this.api.config.get(`snipedMsg.msg${slot}`);
    if (!message || message.trim().length === 0) {
      this.api.chat(
        `${this.api.getPrefix()} §cSlot ${slot} is empty. Use /bwu setsniped ${slot} <message> to save.`
      );
      return;
    }

    const commandPrefix =
      channel && channel.toLowerCase() === "ac" ? "/ac" : "/shout";

    if (commandPrefix === "/shout") {
      this.sendShoutWithCooldown(message);
    } else {
      this.api.sendChatToServer(`${commandPrefix} ${message}`);
    }
  }

  sendShoutWithCooldown(message) {
    const now = Date.now();
    const timeSinceLastShout = now - this.lastShoutTime;
    const remainingCooldown = this.shoutCooldown - timeSinceLastShout;

    if (timeSinceLastShout >= this.shoutCooldown) {
      this.bwu._bypassShoutInterception = true;
      this.api.sendChatToServer(`/shout ${message}`);
      this.lastShoutTime = now;
      this.pendingShoutMessage = null;

      if (this.shoutTimer) {
        clearTimeout(this.shoutTimer);
        this.shoutTimer = null;
      }
    } else {
      this.pendingShoutMessage = message;

      if (this.shoutTimer) {
        clearTimeout(this.shoutTimer);
      }

      this.shoutTimer = setTimeout(() => {
        if (this.pendingShoutMessage) {
          this.bwu._bypassShoutInterception = true;
          this.api.sendChatToServer(`/shout ${this.pendingShoutMessage}`);
          this.lastShoutTime = Date.now();
          this.pendingShoutMessage = null;
          this.shoutTimer = null;
        }
      }, remainingCooldown);

      const secondsLeft = Math.ceil(remainingCooldown / 1000);
      this.api.chat(
        `${this.api.getPrefix()} §eShout queued! Will send in §f${secondsLeft}s §e(cooldown active)`
      );
    }
  }

  cancelPendingShout() {
    if (this.shoutTimer) {
      clearTimeout(this.shoutTimer);
      this.shoutTimer = null;
      this.pendingShoutMessage = null;
    }
  }

  handleSnipedCommand(ctx) {
    const slot = Number.parseInt(ctx.args.slot, 10);
    const channel = ctx.args.channel;

    if (Number.isNaN(slot)) {
      this.api.chat(
        `${this.api.getPrefix()} §cUsage: /bwu sniped <slot_number: 1-5> [ac]`
      );
      return;
    }
    this.sendSnipedMessage(slot, channel);
  }

  handleSetSnipedCommand(ctx) {
    const slot = Number.parseInt(ctx.args.slot, 10);
    const messageArray = ctx.args.message;

    if (Number.isNaN(slot) || slot < 1 || slot > 5) {
      this.api.chat(
        `${this.api.getPrefix()} §cUsage: /bwu setsniped <slot: 1-5> <message>`
      );
      return;
    }

    let finalMessage = "";
    if (Array.isArray(messageArray) && messageArray.length > 0) {
      finalMessage = messageArray.join(" ");
    }

    if (finalMessage.length === 0) {
      this.api.config.set(`snipedMsg.msg${slot}`, "");
      this.api.chat(
        `${this.api.getPrefix()} §aMessage from Slot ${slot} has been cleared.`
      );
      return;
    }

    this.api.config.set(`snipedMsg.msg${slot}`, finalMessage);
    this.api.chat(
      `${this.api.getPrefix()} §aSlot ${slot} saved: §f${finalMessage}`
    );
  }

  handleListSnipedCommand(_ctx) {
    this.api.chat(`${this.api.getPrefix()} §6Saved Messages (Sniped):`);
    let hasMessages = false;
    for (let i = 1; i <= 5; i++) {
      const msg = this.api.config.get(`snipedMsg.msg${i}`);
      if (msg && msg.trim().length > 0) {
        hasMessages = true;
        const chatComponent = {
          text: `§eSlot ${i}: §f${msg} `,
          extra: [
            {
              text: "§7[Send]",
              color: "gray",
              hoverEvent: {
                action: "show_text",
                value: "§aClick to send this message",
              },
              clickEvent: {
                action: "run_command",
                value: `/bwu sniped ${i}`,
              },
            },
            {
              text: " §c[Edit]",
              color: "red",
              hoverEvent: {
                action: "show_text",
                value: "§eClick to edit this message",
              },
              clickEvent: {
                action: "suggest_command",
                value: `/bwu setsniped ${i} ${msg}`,
              },
            },
          ],
        };
        this.api.chat(chatComponent);
      } else {
        this.api.chat(`§eSlot ${i}: §7[Empty]`);
      }
    }
    if (!hasMessages) {
      this.api.chat(`§cNo saved messages. Use /bwu setsniped <1-5> <message>`);
    }
  }

  handlePingCommand(_ctx) {
    try {
      const player = this.api.getCurrentPlayer();
      if (!player?.uuid) {
        this.api.chat(
          `${this.api.getPrefix()} §cCould not retrieve your player data.`
        );
        return;
      }

      const playerInfo = this.api.getPlayerInfo(player.uuid);

      if (playerInfo?.ping === undefined) {
        this.api.chat(
          `${this.api.getPrefix()} §cCould not retrieve your ping at this time.`
        );
      } else {
        this.api.chat(
          `${this.api.getPrefix()} §aYour ping is: §f${playerInfo.ping}ms`
        );
      }
    } catch (e) {
      this.api.chat(
        `${this.api.getPrefix()} §cAn error occurred while fetching ping: ${
          e.message
        }`
      );
      console.error(`[BWU Ping Error]: ${e.stack}`);
    }
  }

  async handleMcnamesCommand(ctx) {
    const playerName = ctx.args.ign;

    if (!playerName || typeof playerName !== "string") {
      this.api.chat(`${this.api.getPrefix()} §cUsage: /bwu mcnames <ign>`);
      return;
    }

    try {
      this.api.chat(
        `${this.api.getPrefix()} §7Fetching name history for §b${playerName}§7...`
      );

      const nameData = await this.apiService.getNameHistory(playerName);

      if (!nameData) {
        this.api.chat(
          `${this.api.getPrefix()} §cCouldn't find name history for §f${playerName}§c.`
        );
        return;
      }

      this.api.chat(
        `${this.api.getPrefix()} §aCurrent name: §f${nameData.currentName}`
      );
      this.api.chat(`${this.api.getPrefix()} §7UUID: §f${nameData.uuid}`);

      if (nameData.history.length > 0) {
        this.api.chat(
          `${this.api.getPrefix()} §6Name History §7(${
            nameData.history.length
          } names):`
        );

        nameData.history.forEach((entry, index) => {
          const dateStr = entry.changedAt
            ? new Date(entry.changedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "Original";

          const accurateTag = entry.accurate ? "§a✓" : "§c✗";
          const lastSeen = entry.lastSeenAt
            ? ` §8(Last seen: ${new Date(entry.lastSeenAt).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }
              )})`
            : "";

          this.api.chat(
            `${this.api.getPrefix()} §7${index + 1}. §f${
              entry.name
            } §7- §e${dateStr} ${accurateTag}${lastSeen}`
          );
        });
      } else {
        this.api.chat(`${this.api.getPrefix()} §7No name history found.`);
      }
    } catch (e) {
      this.api.chat(
        `${this.api.getPrefix()} §cAn error occurred while fetching name history: ${
          e.message
        }`
      );
      console.error(`[BWU Mcnames Error]: ${e.stack}`);
    }
  }

  handleSetInPartyCommand(ctx) {
    const value = ctx.args.value;

    if (!value) {
      this.api.chat(
        `${this.api.getPrefix()} §cUsage: /bwu setinparty <true|false>`
      );
      return;
    }

    const valueLower = value.toLowerCase();

    if (valueLower === "true") {
      this.bwu.inParty = true;
      this.api.chat(
        `${this.api.getPrefix()} §a[DEBUG] inParty set to §ftrue`
      );
    } else if (valueLower === "false") {
      this.bwu.inParty = false;
      this.api.chat(
        `${this.api.getPrefix()} §a[DEBUG] inParty set to §ffalse`
      );
    } else {
      this.api.chat(
        `${this.api.getPrefix()} §cInvalid value. Use §ftrue §cor §ffalse§c.`
      );
    }
  }

  async handleRerankCommand(ctx) {
    try {
      this.api.chat(
        `${this.api.getPrefix()} §eRefreshing team ranking and tab list...`
      );

      // Clear existing tab stats
      this.tabManager.clearManagedPlayers("all");

      // Reset ranking sent flag to allow re-ranking
      this.bwu.rankingSentThisMatch = false;

      // Send /who command to trigger the ranking and tab refresh
      // The existing onChat handler will process the response
      this.api.sendChatToServer("/who");
    } catch (error) {
      this.api.chat(
        `${this.api.getPrefix()} §cError during rerank: ${error.message}`
      );
      console.error(`[BWU] Rerank error: ${error.stack}`);
    }
  }
}

module.exports = CommandHandler;
