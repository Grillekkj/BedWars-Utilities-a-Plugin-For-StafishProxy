class CommandRegistry {
  static register(api, commandHandler) {
    api.commands((registry) => {
      registry
        .command("find")
        .description("Finds players for your party based on criteria.")
        .argument("<mode>", { description: "Mode (2, 3, 4) or 'stop'" })
        .argument("[playersToFind]", {
          description: "Number of players to find",
          optional: true,
        })
        .argument("[fkdrThreshold]", {
          description: "Minimum FKDR required",
          optional: true,
        })
        .argument("positions", {
          description: "Optional positions",
          optional: true,
          type: "greedy",
        })
        .handler((ctx) => commandHandler.handleFindCommand(ctx));

      registry
        .command("ping")
        .description("Shows your current ping to the server.")
        .handler((ctx) => commandHandler.handlePingCommand(ctx));

      registry
        .command("stats")
        .description("Shows the Bedwars statistics for a player.")
        .argument("<nickname>", { description: "The player to check" })
        .handler((ctx) => commandHandler.handleStatsCommand(ctx));

      registry
        .command("setthreshold")
        .description("Sets the FKDR threshold for auto-requeue.")
        .argument("<threshold>", { description: "The FKDR value (e.g., 10.0)" })
        .handler((ctx) => commandHandler.handleSetThresholdCommand(ctx));

      registry
        .command("clearstats")
        .description("Clears stats of players.")
        .handler((ctx) => commandHandler.handleClearCommand(ctx));

      registry
        .command("setkey")
        .description("Set your Hypixel API key")
        .argument("<apikey>", { description: "Your Hypixel API key" })
        .handler((ctx) => commandHandler.handleSetKeyCommand(ctx));

      registry
        .command("setaurora")
        .description("Set your Aurora API key")
        .argument("<apikey>", { description: "Your Aurora API key" })
        .handler((ctx) => commandHandler.handleSetAuroraCommand(ctx));

      registry
        .command("setqdmsg")
        .description("Sets a queue dodge message for a slot (1-5).")
        .argument("<slot>", { description: "Slot number (1-5)" })
        .argument("message", {
          description: "The message to save",
          optional: true,
          type: "greedy",
        })
        .handler((ctx) => commandHandler.handleSetQdmsgCommand(ctx));

      registry
        .command("listqdmsg")
        .description("Lists all saved queue dodge messages.")
        .handler((ctx) => commandHandler.handleListQdmsgCommand(ctx));

      registry
        .command("qdmsg")
        .description("Sends a saved queue dodge message manually.")
        .argument("<slot>", { description: "Slot number (1-5)" })
        .handler((ctx) => commandHandler.handleQdmsgCommand(ctx));

      registry
        .command("setsniped")
        .description("Sets a sniped message for a slot (1-5).")
        .argument("<slot>", { description: "Slot number (1-5)" })
        .argument("message", {
          description: "The message to save",
          optional: true,
          type: "greedy",
        })
        .handler((ctx) => commandHandler.handleSetSnipedCommand(ctx));

      registry
        .command("listsniped")
        .description("Lists all saved sniped messages.")
        .handler((ctx) => commandHandler.handleListSnipedCommand(ctx));

      registry
        .command("sniped")
        .description("Sends a saved sniped message.")
        .argument("<slot>", { description: "Slot number (1-5)" })
        .argument("[channel]", {
          description: "Chat channel ('ac' for all chat, default is /shout)",
          optional: true,
        })
        .handler((ctx) => commandHandler.handleSnipedCommand(ctx));

      registry
        .command("setmacro")
        .description("Saves or updates a chat macro.")
        .argument("<name>", { description: "The name used to call the macro." })
        .argument("content", {
          description: "The command or message to be saved.",
          type: "greedy",
        })
        .handler((ctx) => commandHandler.handleSetMacroCommand(ctx));

      registry
        .command("delmacro")
        .description("Removes a macro.")
        .argument("<name>", {
          description: "The name of the macro to be removed.",
        })
        .handler((ctx) => commandHandler.handleDelMacroCommand(ctx));

      registry
        .command("macros")
        .description("Lists all saved macros.")
        .handler((ctx) => commandHandler.handleListMacrosCommand(ctx));

      registry
        .command("m")
        .description("Executes a saved macro.")
        .argument("<name>", {
          description: "The name of the macro to execute.",
        })
        .handler((ctx) => commandHandler.handleRunMacroCommand(ctx));

      registry
        .command("mcnames")
        .description("Shows the name history of a Minecraft player.")
        .argument("<ign>", { description: "The player's username" })
        .handler((ctx) => commandHandler.handleMcnamesCommand(ctx));

      registry
        .command("setinparty")
        .description("[DEBUG] Manually set the inParty status.")
        .argument("<value>", { description: "true or false" })
        .handler((ctx) => commandHandler.handleSetInPartyCommand(ctx));      registry
        .command("rerank")
        .description("Forces team ranking and refreshes tab list stats.")
        .handler((ctx) => commandHandler.handleRerankCommand(ctx));      registry
        .command("allstats")
        .description("Shows stats for all remaining players, or filter by team color.")
        .argument("[color]", { 
          description: "Optional team color (red, blue, green, yellow, aqua, white, pink, gray)", 
          optional: true 
        })
        .argument("[sendTo]", { 
          description: "Where to send (private, team, party). Default: private", 
          optional: true 
        })
        .handler((ctx) => commandHandler.handleAllStatsCommand(ctx));      registry
        .command("setrankeqn")
        .description("Set a custom ranking equation. Variables are normalized 0-1. Type 'reset' to restore default.")
        .argument("[equation]", {
          description: "Math equation using: fkdr wlr kdr bblr stars fk fd k d bb bl w l. Or 'reset'. Leave empty to view current.",
          optional: true,
          type: "greedy",
        })
        .handler((ctx) => commandHandler.handleRankEqnCommand(ctx));

      registry
        .command("setnormalizestat")
        .description("View or customize sigmoid normalization for a ranking variable.")
        .argument("[variable]", {
          description: "Stat variable: fkdr wlr kdr bblr fk fd k d bb bl w l stars ws. Leave empty to show all.",
          optional: true,
        })
        .argument("[midpoint]", {
          description: "Raw value that maps to 0.5 score. Type 'reset' to restore default.",
          optional: true,
        })
        .argument("[steepness]", {
          description: "How sharply the curve rises (must be > 0).",
          optional: true,
        })
        .handler((ctx) => commandHandler.handleSetNormalizeStatCommand(ctx));      registry
        .command("rankscore")
        .description("Calculates the ranking score for a player using the current equation.")
        .argument("<username>", { description: "The player's username" })
        .handler((ctx) => commandHandler.handleRankScoreCommand(ctx));

      registry
        .command("gamestats")
        .description("Shows real-time in-game statistics for the current match.")
        .handler((ctx) => commandHandler.handleGameStatsCommand(ctx));registry
        .command("playerstats")
        .description("Shows in-game statistics for a specific player in the current match.")
        .argument("<player>", { description: "The player's username" })
        .handler((ctx) => commandHandler.handlePlayerStatsCommand(ctx));

      registry
        .command("gametab")
        .description("Toggle or configure in-game stats display in tab.")
        .argument("[setting]", { 
          description: "Setting to toggle: on/off, kills, deaths, fk, bb, or delay <5-10>", 
          optional: true 
        })
        .argument("[value]", { 
          description: "Value for delay setting (5-10)", 
          optional: true 
        })
        .handler((ctx) => commandHandler.handleGameTabCommand(ctx));
    });
  }
}

module.exports = CommandRegistry;

