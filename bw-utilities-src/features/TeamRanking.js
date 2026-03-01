const path = require("node:path");
const fs = require("node:fs");

const TEAM_MAP = {
  R: { name: "Red", color: "§c" },
  B: { name: "Blue", color: "§9" },
  G: { name: "Green", color: "§a" },
  Y: { name: "Yellow", color: "§e" },
  A: { name: "Aqua", color: "§b" },
  W: { name: "White", color: "§f" },
  P: { name: "Pink", color: "§d" },
  S: { name: "Gray", color: "§7" },
};

// Team order for neighboring team calculation
const TEAM_ORDER = ["R", "B", "G", "Y", "A", "W", "P", "S"];

class TeamRanking {
  constructor(api, apiService, bwuInstance) {
    this.api = api;
    this.apiService = apiService;
    this.bwu = bwuInstance;

    // Sigmoid overrides are stored in a plain JSON file — bypasses Statisfy config.set/get entirely
    const baseDir = process.pkg
      ? path.dirname(process.execPath)
      : path.join(__dirname, "..", "..", "..");
    const dataDir = path.join(baseDir, "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.sigmoidFilePath = path.join(dataDir, "bwu_sigmoid.json");
  }

  /** Read the sigmoid overrides file. Returns {} if missing or corrupt. */
  _readSigmoidFile() {
    try {
      if (fs.existsSync(this.sigmoidFilePath)) {
        return JSON.parse(fs.readFileSync(this.sigmoidFilePath, "utf8"));
      }
    } catch (e) {
      this.api.debugLog(`[BWU] Error reading sigmoid file: ${e.message}`);
    }
    return {};
  }

  /** Write the full overrides object to the sigmoid file. */
  _writeSigmoidFile(data) {
    try {
      fs.writeFileSync(this.sigmoidFilePath, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {
      this.api.debugLog(`[BWU] Error writing sigmoid file: ${e.message}`);
    }
  }

  _sendMessage(message) {
    let sendType = this.api.config.get("teamRanking.sendType") || "team";
    // If party mode but not in party, fallback to private
    if (sendType === "party" && this.bwu.inParty !== true) {
      sendType = "private";
      this.api.debugLog(`[BWU] Team Ranking sendType: party -> private (not in party)`);
    } else {
      this.api.debugLog(`[BWU] Team Ranking sendType: ${sendType}, inParty: ${this.bwu.inParty}`);
    }
    const cleanMessage = message.replaceAll(/§[0-9a-fk-or]/g, "");
    if (sendType === "private") {
      this.api.chat(message);
    } else if (sendType === "party") {
      this.api.sendChatToServer(`/pc ${cleanMessage}`);
    } else {
      this.api.sendChatToServer(`/ac ${cleanMessage}`);
    }
  }

  getTeamLetter(rawPrefix) {
    if (!rawPrefix) return null;
    const match = rawPrefix.match(/[A-Z]/);
    return match ? match[0] : null;
  }

  getMyTeamLetter() {
    const me = this.api.getCurrentPlayer();
    if (!me?.uuid) return null;
    const myServerInfo = this.api.getPlayerInfo(me.uuid);
    if (!myServerInfo?.name) return null;
    const nameAsSeenByServer = myServerInfo.name;
    const myTeam = this.api.getPlayerTeam(nameAsSeenByServer);
    return this.getTeamLetter(myTeam?.prefix);
  }

  /**
   * Calculate a normalized threat score for a player.
   * Uses sigmoid-based normalization to convert raw stats to 0-1 scale,
   * then applies weightage: 70% FKDR, 10% WLR, 15% Winstreak, 5% Stars
   * 
   * @param {number} fkdr - Final Kills/Deaths Ratio
   * @param {number} wlr - Win/Loss Ratio
   * @param {number} winstreak - Current winstreak
   * @param {number} stars - Star level (prestige)
   * @returns {number} Normalized threat score (0-100)
   */  calculateThreatScore(fkdr, wlr, winstreak, stars) {
    const normalizedFkdr = 1 / (1 + Math.exp(-0.8 * (fkdr - 3.0)));
    const normalizedWlr = 1 / (1 + Math.exp(-1.0 * (wlr - 2.0)));
    const normalizedWinstreak = 1 / (1 + Math.exp(-0.5 * (winstreak - 3.0)));
    const normalizedStars = 1 / (1 + Math.exp(-0.01 * (stars - 250)));
    const weightedScore =
      0.70 * normalizedFkdr +
      0.10 * normalizedWlr +
      0.15 * normalizedWinstreak +
      0.05 * normalizedStars;
    return weightedScore * 100;
  }
  /**
   * Normalize a raw stat value to 0-1 using a sigmoid curve.
   * midpoint = "average" player value, steepness controls how fast it rises.
   */
  _sigmoid(x, midpoint, steepness) {
    return 1 / (1 + Math.exp(-steepness * (x - midpoint)));
  }

  /**
   * Returns the hardcoded default sigmoid params for every variable.
   */
  getSigmoidDefaults() {
    return {
      fkdr:  { midpoint: 3.0,   steepness: 0.8   },
      wlr:   { midpoint: 2.0,   steepness: 1.0   },
      kdr:   { midpoint: 2.0,   steepness: 0.8   },
      bblr:  { midpoint: 1.5,   steepness: 1.0   },
      fk:    { midpoint: 500,   steepness: 0.005 },
      fd:    { midpoint: 200,   steepness: 0.008 },
      k:     { midpoint: 1000,  steepness: 0.003 },
      d:     { midpoint: 500,   steepness: 0.005 },
      bb:    { midpoint: 200,   steepness: 0.01  },
      bl:    { midpoint: 100,   steepness: 0.015 },
      w:     { midpoint: 200,   steepness: 0.008 },
      l:     { midpoint: 100,   steepness: 0.015 },
      stars: { midpoint: 250,   steepness: 0.01  },
      ws:    { midpoint: 3.0,   steepness: 0.5   },
    };
  }

  /**
   * Get effective sigmoid params for a variable.
   * Reads from bwu_sigmoid.json — bypasses Statisfy config entirely.
   */
  _getSigmoidParams(varName) {
    const defaults = this.getSigmoidDefaults();
    const base = defaults[varName];
    if (!base) return null;
    const overrides = this._readSigmoidFile();
    const entry = overrides[varName];
    if (
      entry &&
      typeof entry.midpoint === "number" && !isNaN(entry.midpoint) &&
      typeof entry.steepness === "number" && !isNaN(entry.steepness)
    ) {
      return { midpoint: entry.midpoint, steepness: entry.steepness };
    }
    return base;
  }

  /**
   * Build a normalized variable map (all values 0-1) from raw player stats.
   * Fallback values are used for nicked players.
   */
  _normalizeStats(stats) {
    const s = stats && !stats.isNicked ? stats : {};
    const fkdr  = s.fkdr         ?? 5;
    const wlr   = s.wlr          ?? 3;
    const kdr   = s.kdr          ?? 3;
    const bblr  = s.bblr         ?? 2;
    const fk    = s.final_kills  ?? 500;
    const fd    = s.final_deaths ?? 100;
    const k     = s.kills        ?? 1000;
    const d     = s.deaths       ?? 500;
    const bb    = s.beds_broken  ?? 200;
    const bl    = s.beds_lost    ?? 100;
    const w     = s.wins         ?? 200;
    const l     = s.losses       ?? 100;
    const stars = s.stars        ?? 500;
    const ws    = s.winstreak    ?? 5;

    const p = (v) => this._getSigmoidParams(v);
    return {
      fkdr:  this._sigmoid(fkdr,  p("fkdr").midpoint,  p("fkdr").steepness),
      wlr:   this._sigmoid(wlr,   p("wlr").midpoint,   p("wlr").steepness),
      kdr:   this._sigmoid(kdr,   p("kdr").midpoint,   p("kdr").steepness),
      bblr:  this._sigmoid(bblr,  p("bblr").midpoint,  p("bblr").steepness),
      fk:    this._sigmoid(fk,    p("fk").midpoint,    p("fk").steepness),
      fd:    this._sigmoid(fd,    p("fd").midpoint,    p("fd").steepness),
      k:     this._sigmoid(k,     p("k").midpoint,     p("k").steepness),
      d:     this._sigmoid(d,     p("d").midpoint,     p("d").steepness),
      bb:    this._sigmoid(bb,    p("bb").midpoint,    p("bb").steepness),
      bl:    this._sigmoid(bl,    p("bl").midpoint,    p("bl").steepness),
      w:     this._sigmoid(w,     p("w").midpoint,     p("w").steepness),
      l:     this._sigmoid(l,     p("l").midpoint,     p("l").steepness),
      stars: this._sigmoid(stars, p("stars").midpoint, p("stars").steepness),
      ws:    this._sigmoid(ws,    p("ws").midpoint,    p("ws").steepness),
    };
  }

  /**
   * Evaluate a user-defined equation string against a normalized variable map.
   * Returns null if the equation is invalid/throws.
   * Only allows: digits, whitespace, math operators, dots, parentheses, and whitelisted var names.
   */
  evaluateEquation(eqn, vars) {
    // Whitelist: only safe characters + known variable names
    const ALLOWED = /^[0-9\s+\-*/().]+$/;
    // Replace variable names with their values first
    const VARS = ['bblr','fkdr','kdr','wlr','stars','ws','fk','fd','bb','bl','k','d','w','l'];
    let expr = eqn;
    for (const v of VARS) {
      expr = expr.replaceAll(v, String(vars[v]));
    }
    // After substitution, only numbers and operators should remain
    if (!ALLOWED.test(expr)) return null;
    try {
      // eslint-disable-next-line no-new-func
      const result = new Function(`"use strict"; return (${expr});`)();
      if (typeof result !== "number" || !isFinite(result)) return null;
      return result;
    } catch {
      return null;
    }
  }

  async processAndDisplayRanking(playerNames, rankingSent) {
    if (!this.api.config.get("teamRanking.enabled")) {
      return;
    }

    this.api.chat(
      `${this.api.getPrefix()} §eAnalyzing ${
        playerNames.length
      } players for team ranking...`
    );

    const myTeamLetter = this.getMyTeamLetter();
    if (!myTeamLetter) {
      this.api.chat(
        `${this.api.getPrefix()} §cUnable to detect your team. Ranking will not be calculated.`
      );
      return;
    }    const { teamsData, isSolosMode } = await this.collectTeamsData(
      playerNames,
      myTeamLetter
    );
    
    // Display First Rushes (neighboring teams stats) - waits until all done
    await this.displayFirstRushes(playerNames, teamsData);
    
    // Display main team ranking
    await this.displayRanking(teamsData, isSolosMode, rankingSent);
  }
  async collectTeamsData(playerNames, myTeamLetter) {
    const teamsData = {};
    const teamPlayerCounts = {};

    await Promise.all(
      playerNames.map(async (playerName) => {
        const team = this.api.getPlayerTeam(playerName);
        const teamLetter = this.getTeamLetter(team?.prefix);

        if (teamLetter) {
          teamPlayerCounts[teamLetter] =
            (teamPlayerCounts[teamLetter] || 0) + 1;
        }

        // Include both enemy teams and your team (if showYourTeam is enabled)
        if (!teamLetter) return;
        
        // Skip your team in the normal flow (will be added separately if enabled)
        const isMyTeam = teamLetter === myTeamLetter;
        if (isMyTeam && !this.api.config.get("teamRanking.showYourTeam")) {
          return;
        }        const realName =
          this.bwu.resolvedNicks.get(playerName.toLowerCase()) || playerName;        const stats = await this.apiService.getPlayerStats(realName);
        const fkdr =
          stats && !stats.isNicked && stats.fkdr !== undefined ? stats.fkdr : 5;
        const stars =
          stats && !stats.isNicked && stats.stars !== undefined
            ? stats.stars
            : 500;
        const wlr =
          stats && !stats.isNicked && stats.wlr !== undefined ? stats.wlr : 3;
        const winstreak =
          stats && !stats.isNicked && stats.winstreak !== undefined
            ? stats.winstreak
            : 5;

        // Use custom equation if set, otherwise use default sigmoid threat score
        const customEqn = (this.api.config.get("teamRanking.rankEquation") || "").trim();
        let threat;
        if (customEqn) {
          const vars = this._normalizeStats(stats);
          const result = this.evaluateEquation(customEqn, vars);
          if (result === null) {
            // Invalid equation — notify once and fall back to default
            if (!this._eqnErrorNotified) {
              this._eqnErrorNotified = true;
              this.api.chat(`${this.api.getPrefix()} §cRank equation failed! Using default. Check /bwu setrankeqn`);
            }
            threat = this.calculateThreatScore(fkdr, wlr, winstreak, stars);
          } else {
            this._eqnErrorNotified = false;
            threat = result * 100; // scale to match default 0-100 range
          }
        } else {
          threat = this.calculateThreatScore(fkdr, wlr, winstreak, stars);
        }if (!teamsData[teamLetter]) {
          teamsData[teamLetter] = {
            totalFkdr: 0,
            totalStars: 0,
            totalWlr: 0,
            totalWinstreak: 0,
            totalThreat: 0,
            playerCount: 0,
            playerNames: [],
            isMyTeam: isMyTeam,
          };
        }
        teamsData[teamLetter].totalFkdr += fkdr;
        teamsData[teamLetter].totalStars += stars;
        teamsData[teamLetter].totalWlr += wlr;
        teamsData[teamLetter].totalWinstreak += winstreak;
        teamsData[teamLetter].totalThreat += threat;
        teamsData[teamLetter].playerCount += 1;
        teamsData[teamLetter].playerNames.push(playerName);
      })
    );

    const myTeamSize = teamPlayerCounts[myTeamLetter] || 1;
    const isSolosMode = myTeamSize <= 1;

    return { teamsData, isSolosMode };
  }  async displayRanking(teamsData, isSolosMode, rankingSent) {
    if (rankingSent) return;

    const useSeparateMessages = this.api.config.get("teamRanking.separateMessages");
    const displayMode = this.api.config.get("teamRanking.displayMode") || "total";
    const maxTeams = this.api.config.get("teamRanking.maxTeams") || 3;    const showYourTeam = this.api.config.get("teamRanking.showYourTeam") || false;

    const allTeams = Object.entries(teamsData)
      .map(([letter, data]) => ({
        letter,
        name: TEAM_MAP[letter]?.name || "Unknown",
        totalFkdr: data.totalFkdr,
        totalStars: data.totalStars,
        totalWlr: data.totalWlr,
        totalWinstreak: data.totalWinstreak,
        totalThreat: data.totalThreat,
        playerCount: data.playerCount,
        playerNames: data.playerNames || [],
        isMyTeam: data.isMyTeam || false,
      }));    const enemyTeams = allTeams.filter(team => !team.isMyTeam).sort((a, b) => b.totalThreat - a.totalThreat);
    const myTeam = allTeams.find(team => team.isMyTeam);

    if (enemyTeams.length === 0) {
      this.api.chat(`${this.api.getPrefix()} §cUnable to calculate ranking (no enemy team found).`);
      return;
    }

    const teamsToShow = enemyTeams.slice(0, Math.min(maxTeams, enemyTeams.length));

    // Build ranking with all teams (including yours) sorted by threat to get true rank positions
    const allTeamsSorted = [...allTeams].sort((a, b) => b.totalThreat - a.totalThreat);

    const formatTeamStats = (team) => {
      const count = Math.max(1, team.playerCount);
      if (displayMode === "avg") {
        const avgFkdr = (team.totalFkdr / count).toFixed(2);
        const avgStars = Math.round(team.totalStars / count);
        return `${avgStars}✫ | ${avgFkdr} FKDR`;
      } else {
        return `${Math.round(team.totalStars)}✫ | ${team.totalFkdr.toFixed(2)} FKDR`;
      }
    };

    // Build rankingParts, inserting [YOU] at its true rank position if showYourTeam is on
    const rankingParts = [];
    let enemiesAdded = 0;
    let myTeamInserted = false;

    for (let i = 0; i < allTeamsSorted.length; i++) {
      const team = allTeamsSorted[i];
      const trueRank = i + 1;

      if (team.isMyTeam) {
        if (showYourTeam && myTeam) {
          const teamColor = TEAM_MAP[team.letter]?.color || "§7";
          rankingParts.push(`§7[YOU #${trueRank}] ${teamColor}${team.name} §f(${formatTeamStats(team)})`);
          myTeamInserted = true;
        }
      } else {
        if (enemiesAdded < teamsToShow.length) {
          const teamColor = TEAM_MAP[team.letter]?.color || "§7";
          rankingParts.push(`${trueRank}. ${teamColor}${team.name} §f(${formatTeamStats(team)})`);
          enemiesAdded++;
        }
      }

      // Stop once we've shown all enemy teams and (if needed) your team
      const doneEnemies = enemiesAdded >= teamsToShow.length;
      const doneMyTeam = !showYourTeam || myTeamInserted;
      if (doneEnemies && doneMyTeam) break;
    }

    if (useSeparateMessages) {
      let index = 0;
      for (const part of rankingParts) {
        setTimeout(() => { this._sendMessage(part); }, index * 350);
        index++;
      }
    } else {
      const targetMessage = rankingParts.shift();
      this._sendMessage(targetMessage);
      if (rankingParts.length > 0) {
        this.sendRankingMessages(rankingParts);
      }
    }  }

  sendRankingMessages(rankingParts) {
    const messagesToSend = [];
    let currentMessage = "";
    const CHAT_LIMIT = 240;
    const SEPARATOR = " §6//§f ";
    for (const part of rankingParts) {
      if (currentMessage === "") {
        currentMessage = part;
      } else if (
        currentMessage.length + SEPARATOR.length + part.length > CHAT_LIMIT
      ) {
        messagesToSend.push(currentMessage);
        currentMessage = part;
      } else {
        currentMessage += SEPARATOR + part;
      }
    }
    if (currentMessage) {
      messagesToSend.push(currentMessage);
    }    for (let i = 0; i < messagesToSend.length; i++) {
      const msg = messagesToSend[i];
      setTimeout(() => {
        this._sendMessage(msg);
      }, (i + 1) * 350);
    }
  }

  /**
   * Get the two neighboring teams based on team order
   * Order: Red, Blue, Green, Yellow, Aqua, White, Pink, Gray
   * Returns the teams on the left and right in the circular order
   * @param {string} myTeamLetter - The letter of your team (R, B, G, Y, A, W, P, S)
   * @returns {Array<string>} Array of two neighboring team letters [left, right]
   */
  getNeighboringTeams(myTeamLetter) {
    const myIndex = TEAM_ORDER.indexOf(myTeamLetter);
    if (myIndex === -1) return [];
    
    const teamCount = TEAM_ORDER.length;
    const leftIndex = (myIndex - 1 + teamCount) % teamCount;
    const rightIndex = (myIndex + 1) % teamCount;
    
    return [TEAM_ORDER[leftIndex], TEAM_ORDER[rightIndex]];
  }

  /**
   * Display stats of neighboring teams at game start
   * @param {Array<string>} playerNames - List of all player names from /who
   * @param {Object} teamsData - Team data collected from collectTeamsData
   */  async displayFirstRushes(playerNames, teamsData) {
    if (!this.api.config.get("teamRanking.firstRushesPlayerStats")) {
      return;
    }
    
    const myTeamLetter = this.getMyTeamLetter();
    if (!myTeamLetter) {
      return;
    }
    
    const neighboringTeams = this.getNeighboringTeams(myTeamLetter);
    if (neighboringTeams.length === 0) {
      return;
    }
    
    // Group players by team
    const playersByTeam = {};
    for (const playerName of playerNames) {
      const team = this.api.getPlayerTeam(playerName);
      const teamLetter = this.getTeamLetter(team?.prefix);
      
      if (teamLetter && neighboringTeams.includes(teamLetter)) {
        if (!playersByTeam[teamLetter]) {
          playersByTeam[teamLetter] = [];
        }
        playersByTeam[teamLetter].push(playerName);
      }
    }
    
    const MESSAGE_DELAY = 1200;
    
    // Display stats for each neighboring team sequentially
    for (const teamLetter of neighboringTeams) {
      const players = playersByTeam[teamLetter];
      
      if (!players || players.length === 0) {
        continue;
      }
      
      const teamInfo = TEAM_MAP[teamLetter];
      const teamData = teamsData[teamLetter];
      
      if (!teamInfo || !teamData) {
        continue;
      }
      
      // Calculate team ranking (1-based index)
      const allEnemyTeams = Object.entries(teamsData)
        .filter(([letter, data]) => letter !== myTeamLetter)
        .map(([letter, data]) => ({ letter, threat: data.totalThreat }))
        .sort((a, b) => b.threat - a.threat);
      
      const ranking = allEnemyTeams.findIndex(t => t.letter === teamLetter) + 1;
        // Send header
      const header = `${teamInfo.color}${teamInfo.name} ${ranking > 0 ? `§7(#${ranking})` : ''}§7:`;
      this._sendMessage(header);
      await new Promise((resolve) => setTimeout(resolve, MESSAGE_DELAY));
      
      // Send each player's stats only if firstRushesPlayerStats is enabled
      if (this.api.config.get("teamRanking.firstRushesPlayerStats")) {
        for (const playerName of players) {
          const realName = this.bwu.resolvedNicks.get(playerName.toLowerCase()) || playerName;
          const stats = await this.apiService.getPlayerStats(realName);
          
          let ping = null;
          if (this.api.config.get("stats.showPing.enabled")) {
            const uuid = await this.apiService.getUuid(realName);
            if (uuid) {
              ping = await this.apiService.getPlayerPing(uuid);
            }
          }
          
          const message = this.bwu.statsFormatter.formatStats(
            "chat",
            playerName,
            stats,
            ping,
            { includePrefix: false }
          );
          
          this._sendMessage(`  ${message}`);
          await new Promise((resolve) => setTimeout(resolve, MESSAGE_DELAY));
        }
      }
    }
    
    // One final delay before returning so main ranking doesn't conflict
    await new Promise((resolve) => setTimeout(resolve, MESSAGE_DELAY));
  }
}

module.exports = TeamRanking;