// Real-time in-game event tracker for BedWars
// Tracks: bed breaks, kills, deaths, final kills

const fs = require("fs");
const path = require("path");

class InGameTracker {
  constructor(api, apiService, bwuInstance) {
    this.api = api;
    this.apiService = apiService;
    this.bwuInstance = bwuInstance;
    
    // Track game state
    this.isTracking = false;
    
    // Store player stats during the game
    // Map<playerName, { bedsBroken: 0, kills: 0, deaths: 0, finalKills: 0 }>
    this.playerStats = new Map();
    
    // Store all players in the game (from /who command)
    this.gamePlayers = new Set();
    
    // Track beds status for teams
    // Map<teamName, { bedAlive: true }>
    this.teamBeds = new Map();
    
    // Chat message logging for debugging
    this.chatLog = [];
    this.logFilePath = null;    // Message patterns for event detection
    // Player name format: [a-zA-Z0-9_]+ (valid Minecraft usernames)
    const P = '([a-zA-Z0-9_]+)'; // capture group for player name

    this.patterns = {
      // Bed destruction: "BED DESTRUCTION > [anything] by/to/after seeing PlayerName!"
      // Also handles possessive: "melted by PlayerName's holiday spirit!"
      // Also handles "had to raise the white flag to PlayerName!"
      bedDestroyed: /^BED DESTRUCTION > .+?(?:by|to|after seeing) ([a-zA-Z0-9_]+?)(?:'s .+)?!$/,

      // Final kill patterns - checked after environment deaths
      // Order: most specific first, generic last
      finalKill: [
        // "PlayerName was KillerName's final #2,850. FINAL KILL!"
        new RegExp(`^${P} was ${P}'s final #[\\d,]+\\. FINAL KILL!$`, 'i'),
        // Environment final kills (no killer - victim only)
        new RegExp(`^${P} fell into the void\\. FINAL KILL!$`),
        // Mutual final kill: "Player1 fought to the edge with Player2. FINAL KILL!"
        new RegExp(`^${P} fought to the edge with ${P}\\. FINAL KILL!$`),
        // "died in close combat to Player. FINAL KILL!"
        new RegExp(`^${P} died in close combat to ${P}\\. FINAL KILL!$`),
        // "took the L to Player. FINAL KILL!"
        new RegExp(`^${P} took the L to ${P}\\. FINAL KILL!$`),
        // "slipped into void for Player. FINAL KILL!"
        new RegExp(`^${P} slipped into void for ${P}\\. FINAL KILL!$`),
        // "hit the hard-wood floor because of Player. FINAL KILL!"
        new RegExp(`^${P} hit the hard-wood floor because of ${P}\\. FINAL KILL!$`),
        // "was hit off by a love bomb from Player. FINAL KILL!"
        new RegExp(`^${P} was hit off by a love bomb from ${P}\\. FINAL KILL!$`),
        // "was distracted by a piglet from Player. FINAL KILL!"
        new RegExp(`^${P} was distracted by a piglet from ${P}\\. FINAL KILL!$`),
        // "was struck down by Player. FINAL KILL!"
        new RegExp(`^${P} was struck down by ${P}\\. FINAL KILL!$`),
        // "was too shy to meet Player. FINAL KILL!"
        new RegExp(`^${P} was too shy to meet ${P}\\. FINAL KILL!$`),
        // "howled into the void for Player. FINAL KILL!"
        new RegExp(`^${P} howled into the void for ${P}\\. FINAL KILL!$`),
        // "had a small brain moment while fighting Player. FINAL KILL!"
        new RegExp(`^${P} had a small brain moment while fighting ${P}\\. FINAL KILL!$`),
        // "was banished into the ether by Player's holiday spirit. FINAL KILL!"
        new RegExp(`^${P} was banished into the ether by ${P}'s .+\\. FINAL KILL!$`, 'i'),
        // Generic "by Player. FINAL KILL!" - last resort
        new RegExp(`^${P} .+? by ${P}\\. FINAL KILL!$`, 'i'),
        // Generic "to/for/from/against/with Player. FINAL KILL!" - last resort
        new RegExp(`^${P} .+?(?:to|for|from|against|with) ${P}\\. FINAL KILL!$`, 'i'),
      ],

      // Regular kill patterns - checked after environment deaths
      // Order: most specific first, generic last
      kill: [
        // Direct "was [verb] by Player." patterns
        new RegExp(`^${P} was killed by ${P}\\.$`),
        new RegExp(`^${P} was bested by ${P}\\.$`),
        new RegExp(`^${P} was crushed into moon dust by ${P}\\.$`),
        new RegExp(`^${P} was sent the wrong way by ${P}\\.$`),
        new RegExp(`^${P} was turned to dust by ${P}\\.$`),
        new RegExp(`^${P} was thrown down a pit by ${P}\\.$`),
        new RegExp(`^${P} was given the cold shoulder by ${P}\\.$`),
        new RegExp(`^${P} was glazed in BBQ sauce by ${P}\\.$`),
        new RegExp(`^${P} was struck down by ${P}\\.$`),
        new RegExp(`^${P} was knocked off a cliff by ${P}\\.$`),
        new RegExp(`^${P} was knocked into the void by ${P}\\.$`),
        // "was not spicy enough for Player."
        new RegExp(`^${P} was not spicy enough for ${P}\\.$`),
        // "was too shy to meet Player."
        new RegExp(`^${P} was too shy to meet ${P}\\.$`),
        // "was hit off by a love bomb from Player."
        new RegExp(`^${P} was hit off by a love bomb from ${P}\\.$`),
        // "was distracted by a piglet from Player."
        new RegExp(`^${P} was distracted by a piglet from ${P}\\.$`),
        // "was not able to block clutch against Player."
        new RegExp(`^${P} was not able to block clutch against ${P}\\.$`),
        // "was banished into the ether by Player's holiday spirit."
        new RegExp(`^${P} was banished into the ether by ${P}'s .+\\.$`),
        // "slipped in BBQ sauce off the edge spilled by Player."
        new RegExp(`^${P} slipped in BBQ sauce off the edge spilled by ${P}\\.$`),
        // "died in close combat to Player."
        new RegExp(`^${P} died in close combat to ${P}\\.$`),
        // "took the L to Player."
        new RegExp(`^${P} took the L to ${P}\\.$`),
        // "hit the hard-wood floor because of Player."
        new RegExp(`^${P} hit the hard-wood floor because of ${P}\\.$`),
        // "slipped into void for Player."
        new RegExp(`^${P} slipped into void for ${P}\\.$`),
        // "howled into the void for Player."
        new RegExp(`^${P} howled into the void for ${P}\\.$`),
        // "lost a drinking contest with Player."
        new RegExp(`^${P} lost a drinking contest with ${P}\\.$`),
        // "didn't distance themselves properly from Player."
        new RegExp(`^${P} didn't distance themselves properly from ${P}\\.$`),
        // "had a small brain moment while fighting Player."
        new RegExp(`^${P} had a small brain moment while fighting ${P}\\.$`),
        // Generic "by Player." - last resort
        new RegExp(`^${P} .+? by ${P}\\.$`),
        // Generic "to/for/from/against/with Player." - last resort
        new RegExp(`^${P} .+?(?:to|for|from|against|with) ${P}\\.$`),
      ],

      // Environment deaths (no killer involved)
      // Note: These MUST be checked BEFORE kill patterns to avoid false positives
      environmentDeath: [
        new RegExp(`^${P} fell into the void\\.$`),
        new RegExp(`^${P} died\\.$`),
        new RegExp(`^${P} disconnected\\.$`),
        new RegExp(`^${P} burned to death\\.$`),
        new RegExp(`^${P} forgot how many blocks they had left\\.$`),
        new RegExp(`^${P} was pushed into the void\\.$`),
        new RegExp(`^${P} fell off the world\\.$`),
        new RegExp(`^${P} had a small brain moment\\.$`),
      ],

      // Environment final kills (victim dies to environment with no killer, but it's a final kill)
      environmentFinalKill: [
        new RegExp(`^${P} fell into the void\\. FINAL KILL!$`),
        new RegExp(`^${P} died\\. FINAL KILL!$`),
        new RegExp(`^${P} disconnected\\. FINAL KILL!$`),
        new RegExp(`^${P} burned to death\\. FINAL KILL!$`),
      ],

      // Mutual death (both players die)
      mutualDeath: new RegExp(`^${P} fought to the edge with ${P}\\.$`),

      // Mutual final kill (both players die, it's a final kill)
      mutualFinalKill: new RegExp(`^${P} fought to the edge with ${P}\\. FINAL KILL!$`),
    };
  }
    /**
   * Start tracking when game begins
   * @param {Set<string>} playerNames - Set of player names in the game
   */
  startTracking(playerNames) {
    this.isTracking = true;
    this.gamePlayers = new Set(playerNames);
    this.playerStats.clear();
    this.teamBeds.clear();
    this.chatLog = [];
    
    // Initialize stats for all players
    for (const player of playerNames) {
      this.playerStats.set(player, {
        bedsBroken: 0,
        kills: 0,
        deaths: 0,
        finalKills: 0,
      });
    }
    
    // Create log file path with timestamp (only if logging enabled)
    if (this.api.config.get("inGameTracker.saveGameLogs")) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
      const baseDir = process.pkg ? path.dirname(process.execPath) : path.join(__dirname, "..", "..", "..");
      const logsDir = path.join(baseDir, "data", "tracker_logs");
      
      // Create logs directory if it doesn't exist
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      this.logFilePath = path.join(logsDir, `game_${timestamp}.log`);
      this.api.debugLog(`[BWU InGameTracker] Log file: ${this.logFilePath}`);
      
      // Write header to log file
      this.writeToLog("=".repeat(80));
      this.writeToLog(`BEDWARS GAME TRACKER LOG - ${new Date().toISOString()}`);
      this.writeToLog("=".repeat(80));
      this.writeToLog(`Players in game: ${Array.from(playerNames).join(", ")}`);
      this.writeToLog("=".repeat(80));
      this.writeToLog("");
    } else {
      this.logFilePath = null;
    }
    
    this.api.debugLog(`[BWU InGameTracker] Started tracking ${playerNames.size} players`);
    
    // Start tab alternation if enabled
    if (this.bwuInstance.tabManager) {
      this.bwuInstance.tabManager.startTabAlternation();
    }
  }
    /**
   * Stop tracking when game ends
   */
  stopTracking() {
    if (!this.isTracking) return;
    
    this.isTracking = false;
    
    // Stop tab alternation
    if (this.bwuInstance.tabManager) {
      this.bwuInstance.tabManager.stopTabAlternation();
    }
    
    // Write summary to log file
    if (this.logFilePath) {
      this.writeToLog("");
      this.writeToLog("=".repeat(80));
      this.writeToLog("GAME ENDED - FINAL STATS");
      this.writeToLog("=".repeat(80));
      
      const allStats = this.getAllStats();
      allStats.sort((a, b) => {
        const scoreA = a.finalKills * 2 + a.bedsBroken * 3 + a.kills;
        const scoreB = b.finalKills * 2 + b.bedsBroken * 3 + b.kills;
        return scoreB - scoreA;
      });
      
      for (const player of allStats) {
        if (player.finalKills > 0 || player.kills > 0 || player.bedsBroken > 0 || player.deaths > 0) {
          this.writeToLog(`${player.name}: Beds=${player.bedsBroken}, FK=${player.finalKills}, K=${player.kills}, D=${player.deaths}`);
        }
      }
      
      this.writeToLog("=".repeat(80));
      this.api.chat(`${this.api.getPrefix()} §aGame log saved to: ${path.basename(this.logFilePath)}`);
    }
    
    this.api.debugLog(`[BWU InGameTracker] Stopped tracking`);
  }
  
