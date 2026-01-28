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
      const joinRegex = new RegExp(`^${myNick} has joined \\([0-9]+\\/[0-9]+\\)!$`);
      if (joinRegex.test(cleanMessage)) {
        setAutoStatsMode(true);
        checkedPlayers.clear();
        let sendType = this.api.config.get("autoStats.sendType") || "private";
        // If party mode but not in party, fallback to private
        if (sendType === "party" && this.bwuInstance.inParty !== true) {
          sendType = "private";
          this.api.debugLog(`[BWU] Auto Stats sendType: party -> private (not in party)`);
        } else {
          this.api.debugLog(`[BWU] Auto Stats sendType: ${sendType}`);
        }
        let modeText = sendType === "party" ? "Party Mode" : "Private Mode";
        const enabledMsg = `${this.api.getPrefix()} §aAutomatic stats mode ENABLED (§b${modeText}§a)`;
        this.api.chat(enabledMsg);
        return;
      }
    }

    const chatRegex = /^(?:\[.*?\]\s*)*(\w{3,16})(?::| ») (.*)/;
    const match = cleanMessage.match(chatRegex);
    if (!match) return;

    const senderName = match[1];
    const messageContent = match[2];

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
    }    let ping = null;
    if (this.api.config.get("stats.showPing")) {
      const uuid = await this.apiService.getUuid(playerName);
      if (uuid) {
        ping = await this.apiService.getPlayerPing(uuid);
      }
    }

    let sendType = this.api.config.get("autoStats.sendType") || "private";
    
    // Include prefix for private messages, exclude for party chat
    const includePrefix = !(sendType === "party" && this.bwuInstance.inParty === true);
    
    const message = this.statsFormatter.formatStats(
      "chat",
      playerName,
      stats,
      ping,
      { includePrefix }
    );

    if (sendType === "party" && this.bwuInstance.inParty === true) {
      this.api.debugLog(`[BWU] Auto Stats sending to party chat`);
      const cleanMsg = message.replaceAll(/§[0-9a-fk-or]/g, "");
      this.api.sendChatToServer(`/pc ${cleanMsg}`);
    } else if (sendType === "party") {
      this.api.debugLog(`[BWU] Auto Stats sendType: party -> private (not in party)`);
      this.api.chat(message);
    } else {
      this.api.chat(message);
    }
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

      let possibleMessages = [...validMessages];

      if (this.bwuInstance.lastQdmsg && validMessages.length > 1) {
        possibleMessages = validMessages.filter(
          (msg) => msg !== this.bwuInstance.lastQdmsg
        );
      }

      const randomMsg =
        possibleMessages[Math.floor(Math.random() * possibleMessages.length)];

      this.bwuInstance.lastQdmsg = randomMsg;

      this.api.sendChatToServer(`/ac ${randomMsg}`);
    } catch (e) {
      console.error(`[BWU] Error on handleAutoMessage: ${e.message}`);
    }
  }
}

module.exports = ChatHandler;