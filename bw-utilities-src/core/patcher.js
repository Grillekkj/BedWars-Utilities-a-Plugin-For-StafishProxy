const path = require("node:path");
const fs = require("node:fs");

// auto runs when require(this file) is used
(function patchRequirePaths() {
  try {
    const baseDir = process.pkg
      ? path.dirname(process.execPath)
      : path.join(__dirname, "..", "..", "..", "..");

    const dataDir = path.join(baseDir, "data");
    const dataNodeModules = path.join(dataDir, "node_modules");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (require.main?.paths && !require.main.paths.includes(dataNodeModules)) {
      require.main.paths.push(dataNodeModules);
      console.log(
        `[BWU Patcher] Require path modified. Reading from: ${dataNodeModules}`
      );
    } else if (require.main && !require.main.paths) {
      require.main.paths = [dataNodeModules];
    }
  } catch (e) {
    console.error(`[BWU Patcher] Failed to modify require path: ${e.message}`);
  }
})();

module.exports = {};