  /**
   * Write a line to the log file
   */
  writeToLog(line) {
    if (!this.logFilePath) return;
    
    try {
      fs.appendFileSync(this.logFilePath, line + "\n", "utf8");
    } catch (e) {
      this.api.debugLog(`[BWU InGameTracker] Failed to write to log: ${e.message}`);
    }
  }  /**
   * Process a chat message to detect game events
   * @param {string} cleanMessage - Clean chat message without color codes
   */
  processMessage(cleanMessage) {
    if (!this.isTracking) return;
    if (!this.api.config.get("inGameTracker.enabled")) return;
    
    const trimmed = cleanMessage.trim();
    
    // Skip empty messages
    if (!trimmed) return;
    
    // LOG EVERYTHING RAW - NO PROCESSING, NO LABELS
    this.writeToLog(trimmed);
    
    // Now do detection for tracking stats
    let detected = false;
    let detectionType = "";

    // === BED DESTRUCTION ===
    // Look for "BED DESTRUCTION >" and find which player from gamePlayers is mentioned
    if (trimmed.startsWith("BED DESTRUCTION >")) {
      const breaker = this.findPlayerInMessage(trimmed);
      if (breaker) {
        this.handleBedDestruction("Unknown", breaker);
        detected = true;
        detectionType = `BED_BREAK DETECTED - Breaker: ${breaker}`;
      }
    }

    // === FINAL KILLS ===
    // Messages ending with "FINAL KILL!" - find victim and killer
    if (!detected && trimmed.endsWith("FINAL KILL!")) {
      const players = this.findAllPlayersInMessage(trimmed);
      
      if (players.length === 2) {
        // Two players found: first is victim, second is killer (message structure: "Victim ... Killer. FINAL KILL!")
        const victim = players[0].name;
        const killer = players[1].name;
        this.handleFinalKill(victim, killer);
        detected = true;
        detectionType = `FINAL_KILL DETECTED - Victim: ${victim}, Killer: ${killer}`;
      } else if (players.length === 1) {
        // Only one player: environment final kill (e.g., "Player fell into the void. FINAL KILL!")
        const victim = players[0].name;
        this.handleEnvironmentDeath(victim);
        detected = true;
        detectionType = `ENV_FINAL_KILL DETECTED - Victim: ${victim} (no killer)`;
      }
    }

    // === REGULAR KILLS/DEATHS ===
    // Messages ending with "." that contain player names (but not FINAL KILL)
    if (!detected && trimmed.endsWith(".") && !trimmed.endsWith("FINAL KILL!")) {
      const players = this.findAllPlayersInMessage(trimmed);
      
      if (players.length === 2) {
        // Two players: first is victim, second is killer
        const victim = players[0].name;
        const killer = players[1].name;
        this.handleKill(victim, killer);
        detected = true;
        detectionType = `KILL DETECTED - Victim: ${victim}, Killer: ${killer}`;
      } else if (players.length === 1) {
        // Only one player: environment death (void, disconnect, etc.)
        // Check for death-like patterns to avoid false positives
        const deathIndicators = [
          "fell into the void", "died", "disconnected", "burned to death",
          "forgot how many blocks", "was pushed into the void", "fell off the world",
          "had a small brain moment"
        ];
        const isDeathMessage = deathIndicators.some(indicator => trimmed.toLowerCase().includes(indicator));
        
        if (isDeathMessage) {
          const victim = players[0].name;
          this.handleEnvironmentDeath(victim);
          detected = true;
          detectionType = `DEATH DETECTED - Victim: ${victim}`;
        }
      }
    }
    
    // If something was detected, write marker on next line
    if (detected) {
      this.writeToLog(`[${detectionType}]`);
    }
  }

