const https = require("node:https");
const path = require("node:path");
const fs = require("node:fs");

class FileManager {
  constructor(dataDir, logDebug) {
    this.dataDir = dataDir;
    this.logDebug = logDebug;
    this.updateInProgressMarker = path.join(dataDir, ".bwu_update_in_progress");
    this.lastUpdateCheckMarker = path.join(dataDir, ".bwu_last_update_check");
    this.failedUpdateMarker = path.join(dataDir, ".bwu_update_failed");
  }

  isUpdateInProgress() {
    if (!fs.existsSync(this.updateInProgressMarker)) {
      return false;
    }

    try {
      const startTime = Number.parseInt(
        fs.readFileSync(this.updateInProgressMarker, "utf8")
      );
      const currentTime = Date.now();
      const oneHour = 60 * 60 * 1000;

      if (currentTime - startTime > oneHour) {
        this.clearUpdateInProgress();
        return false;
      }

      return true;
    } catch (e) {
      this.logDebug(`Error reading update in progress marker: ${e.message}`);
      return false;
    }
  }

  markUpdateInProgress() {
    try {
      fs.writeFileSync(this.updateInProgressMarker, Date.now().toString());
    } catch (e) {
      this.logDebug(`Error creating update in progress marker: ${e.message}`);
    }
  }

  clearUpdateInProgress() {
    try {
      if (fs.existsSync(this.updateInProgressMarker)) {
        fs.unlinkSync(this.updateInProgressMarker);
      }
    } catch (e) {
      this.logDebug(`Error clearing update in progress marker: ${e.message}`);
    }
  }

  hasRecentUpdateCheck() {
    if (!fs.existsSync(this.lastUpdateCheckMarker)) {
      return false;
    }

    try {
      const lastCheck = Number.parseInt(
        fs.readFileSync(this.lastUpdateCheckMarker, "utf8")
      );
      const currentTime = Date.now();
      const oneHour = 60 * 60 * 1000;

      return currentTime - lastCheck < oneHour;
    } catch (e) {
      this.logDebug(`Error reading last update check marker: ${e.message}`);
      return false;
    }
  }

  markUpdateCheck() {
    try {
      fs.writeFileSync(this.lastUpdateCheckMarker, Date.now().toString());
    } catch (e) {
      this.logDebug(`Error creating update check marker: ${e.message}`);
    }
  }

  hasRecentUpdateFailure() {
    if (!fs.existsSync(this.failedUpdateMarker)) {
      return false;
    }

    try {
      const failureTime = Number.parseInt(
        fs.readFileSync(this.failedUpdateMarker, "utf8")
      );
      const currentTime = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      return currentTime - failureTime < twentyFourHours;
    } catch (e) {
      this.logDebug(`Error reading failure marker: ${e.message}`);
      return false;
    }
  }

  markUpdateFailure() {
    try {
      fs.writeFileSync(this.failedUpdateMarker, Date.now().toString());
    } catch (e) {
      this.logDebug(`Error creating failure marker: ${e.message}`);
    }
  }

  clearUpdateFailureMarker() {
    try {
      if (fs.existsSync(this.failedUpdateMarker)) {
        fs.unlinkSync(this.failedUpdateMarker);
      }
    } catch (e) {
      this.logDebug(`Error clearing failure marker: ${e.message}`);
    }
  }

  downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);
      https
        .get(
          url,
          { headers: { "User-Agent": "Starfish-BWU-Updater" } },
          (response) => {
            if (
              response.statusCode >= 300 &&
              response.statusCode < 400 &&
              response.headers.location
            ) {
              this.downloadFile(response.headers.location, dest)
                .then(resolve)
                .catch(reject);
              return;
            }
            if (response.statusCode !== 200) {
              const error = `Failed to download ${url}. Status: ${response.statusCode}`;
              this.logDebug(`Download error: ${error}`);
              return reject(new Error(error));
            }

            response.pipe(file);
            file.on("finish", () => file.close(resolve));
          }
        )
        .on("error", (e) => {
          this.logDebug(`Download request error: ${e.message}`);
          fs.unlink(dest, () => {});
          reject(e);
        });
    });
  }

  cleanup() {
    try {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();

      const markers = [
        this.updateInProgressMarker,
        this.lastUpdateCheckMarker,
        this.failedUpdateMarker,
      ];

      for (const marker of markers) {
        if (fs.existsSync(marker)) {
          try {
            const markerContent = fs.readFileSync(marker, "utf8");
            let markerTime;

            try {
              const parsed = JSON.parse(markerContent);
              markerTime = parsed.timestamp || Date.now();
            } catch (e) {
              this.logDebug(e);
              markerTime = Number.parseInt(markerContent) || Date.now();
            }

            if (now - markerTime > sevenDays) {
              fs.unlinkSync(marker);
              this.logDebug(`Cleaned up old marker: ${marker}`);
            }
          } catch (e) {
            this.logDebug(`Error cleaning marker ${marker}: ${e.message}`);
          }
        }
      }
    } catch (e) {
      this.logDebug(`Error during cleanup: ${e.message}`);
    }
  }
}

module.exports = { FileManager };

