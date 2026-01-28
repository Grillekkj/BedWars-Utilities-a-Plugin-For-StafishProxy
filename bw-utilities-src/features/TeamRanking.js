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

class TeamRanking {
  constructor(api, apiService, bwuInstance) {
    this.api = api;
    this.apiService = apiService;
    this.bwu = bwuInstance;
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
   */
  calculateThreatScore(fkdr, wlr, winstreak, stars) {
    // Sigmoid normalization: converts unbounded metrics to 0-1 scale
    // Formula: 1 / (1 + e^(-k * (x - midpoint)))
    // This creates an S-curve where midpoint maps to 0.5
    
    // FKDR normalization (midpoint: 3.0, steepness: 0.8)
    // Players with 3.0 FKDR are considered "average threat"
    // 1.0 FKDR ≈ 0.13, 3.0 FKDR ≈ 0.50, 5.0 FKDR ≈ 0.84, 10.0 FKDR ≈ 0.99
    const normalizedFkdr = 1 / (1 + Math.exp(-0.8 * (fkdr - 3.0)));
    
    // WLR normalization (midpoint: 2.0, steepness: 1.0)
    // Players with 2.0 WLR are considered "average threat"
    // 0.5 WLR ≈ 0.18, 2.0 WLR ≈ 0.50, 4.0 WLR ≈ 0.88, 8.0 WLR ≈ 0.99
    const normalizedWlr = 1 / (1 + Math.exp(-1.0 * (wlr - 2.0)));
    
    // Winstreak normalization (midpoint: 3.0, steepness: 0.5)
    // Players with 3 winstreak are considered "average threat"
    // 0 WS ≈ 0.18, 3 WS ≈ 0.50, 6 WS ≈ 0.78, 10 WS ≈ 0.92, 15 WS ≈ 0.98
    const normalizedWinstreak = 1 / (1 + Math.exp(-0.5 * (winstreak - 3.0)));
    
    // Stars normalization (midpoint: 250, steepness: 0.01)
    // Players with 250 stars are considered "average threat"
    // 50✫ ≈ 0.12, 250✫ ≈ 0.50, 500✫ ≈ 0.92, 750✫ ≈ 0.99, 1000✫ ≈ 1.0
    const normalizedStars = 1 / (1 + Math.exp(-0.01 * (stars - 250)));
    
    // Apply weightage: 70% FKDR, 10% WLR, 15% Winstreak, 5% Stars
    const weightedScore = 
      0.70 * normalizedFkdr +
      0.10 * normalizedWlr +
      0.15 * normalizedWinstreak +
      0.05 * normalizedStars;
    
    // Convert to 0-100 scale for easier interpretation
    return weightedScore * 100;
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
    }

    const { teamsData, isSolosMode } = await this.collectTeamsData(
      playerNames,
      myTeamLetter
    );
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

        if (!teamLetter || teamLetter === myTeamLetter) return;

        const realName =
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

        const threat = this.calculateThreatScore(fkdr, wlr, winstreak, stars);

        if (!teamsData[teamLetter]) {
          teamsData[teamLetter] = {
            totalFkdr: 0,
            totalStars: 0,
            totalWlr: 0,
            totalWinstreak: 0,
            totalThreat: 0,
            playerCount: 0,
          };
        }
        teamsData[teamLetter].totalFkdr += fkdr;
        teamsData[teamLetter].totalStars += stars;
        teamsData[teamLetter].totalWlr += wlr;
        teamsData[teamLetter].totalWinstreak += winstreak;
        teamsData[teamLetter].totalThreat += threat;
        teamsData[teamLetter].playerCount += 1;
      })
    );

    const myTeamSize = teamPlayerCounts[myTeamLetter] || 1;
    const isSolosMode = myTeamSize <= 1;

    return { teamsData, isSolosMode };
  }

  async displayRanking(teamsData, isSolosMode, rankingSent) {
    if (rankingSent) return;

    const useSeparateMessages = this.api.config.get(
      "teamRanking.separateMessages"
    );
    const displayMode =
      this.api.config.get("teamRanking.displayMode") || "total";

    const sortedTeams = Object.entries(teamsData)
      .map(([letter, data]) => ({
        letter,
        name: TEAM_MAP[letter]?.name || "Unknown",
        totalFkdr: data.totalFkdr,
        totalStars: data.totalStars,
        totalWlr: data.totalWlr,
        totalWinstreak: data.totalWinstreak,
        totalThreat: data.totalThreat,
        playerCount: data.playerCount,
      }))
      .sort((a, b) => b.totalThreat - a.totalThreat);

    if (sortedTeams.length === 0) {
      this.api.chat(
        `${this.api.getPrefix()} §cUnable to calculate ranking (no enemy team found).`
      );
      return;
    }

    const rankingParts = sortedTeams.map((team, index) => {
      const teamColor = TEAM_MAP[team.letter]?.color || "§7";
      let statsDisplay;
      const count = Math.max(1, team.playerCount);
      if (displayMode === "avg") {
        const avgFkdr = (team.totalFkdr / count).toFixed(2);
        const avgStars = Math.round(team.totalStars / count);
        statsDisplay = `${avgStars}✫ | ${avgFkdr} FKDR`;
      } else {
        const totalStars = Math.round(team.totalStars);
        statsDisplay = `${totalStars}✫ | ${team.totalFkdr.toFixed(2)} FKDR`;
      }
      const teamInfo = `${index + 1}. ${teamColor}${team.name} §f(${statsDisplay})`;
      return teamInfo;
    });

    if (useSeparateMessages) {
      let index = 0;
      for (const part of rankingParts) {
        setTimeout(() => {
          this._sendMessage(part);
        }, index * 350);
        index++;
      }
    } else {
      const targetMessage = rankingParts.shift();
      this._sendMessage(targetMessage);
      if (rankingParts.length > 0) {
        this.sendRankingMessages(rankingParts);
      }
    }
  }

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
    }
    for (let i = 0; i < messagesToSend.length; i++) {
      const msg = messagesToSend[i];
      setTimeout(() => {
        this._sendMessage(msg);
      }, (i + 1) * 350);
    }
  }
}

module.exports = TeamRanking;