  /**
   * Find the first player from gamePlayers that appears in the message
   * @param {string} message - The message to search
   * @returns {string|null} - Player name or null if not found
   */
  findPlayerInMessage(message) {
    for (const player of this.gamePlayers) {
      if (message.includes(player)) {
        return player;
      }
    }
    return null;
  }

  /**
   * Find ALL players from gamePlayers that appear in the message, in order of appearance
   * @param {string} message - The message to search
   * @returns {Array<{name: string, index: number}>} - Array of player info sorted by position in message
   */
  findAllPlayersInMessage(message) {
    const found = [];
    
    for (const player of this.gamePlayers) {
      const index = message.indexOf(player);
      if (index !== -1) {
        found.push({ name: player, index });
      }
    }
    
    // Sort by position in message (victim appears first, killer appears second)
    found.sort((a, b) => a.index - b.index);
    
    return found;
  }
  
  /**
   * Handle bed destruction event
   */
  handleBedDestruction(teamName, breaker) {
    this.teamBeds.set(teamName, { bedAlive: false });
    
    // Track stats for the breaker
    if (this.gamePlayers.has(breaker)) {
      const stats = this.playerStats.get(breaker);
      if (stats) {
        stats.bedsBroken++;
        this._notifyTabUpdate(breaker);
      }
    }
    
    this.api.debugLog(`[BWU InGameTracker] ${breaker} destroyed ${teamName} bed`);
    
    // Display notification if enabled
    if (this.api.config.get("inGameTracker.showNotifications") && 
        this.api.config.get("inGameTracker.notifyBedBreaks")) {
      this.displayEvent("bed", breaker, teamName);
    }
  }
  
