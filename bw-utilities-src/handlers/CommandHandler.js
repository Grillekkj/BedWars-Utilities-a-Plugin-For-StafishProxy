class CommandHandler {
  constructor(api, tabManager, chatHandler) {
    this.api = api;
    this.tabManager = tabManager;
    this.chatHandler = chatHandler;
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

    const numericThreshold = parseFloat(threshold);

    if (isNaN(numericThreshold) || numericThreshold < 0) {
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
}

module.exports = CommandHandler;

