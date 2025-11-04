const TEAM_MAP = {
  R: { name: "Red", color: "§c" },
  B: { name: "Blue", color: "§9" },
  G: { name: "Green", color: "§a" },
  Y: { name: "Yellow", color: "§e" },
  A: { name: "Aqua", color: "§b" },
  W: { name: "White", color: "§f" },
  P: { name: "Pink", color: "§d" },
  S: { name: "Gray", color: "§7" },
};

class GameHandler {
  constructor(api, chatHandler, tabManager) {
    this.api = api;
    this.chatHandler = chatHandler;
    this.tabManager = tabManager;
    this.gameStarted = false;
    this.lastCleanMessage = null;
    this.myTeamName = null;
  }

  getTeamLetter(rawPrefix) {
    if (!rawPrefix) return null;
    const match = rawPrefix.match(/[A-Z]/);
    return match ? match[0] : null;
  }

  getMyTeamName() {
    try {
      const me = this.api.getCurrentPlayer();
      if (!me?.uuid) return null;
      const myServerInfo = this.api.getPlayerInfo(me.uuid);
      if (!myServerInfo?.name) return null;
      const nameAsSeenByServer = myServerInfo.name;
      const myTeam = this.api.getPlayerTeam(nameAsSeenByServer);
      const myTeamLetter = this.getTeamLetter(myTeam?.prefix);

      return TEAM_MAP[myTeamLetter]?.name || null;
    } catch (e) {
      this.api.debugLog(`[BWU] Error getting team name: ${e.message}`);
      return null;
    }
  }

  isBedwarsStartMessage(currentCleanMessage, lastCleanMessage) {
    // Original Hexze's auto who (don't work for dream mode)
    const originalStartText = "Protect your bed and destroy the enemy beds.";
    if (currentCleanMessage.trim() === originalStartText) {
      return true;
    }

    // New auto who by me (work for any dream mode and duels (: )
    const divider =
      "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬";
    const validTitles = [
      "Bed Wars Lucky Blocks",
      "Bed Wars Ultimate",
      "Bed Wars Swappage",
      "Bed Wars Duels",
      "Bed Wars Rush",
      "Bed Wars",
    ];

    if (
      lastCleanMessage &&
      lastCleanMessage.trim() === divider &&
      validTitles.includes(currentCleanMessage.trim())
    ) {
      return true;
    }

    return false;
  }

  async handleGameStart(currentCleanMessage, lastCleanMessage) {
    if (this.api.config.get("autoWho.enabled")) {
      if (
        !this.gameStarted &&
        this.isBedwarsStartMessage(currentCleanMessage, lastCleanMessage)
      ) {
        this.gameStarted = true;
        const delay = this.api.config.get("autoWho.delay") || 0;
        setTimeout(() => {
          this.api.sendChatToServer("/who");
        }, delay);
      }
    }

    if (this.api.config.get("autoRequeueGameEnd.enabled")) {
      if (this.gameStarted && !this.myTeamName) {
        this.myTeamName = this.getMyTeamName();
        if (this.myTeamName) {
          this.api.debugLog(`[BWU] My team detected as: ${this.myTeamName}`);
        }
      }
    }
  }

  isBedwarsEndMessage(currentCleanMessage) {
    const divider =
      "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬";
    const endTitle = "Reward Summary";
    const trimmedMessage = currentCleanMessage.trim();

    if (trimmedMessage.startsWith(divider)) {
      const lines = trimmedMessage.split("\n");

      if (lines.length > 1 && lines[1].trim() === endTitle) {
        return true;
      }
    }

    return false;
  }

  isTeamEliminatedMessage(currentCleanMessage) {
    if (!this.myTeamName) return false;

    const eliminationMessage = `TEAM ELIMINATED > ${this.myTeamName} Team has been eliminated!`;

    if (currentCleanMessage.trim() === eliminationMessage) {
      return true;
    }

    return false;
  }

  async handleGameEnd(currentCleanMessage, lastGameMode) {
    if (!this.api.config.get("autoRequeueGameEnd.enabled")) return;
    if (!this.gameStarted) return;

    const isRewardSummary = this.isBedwarsEndMessage(currentCleanMessage);
    const isTeamEliminated = this.isTeamEliminatedMessage(currentCleanMessage);

    if (isRewardSummary || isTeamEliminated) {
      this.gameStarted = false;

      if (!lastGameMode) {
        this.api.chat(
          `${this.api.getPrefix()} §cAuto requeue failed: Could not determine last game mode.`
        );
        return;
      }

      const delay = this.api.config.get("autoRequeueGameEnd.delay") || 1000;
      const triggerReason = isRewardSummary ? "Game end" : "Team eliminated";

      this.api.chat(
        `${this.api.getPrefix()} §a${triggerReason} detected. Sending /play ${lastGameMode} in ${delay}ms...`
      );

      setTimeout(() => {
        this.api.sendChatToServer(`/play ${lastGameMode}`);
      }, delay);
    }
  }

  resetGameState() {
    this.gameStarted = false;
    this.lastCleanMessage = null;
    this.myTeamName = null;
  }
}

module.exports = GameHandler;