  /**
   * Handle final kill event
   */
  handleFinalKill(victim, killer) {
    // Track final kill for killer
    if (this.gamePlayers.has(killer)) {
      const stats = this.playerStats.get(killer);
      if (stats) {
        stats.finalKills++;
        this._notifyTabUpdate(killer);
      }
    }
    
    // Track death for victim
    if (this.gamePlayers.has(victim)) {
      const stats = this.playerStats.get(victim);
      if (stats) {
        stats.deaths++;
        this._notifyTabUpdate(victim);
      }
    }
    
    this.api.debugLog(`[BWU InGameTracker] ${killer} final killed ${victim}`);
    
    if (this.api.config.get("inGameTracker.showNotifications") && 
        this.api.config.get("inGameTracker.notifyFinalKills")) {
      this.displayEvent("finalKill", killer, victim);
    }
  }
  
  /**
   * Handle regular kill event
   */
  handleKill(victim, killer) {
    // Track kill for killer
    if (this.gamePlayers.has(killer)) {
      const stats = this.playerStats.get(killer);
      if (stats) {
        stats.kills++;
        this._notifyTabUpdate(killer);
      }
    }
    
    // Track death for victim
    if (this.gamePlayers.has(victim)) {
      const stats = this.playerStats.get(victim);
      if (stats) {
        stats.deaths++;
        this._notifyTabUpdate(victim);
      }
    }
    
    this.api.debugLog(`[BWU InGameTracker] ${killer} killed ${victim}`);
    
    if (this.api.config.get("inGameTracker.showNotifications") && 
        this.api.config.get("inGameTracker.notifyKills")) {
      this.displayEvent("kill", killer, victim);
    }
  }
    /**
   * Handle environment death (void, fall damage, etc)
   */
  handleEnvironmentDeath(victim) {
    // Track death for victim
    if (this.gamePlayers.has(victim)) {
      const stats = this.playerStats.get(victim);
      if (stats) {
        stats.deaths++;
        this._notifyTabUpdate(victim);
      }
    }
    
    this.api.debugLog(`[BWU InGameTracker] ${victim} died to environment`);
  }
  
