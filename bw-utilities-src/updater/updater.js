const crypto = require("node:crypto");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");

const { DependencyManager } = require("./DependencyManager");
const { UpdateManager } = require("./UpdateManager");
const { FileManager } = require("./FileManager");

class Updater {
  constructor(api, metadata) {
    this.api = api;
    this.metadata = metadata;
    this.baseDir = process.pkg
      ? path.dirname(process.execPath)
      : path.join(__dirname, "..", "..", "..", "..");
    this.dataDir = path.join(this.baseDir, "data");
    this.pluginsDir = path.join(this.baseDir, "plugins");
    this.depsDir = path.join(this.dataDir, "node_modules");
    this.executionId = crypto.randomBytes(4).toString("hex");

    this.log = (msg) => console.log(`[BWU Updater] ${msg}`);
    this.logError = (msg) => console.error(`[BWU Updater] ${msg}`);
    this.logDebug = (msg) => {
      // it seems to not work if i have my plugin with debug mode on but it works if i remove the if
      if (this.api?.debug) {
        console.log(`[BWU Updater Debug] ${msg}`);
      }
    };

    this.fileManager = new FileManager(this.dataDir, this.logDebug);
    this.dependencyManager = new DependencyManager(
      this.dataDir,
      this.depsDir,
      this.api,
      this.log,
      this.logError,
      this.logDebug
    );
    this.updateManager = new UpdateManager(
      this.pluginsDir,
      this.depsDir,
      this.metadata,
      this.log,
      this.logError,
      this.logDebug,
      this.fileManager
    );
  }

  async checkForUpdates() {
    if (globalThis.bwuUpdaterExecutionId) {
      return;
    }

    globalThis.bwuUpdaterExecutionId = this.executionId;

    try {
      if (this.fileManager.isUpdateInProgress()) {
        this.log("Update already in progress.");
        return;
      }

      if (this.fileManager.hasRecentUpdateCheck()) {
        this.log("Update check already performed recently.");
        return;
      }

      if (this.fileManager.hasRecentUpdateFailure()) {
        this.log("Skipping update check - recent update failure detected.");
        this.log("Will retry update checks after 24 hours.");
        return;
      }

      await this.dependencyManager.ensureDependencies(
        this.metadata.requiredDependencies,
        () => this.scheduleProxyShutdown()
      );

      this.log(
        `Checking for updates... (Current Version: ${this.metadata.version})`
      );

      let release;
      try {
        release = await this.updateManager.getLatestRelease();
      } catch (e) {
        this.logDebug(`GitHub connection error: ${e.message}`);
        this.logDebug(`Error stack: ${e.stack}`);
        this.logError(`Failed to connect to GitHub: ${e.message}`);
        this.log(
          "Update check failed. Plugin will continue running with current version."
        );
        return;
      }

      const latestVersion = release.tag_name;

      if (
        !this.updateManager.isNewerVersion(this.metadata.version, latestVersion)
      ) {
        this.log(`Plugin is up to date.`);
        this.fileManager.clearUpdateFailureMarker();
        this.fileManager.markUpdateCheck();
        return;
      }

      this.log(
        `New version ${latestVersion} found. Starting update process...`
      );
      this.fileManager.markUpdateInProgress();

      const uniqueId = crypto.randomBytes(8).toString("hex");
      const updateDir = path.join(os.tmpdir(), `bwu-update-${uniqueId}`);
      const zipPath = path.join(updateDir, "update.zip");

      if (fs.existsSync(updateDir)) {
        fs.rmSync(updateDir, { recursive: true, force: true });
      }
      fs.mkdirSync(updateDir, { recursive: true });

      this.log(`Downloading ${release.zipball_url}...`);
      await this.fileManager.downloadFile(release.zipball_url, zipPath);

      this.log(`Extracting files...`);
      const extractedRoot = await this.updateManager.unzipUpdate(
        zipPath,
        updateDir
      );
      fs.unlinkSync(zipPath);

      this.log(`Preparing update files...`);
      this.updateManager.prepareUpdateFiles(extractedRoot);

      const updaterScriptPath = this.updateManager.createExternalUpdater(
        extractedRoot,
        updateDir
      );

      this.log(`Update downloaded successfully. Starting external updater...`);
      this.fileManager.markUpdateCheck();
      this.fileManager.clearUpdateInProgress();

      this.updateManager.launchUpdaterAndExit(updaterScriptPath);
    } catch (e) {
      this.logDebug(`Update error: ${e.message}`);
      this.logDebug(`Error stack: ${e.stack}`);
      if (!e.message.includes("Closing proxy to load dependencies")) {
        this.logError(`Update failed: ${e.message}`);
        this.fileManager.markUpdateFailure();
        this.log("Plugin will continue running with current version.");
        this.log(`Proxy will close in 5 seconds...`);
        this.scheduleProxyShutdown();
      }
      this.fileManager.clearUpdateInProgress();
    }
  }

  scheduleProxyShutdown() {
    setTimeout(() => {
      this.log("Closing proxy now...");
      process.exit(0);
    }, 5000);
  }
}

module.exports = { Updater };

