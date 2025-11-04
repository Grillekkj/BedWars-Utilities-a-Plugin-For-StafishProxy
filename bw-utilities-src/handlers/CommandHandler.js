class CommandHandler {
  constructor(api, tabManager, chatHandler, partyFinder) {
    this.api = api;
    this.tabManager = tabManager;
    this.chatHandler = chatHandler;
    this.partyFinder = partyFinder;
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

  handleSetPolsuCommand(ctx) {
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

    this.api.config.set("main.polsuApiKey", trimmedKey);
    this.api.chat(`${this.api.getPrefix()} §aPolsu API key set successfully!`);
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

  sendSnipedMessage(slot) {
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

    this.api.sendChatToServer(`/ac ${message}`);
  }

  handleSnipedCommand(ctx) {
    const slot = Number.parseInt(ctx.args.slot, 10);
    if (Number.isNaN(slot)) {
      this.api.chat(
        `${this.api.getPrefix()} §cUsage: /bwu sniped <slot_number: 1-5>`
      );
      return;
    }
    this.sendSnipedMessage(slot);
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
}

module.exports = CommandHandler;