  /**
   * Handle mutual death (both players die)
   */
  handleMutualDeath(player1, player2) {
    // Track death for both players
    if (this.gamePlayers.has(player1)) {
      const stats = this.playerStats.get(player1);
      if (stats) {
        stats.deaths++;
        this._notifyTabUpdate(player1);
      }
    }
    
    if (this.gamePlayers.has(player2)) {
      const stats = this.playerStats.get(player2);
      if (stats) {
        stats.deaths++;
        this._notifyTabUpdate(player2);
      }
    }
    
    this.api.debugLog(`[BWU InGameTracker] ${player1} and ${player2} died in mutual combat`);
  }
  
  /**
   * Notify TabManager to update a player's game stats in tab
   */
  _notifyTabUpdate(playerName) {
    if (this.bwuInstance.tabManager) {
      this.bwuInstance.tabManager.updatePlayerGameStats(playerName);
    }
  }
  
  /**
   * Display event notification
   */
  displayEvent(type, player, target) {
    const stats = this.playerStats.get(player);
    if (!stats) return;
    
    let message = "";
    switch (type) {
      case "bed":
        message = `§e${player} §7broke §c${target} §7bed! §8(§e${stats.bedsBroken} §7total§8)`;
        break;
      case "finalKill":
        message = `§e${player} §7final killed §c${target}§7! §8(§e${stats.finalKills} §7FK total§8)`;
        break;
      case "kill":
        message = `§e${player} §7killed §c${target}§7! §8(§e${stats.kills} §7kills total§8)`;
        break;
    }
    
    if (message) {
      this.api.chat(`${this.api.getPrefix()} ${message}`);
    }
  }
  
