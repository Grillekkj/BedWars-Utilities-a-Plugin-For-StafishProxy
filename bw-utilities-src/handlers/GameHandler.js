class GameHandler {
  constructor(api, chatHandler, tabManager) {
    this.api = api;
    this.chatHandler = chatHandler;
    this.tabManager = tabManager;
    this.gameStarted = false;
    this.lastCleanMessage = null;
  }

  isBedwarsStartMessage(currentCleanMessage, lastCleanMessage) {
    // Original Hexze's auto who (don't work for dream mode)
    const originalStartText = "Protect your bed and destroy the enemy beds.";
    if (currentCleanMessage.trim() === originalStartText) {
      return true;
    }

    // New auto who by me (work for any dream mode)
    // Soon will work with bw duels too give me some time :sob:
    const divider =
      "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬";
    const titleText = "Bed Wars";

    if (
      lastCleanMessage &&
      lastCleanMessage.trim() === divider &&
      currentCleanMessage.trim() === titleText
    ) {
      return true;
    }

    return false;
  }

  async handleGameStart(currentCleanMessage, lastCleanMessage) {
    if (!this.api.config.get("autoWho.enabled")) return;

    // Only runs auto /who once per game (necessary for the new method since the trigger also happens at the end of each game)
    if (this.isBedwarsStartMessage(currentCleanMessage, lastCleanMessage)) {
      if (this.gameStarted) return;

      this.gameStarted = true;

      const delay = this.api.config.get("autoWho.delay") || 0;

      setTimeout(() => {
        this.api.sendChatToServer("/who");
      }, delay);
    }
  }

  resetGameState() {
    this.gameStarted = false;
    this.lastCleanMessage = null;
  }
}

module.exports = GameHandler;

