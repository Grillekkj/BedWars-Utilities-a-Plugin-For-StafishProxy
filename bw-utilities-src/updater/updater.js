const { UpdateManager } = require("./UpdateManager");

class Updater {
  constructor(api, metadata) {
    this.api = api;
    this.metadata = metadata;

    const log = (msg) => console.log(`[BWU Updater] ${msg}`);
    const logError = (msg) => console.error(`[BWU Updater] ${msg}`);
    const logDebug = (msg) => {
      if (this.api?.debug) console.log(`[BWU Updater Debug] ${msg}`);
    };

    this.updateManager = new UpdateManager(metadata, log, logError, logDebug);
  }  async checkForUpdates() {
    const checkedKey = `bwuUpdateChecked_${this.metadata.version}`;
    if (globalThis[checkedKey]) return;
    globalThis[checkedKey] = true;
    await this.updateManager.checkForNewVersion();
  }
}

module.exports = { Updater };

