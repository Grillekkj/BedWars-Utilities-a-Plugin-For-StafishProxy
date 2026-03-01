const https = require("node:https");

const GITHUB_API_URL =
  "https://api.github.com/repos/Grillekkj/BedWars-Utilities-a-Plugin-For-StafishProxy/releases/latest";
const GITHUB_RELEASES_PAGE =
  "https://github.com/Grillekkj/BedWars-Utilities-a-Plugin-For-StafishProxy/releases/latest";

class UpdateManager {
  constructor(metadata, log, logError, logDebug) {
    this.metadata = metadata;
    this.log = log;
    this.logError = logError;
    this.logDebug = logDebug;
  }

  getLatestRelease() {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        hostname: "api.github.com",
        path: new URL(GITHUB_API_URL).pathname,
        method: "GET",
        headers: { "User-Agent": "Starfish-BWU-Updater" },
        timeout: 10000,
      };

      const req = https.request(requestOptions, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          https
            .get(
              res.headers.location,
              { headers: { "User-Agent": "Starfish-BWU-Updater" } },
              (res2) => this._handleResponse(res2, resolve, reject)
            )
            .on("error", (e) => reject(e));
        } else {
          this._handleResponse(res, resolve, reject);
        }
      });

      req.on("error", (e) => reject(new Error(e.message || "Network error")));
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("GitHub connection timed out."));
      });
      req.end();
    });
  }

  _handleResponse(res, resolve, reject) {
    if (res.statusCode !== 200) {
      return reject(new Error(`GitHub API responded with status ${res.statusCode}`));
    }
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error("Failed to process GitHub response."));
      }
    });
  }

  isNewerVersion(localVersion, remoteVersion) {
    try {
      const local = localVersion.replace("v", "").split(".").map(Number);
      const remote = remoteVersion.replace("v", "").split(".").map(Number);

      for (let i = 0; i < Math.max(local.length, remote.length); i++) {
        const l = local[i] || 0;
        const r = remote[i] || 0;
        if (r > l) return true;
        if (r < l) return false;
      }
    } catch (e) {
      this.logDebug && this.logDebug(`Version comparison error: ${e.message}`);
    }
    return false;
  }
  async checkForNewVersion() {
    let release;
    try {
      release = await this.getLatestRelease();
    } catch (e) {
      this.logDebug && this.logDebug(`Update check failed: ${e.message}`);
      return;
    }

    const latestVersion = release.tag_name;

    if (this.isNewerVersion(this.metadata.version, latestVersion)) {
      this.log(`New version available (${latestVersion}): ${GITHUB_RELEASES_PAGE}`);
    }
  }
}

module.exports = { UpdateManager };