  /**
   * Get current stats for a player
   */
  getPlayerStats(playerName) {
    return this.playerStats.get(playerName);
  }
  
  /**
   * Get all tracked stats
   */
  getAllStats() {
    return Array.from(this.playerStats.entries()).map(([name, stats]) => ({
      name,
      ...stats,
    }));
  }
  
  /**
   * Display current game stats summary
   */
  displayGameStats() {
    if (!this.isTracking) {
      this.api.chat(`${this.api.getPrefix()} §cNo game in progress to track.`);
      return;
    }
    
    const allStats = this.getAllStats();
    
    // Sort by most impactful players (final kills + bed breaks)
    allStats.sort((a, b) => {
      const scoreA = a.finalKills * 2 + a.bedsBroken * 3 + a.kills;
      const scoreB = b.finalKills * 2 + b.bedsBroken * 3 + b.kills;
      return scoreB - scoreA;
    });
      this.api.chat(`${this.api.getPrefix()} §6§l═══ In-Game Stats ═══`);
    
    // Show top performers
    const topPlayers = allStats.slice(0, 5);
    for (const player of topPlayers) {
      // Skip players with no activity at all
      if (player.finalKills === 0 && player.kills === 0 && player.bedsBroken === 0 && player.deaths === 0) continue;
      
      const parts = [];
      if (player.bedsBroken > 0) parts.push(`§c${player.bedsBroken} §7beds`);
      if (player.finalKills > 0) parts.push(`§e${player.finalKills} §7FK`);
      if (player.kills > 0) parts.push(`§a${player.kills} §7K`);
      if (player.deaths > 0) parts.push(`§8${player.deaths} §7D`);
      
      const statsText = parts.join(" §8| ");
      this.api.chat(`  §b${player.name}§7: ${statsText}`);
    }
    
    if (topPlayers.length === 0 || topPlayers.every(p => p.finalKills === 0 && p.kills === 0 && p.bedsBroken === 0 && p.deaths === 0)) {
      this.api.chat(`  §7No events tracked yet...`);
    }
  }
  
  /**
   * Display stats for a specific player
   */
  displayPlayerStats(playerName) {
    if (!this.isTracking) {
      this.api.chat(`${this.api.getPrefix()} §cNo game in progress to track.`);
      return;
    }
    
    const stats = this.playerStats.get(playerName);
    if (!stats) {
      this.api.chat(`${this.api.getPrefix()} §c${playerName} is not in this game.`);
      return;
    }
    
    this.api.chat(`${this.api.getPrefix()} §6Stats for §b${playerName}§6:`);
    this.api.chat(`  §cBeds Broken: §e${stats.bedsBroken}`);
    this.api.chat(`  §aKills: §e${stats.kills}`);
    this.api.chat(`  §7Deaths: §e${stats.deaths}`);
    this.api.chat(`  §6Final Kills: §e${stats.finalKills}`);
    
    // Calculate KDR
    const kdr = stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats.kills.toFixed(2);
    const fkdr = stats.deaths > 0 ? (stats.finalKills / stats.deaths).toFixed(2) : stats.finalKills.toFixed(2);
    
    this.api.chat(`  §bK/D: §e${kdr} §8| §bFK/D: §e${fkdr}`);
  }
}

module.exports = InGameTracker;
