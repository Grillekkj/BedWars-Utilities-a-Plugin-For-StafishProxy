const { spawn } = require("node:child_process");
const crypto = require("node:crypto");
const https = require("node:https");
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");

const GITHUB_API_URL =
  "https://api.github.com/repos/Grillekkj/BedWars-Utilities-a-Plugin-For-StafishProxy/releases/latest";

class UpdateManager {
  constructor(
    pluginsDir,
    depsDir,
    metadata,
    log,
    logError,
    logDebug,
    fileManager
  ) {
    this.pluginsDir = pluginsDir;
    this.depsDir = depsDir;
    this.metadata = metadata;
    this.log = log;
    this.logError = logError;
    this.logDebug = logDebug;
    this.fileManager = fileManager;
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
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          https
            .get(
              res.headers.location,
              { headers: { "User-Agent": "Starfish-BWU-Updater" } },
              (res2) => {
                this.handleGitHubResponse(res2, resolve, reject);
              }
            )
            .on("error", (e) => {
              this.logDebug(`Redirect request error: ${e.message}`);
              reject(e);
            });
        } else {
          this.handleGitHubResponse(res, resolve, reject);
        }
      });

      req.on("error", (e) => {
        this.logDebug(`Request error: ${e.message}`);
        reject(new Error(e.message || "Network error"));
      });

      req.on("timeout", () => {
        this.logDebug("Request timeout occurred");
        req.destroy();
        reject(new Error("GitHub connection timed out."));
      });

      req.end();
    });
  }

  handleGitHubResponse(res, resolve, reject) {
    if (res.statusCode !== 200) {
      const error = `GitHub API responded with status ${res.statusCode}`;
      this.logDebug(`GitHub API error: ${error}`);
      return reject(new Error(error));
    }

    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch (e) {
        this.logDebug(`Failed to parse GitHub response: ${e.message}`);
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
      this.logDebug(`Version comparison error: ${e.message}`);
      this.logDebug(`Error stack: ${e.stack}`);
      this.logError(`Error comparing versions: ${e.message}`);
    }
    return false;
  }

  async unzipUpdate(zipPath, destDir) {
    const admZipPath = path.join(this.depsDir, "adm-zip");

    let AdmZip;
    try {
      AdmZip = require(admZipPath);
    } catch (e) {
      this.logDebug(`Failed to load adm-zip from ${admZipPath}: ${e.message}`);
      this.logError(`Failed to load 'adm-zip' from: ${admZipPath}`);
      try {
        AdmZip = require("adm-zip");
      } catch (e) {
        this.logDebug(`Fallback adm-zip require failed: ${e.message}`);
        this.logDebug(`Error stack: ${e.stack}`);
        this.logError(`Failed fallback require('adm-zip'). Module is missing.`);
        throw new Error(`Dependency 'adm-zip' not found. Update failed.`);
      }
    }

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(destDir, true);

    const files = fs.readdirSync(destDir);
    const folder = files.find(
      (file) =>
        fs.statSync(path.join(destDir, file)).isDirectory() &&
        file
          .toLowerCase()
          .startsWith("grillekkj-bedwars-utilities-a-plugin-for-stafishproxy")
    );

    if (!folder) {
      const srcDir = path.join(destDir, "bw-utilities-src");
      if (fs.existsSync(srcDir)) {
        return destDir;
      }
      const error =
        "Could not find repository root folder or 'bw-utilities-src' folder in release zip.";
      this.logDebug(`Available files in extracted zip: ${files.join(", ")}`);
      throw new Error(error);
    }

    return path.join(destDir, folder);
  }

  prepareUpdateFiles(extractedRoot) {
    const readmePath = path.join(extractedRoot, "README.md");
    if (fs.existsSync(readmePath)) {
      fs.unlinkSync(readmePath);
    }
  }

  createExternalUpdater(extractedRoot, updateTempDir) {
    const updaterScriptPath = path.join(
      os.tmpdir(),
      `bwu_external_updater_${crypto.randomBytes(4).toString("hex")}.js`
    );

    const oldCoreFile = path.join(
      this.pluginsDir,
      this.metadata.currentFileName
    );
    const oldSrcDir = path.join(this.pluginsDir, "bw-utilities-src");
    const failedUpdateMarker = this.fileManager.failedUpdateMarker;

    const scriptContent = `
const fs = require('fs');
const path = require('path');

const oldCoreFile = ${JSON.stringify(oldCoreFile)};
const oldSrcDir = ${JSON.stringify(oldSrcDir)};
const newContentDir = ${JSON.stringify(extractedRoot)};
const pluginsDir = ${JSON.stringify(this.pluginsDir)};
const updateTempDir = ${JSON.stringify(updateTempDir)}; 
const selfScript = ${JSON.stringify(updaterScriptPath)};
const failedUpdateMarker = ${JSON.stringify(failedUpdateMarker)};

console.log('[BWU Updater] Waiting 2 seconds for proxy to close...');

setTimeout(() => {
    let tempBackupDir = null;
    
    try {
        console.log('[BWU Updater] Creating temporary backup...');
        tempBackupDir = path.join(require('os').tmpdir(), \`bwu-temp-backup-\${Date.now()}\`);
        
        if (!fs.existsSync(tempBackupDir)) {
            fs.mkdirSync(tempBackupDir, { recursive: true });
        }
        
        if (fs.existsSync(oldCoreFile)) {
            fs.copyFileSync(oldCoreFile, path.join(tempBackupDir, path.basename(oldCoreFile)));
        }
        if (fs.existsSync(oldSrcDir)) {
            copyDirectory(oldSrcDir, path.join(tempBackupDir, "bw-utilities-src"));
        }

        console.log('[BWU Updater] Removing old files...');
        if (fs.existsSync(oldCoreFile)) fs.unlinkSync(oldCoreFile);
        if (fs.existsSync(oldSrcDir)) fs.rmSync(oldSrcDir, { recursive: true, force: true });

        console.log('[BWU Updater] Installing new files...');
        const newFiles = fs.readdirSync(newContentDir);
        for (const file of newFiles) {
            const oldPath = path.join(newContentDir, file);
            const newPath = path.join(pluginsDir, file);
            
            if (file.toLowerCase() === 'readme.md') continue;
            
            copyDirectory(oldPath, newPath);
        }

        console.log('[BWU Updater] Cleaning up temporary files...');
        fs.rmSync(updateTempDir, { recursive: true, force: true });

        console.log('[BWU Updater] Update completed successfully!');
        console.log('[BWU Updater] Please restart the proxy to load the new version.');
        
        if (fs.existsSync(failedUpdateMarker)) {
            fs.unlinkSync(failedUpdateMarker);
        }

    } catch (e) {
        console.error('[BWU Updater] UPDATE FAILED:', e.message);
        console.error('[BWU Updater] Error details:', e.stack);
        
        if (tempBackupDir && fs.existsSync(tempBackupDir)) {
            try {
                console.log('[BWU Updater] Attempting rollback...');
                
                if (fs.existsSync(oldCoreFile)) fs.unlinkSync(oldCoreFile);
                if (fs.existsSync(oldSrcDir)) fs.rmSync(oldSrcDir, { recursive: true, force: true });
                
                const backupFiles = fs.readdirSync(tempBackupDir);
                for (const file of backupFiles) {
                    const backupPath = path.join(tempBackupDir, file);
                    const restorePath = path.join(pluginsDir, file);
                    copyDirectory(backupPath, restorePath);
                }
                
                console.log('[BWU Updater] Rollback completed successfully.');
                console.log('[BWU Updater] Old version has been restored.');
                
            } catch (rollbackError) {
                console.error('[BWU Updater] ROLLBACK ALSO FAILED:', rollbackError.message);
                console.error('[BWU Updater] Manual intervention may be required.');
            }
        }
        
        try {
            fs.writeFileSync(failedUpdateMarker, Date.now().toString());
        } catch (markerError) {
            console.error('[BWU Updater] Could not create failure marker:', markerError.message);
        }
    } finally {
        if (tempBackupDir && fs.existsSync(tempBackupDir)) {
            try {
                fs.rmSync(tempBackupDir, { recursive: true, force: true });
            } catch (cleanupError) {
                console.error('[BWU Updater] Could not clean up temporary backup:', cleanupError.message);
            }
        }
        
        console.log('[BWU Updater] External updater will close in 5 seconds...');
        setTimeout(() => {
            try { fs.unlinkSync(selfScript); } catch(e) {}
            process.exit(0);
        }, 5000);
    }
}, 2000);

function copyDirectory(src, dest) {
    const stat = fs.statSync(src);
    
    if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const files = fs.readdirSync(src);
        for (const file of files) {
            copyDirectory(path.join(src, file), path.join(dest, file));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}
`;

    fs.writeFileSync(updaterScriptPath, scriptContent);
    return updaterScriptPath;
  }

  launchUpdaterAndExit(scriptPath) {
    this.log("Proxy will close in 5 seconds to allow update installation...");

    setTimeout(() => {
      this.log("Starting external update process...");
      const child = spawn("node", [scriptPath], {
        detached: true,
        stdio: ["ignore", "ignore", "ignore"],
      });

      child.unref();

      setTimeout(() => {
        this.log("Closing proxy now...");
        process.exit(0);
      }, 2000);
    }, 5000);
  }
}

module.exports = { UpdateManager };

