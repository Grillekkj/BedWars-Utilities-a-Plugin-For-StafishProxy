const BedWarsUtilities = require("./bw-utilities-src/BedWarsUtilities");
const configSchema = require("./bw-utilities-src/config/configSchema");

module.exports = function BedWarsUtilitiesPlugin(api) {
  process.on("uncaughtException", (err, _origin) => {
    console.error(`[BWU FATAL] UNHANDLED ERROR: ${err.stack}`);
  });

  api.metadata({
    name: "bwu",
    displayName: "BedWars Utilities",
    prefix: "§6BWU",
    version: "2.0.0",
    author: "Grille (silly_brazil)",
    description:
      "A versatile Bedwars plugin offering a variety of useful features to enhance gameplay.",
    dependencies: [{ name: "denicker", minVersion: "1.1.0" }],
    optionalDependencies: [{ name: "numdenicker", minVersion: "1.0.3" }],
  });

  const bwu = new BedWarsUtilities(api);

  api.initializeConfig(configSchema);
  api.configSchema(configSchema);

  bwu.registerHandlers();
  return bwu;
};
