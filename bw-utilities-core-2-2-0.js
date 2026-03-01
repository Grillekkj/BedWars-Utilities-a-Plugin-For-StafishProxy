const path = require("node:path");
// Patcher need to be first, unless it wont work; lets bypass starfish :fire:
require("./bw-utilities-src/core/patcher");

const BedWarsUtilities = require("./bw-utilities-src/BedWarsUtilities");
const configSchema = require("./bw-utilities-src/config/configSchema");
const { Updater } = require("./bw-utilities-src/updater/updater");

const pluginFullMetadata = {
  name: "bwu",
  displayName: "BedWars Utilities",
  prefix: "§6BWU",
  version: "2.2.0",
  author: "Grille (silly_brazil), 3xyy",
  description:
    "A versatile Bedwars plugin offering a variety of useful features to enhance gameplay.",
  dependencies: [{ name: "denicker", minVersion: "1.1.0" }],  optionalDependencies: [{ name: "numdenicker", minVersion: "1.0.3" }],
};

module.exports = function BedWarsUtilitiesPlugin(api) {
  process.on("uncaughtException", (err, _origin) => {
    console.error(`[BWU FATAL] UNHANDLED ERROR: ${err.stack}`);
  });

  const metadataForAPI = {
    name: pluginFullMetadata.name,
    displayName: pluginFullMetadata.displayName,
    prefix: pluginFullMetadata.prefix,
    version: pluginFullMetadata.version,
    author: pluginFullMetadata.author,
    description: pluginFullMetadata.description,
    dependencies: pluginFullMetadata.dependencies,
    optionalDependencies: pluginFullMetadata.optionalDependencies,
  };

  api.metadata(metadataForAPI);

  try {
    pluginFullMetadata.currentFileName = path.basename(__filename);    const updater = new Updater(api, pluginFullMetadata);
    updater.checkForUpdates();
  } catch (e) {
    console.error(`[BWU Updater] Failed to start: ${e.message}`);
  }

  const bwu = new BedWarsUtilities(api);
  api.initializeConfig(configSchema);
  api.configSchema(configSchema);
  bwu.registerHandlers();

  return bwu;
};
