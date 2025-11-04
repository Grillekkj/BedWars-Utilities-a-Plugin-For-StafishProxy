class ChatHandler {
  constructor(api, apiService, statsFormatter, tabManager, bwuInstance) {
    this.api = api;
    this.apiService = apiService;
    this.statsFormatter = statsFormatter;
    this.tabManager = tabManager;
    this.bwuInstance = bwuInstance;
  }

  async handleChat(
    cleanMessage,
    autoStatsMode,
    checkedPlayers,
    setAutoStatsMode
  ) {
    const me = this.api.getCurrentPlayer();
    if (!me?.uuid) return;
    const myNick = this.api.getPlayerInfo(me.uuid)?.name || me.name;

    // Auto Stats Mode
    if (this.api.config.get("autoStats.enabled") && !autoStatsMode) {
      const joinRegex = new RegExp(`^${myNick} has joined \\(\\d+\\/\\d+\\)!$`);
      if (joinRegex.test(cleanMessage)) {
        setAutoStatsMode(true);
        checkedPlayers.clear();
        this.api.chat(
          `${this.api.getPrefix()} §aAutomatic stats mode (private to you) ENABLED.`
        );
        return;
      }
    }

    const chatRegex = /^(?:\[.*?\]\s*)*(\w{3,16})(?::| ») (.*)/;
    const match = cleanMessage.match(chatRegex);
    if (!match) return;

    const senderName = match[1];
    const messageContent = match[2];
    if (senderName.toLowerCase() === myNick.toLowerCase()) return;

    if (autoStatsMode && !checkedPlayers.has(senderName.toLowerCase())) {
      await this.displayStatsForPlayer(senderName);
      checkedPlayers.add(senderName.toLowerCase());

      const autoRequeueConfig = this.api.config.get("autoRequeue");

      if (autoRequeueConfig?.enabled && !this.bwuInstance.requeueTriggered) {
        const stats = await this.apiService.getPlayerStats(senderName);

        if (
          stats &&
          !stats.isNicked &&
          stats.fkdr > autoRequeueConfig.fkdrThreshold
        ) {
          this.bwuInstance.requeueTriggered = true;

          this.api.chat(
            `${this.api.getPrefix()} §cAuto Requeue: ${senderName} have ${stats.fkdr.toFixed(
              2
            )} FKDR (limit: ${autoRequeueConfig.fkdrThreshold}).`
          );

          this.api.sendChatToServer("/requeue");
        }
      }
    }

    if (this.api.config.get("mentionStats.enabled")) {
      if (messageContent.toLowerCase().includes(myNick.toLowerCase())) {
        await this.displayStatsForPlayer(senderName);
      }
    }
  }

  async displayStatsForPlayer(playerName) {
    const stats = await this.apiService.getPlayerStats(playerName);

    if (!stats) {
      this.api.chat(
        `${this.api.getPrefix()} §cFailed to fetch stats for ${playerName}.`
      );
      return;
    }

    let ping = null;
    if (this.api.config.get("stats.showPing")) {
      const uuid = await this.apiService.getUuid(playerName);
      if (uuid) {
        ping = await this.apiService.getPlayerPing(uuid);
      }
    }

    const message = this.statsFormatter.formatStats(
      "chat",
      playerName,
      stats,
      ping
    );
    this.api.chat(message);
  }

  handleAutoMessage(cleanMessage) {
    try {
      if (cleanMessage.trim() !== "The game starts in 10 seconds!") {
        return;
      }

      if (!this.api.config.get("autoQdmsg.enabled")) {
        return;
      }

      const validMessages = [];
      for (let i = 1; i <= 5; i++) {
        const msg = this.api.config.get(`autoQdmsg.msg${i}`);
        if (msg && msg.trim().length > 0) {
          validMessages.push(msg);
        }
      }

      if (validMessages.length === 0) {
        return;
      }

      const randomMsg =
        validMessages[Math.floor(Math.random() * validMessages.length)];
      this.api.sendChatToServer(`/ac ${randomMsg}`);
    } catch (e) {
      console.error(`[BWU] Error on handleAutoMessage: ${e.message}`);
    }
  }
}

module.exports = ChatHandler;
