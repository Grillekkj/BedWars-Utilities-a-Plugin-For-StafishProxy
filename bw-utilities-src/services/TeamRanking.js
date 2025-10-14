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
  constructor(api, apiService) {
    this.api = api;
    this.apiService = apiService;
  }

  getTeamLetter(rawPrefix) {
    if (!rawPrefix) return null;
    const match = rawPrefix.match(/[A-Z]/);
    return match ? match[0] : null;
  }

  getMyTeamLetter() {
    const myNick = this.api.config.get("main.MY_NICK");
    const me = this.api.getPlayerByName(myNick);

    if (!me) return null;

    const myTeam = this.api.getPlayerTeam(me.name);
    return this.getTeamLetter(myTeam?.prefix);
  }

  async processAndDisplayRanking(playerNames, isSolosMode, rankingSent) {
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

    const teamsData = await this.collectTeamsData(playerNames, myTeamLetter);
    await this.displayRanking(teamsData, isSolosMode, rankingSent);
  }

  async collectTeamsData(playerNames, myTeamLetter) {
    const teamsData = {};

    await Promise.all(
      playerNames.map(async (playerName) => {
        const player = this.api.getPlayerByName(playerName);
        if (!player) return;

        const stats = await this.apiService.getPlayerStats(playerName);
        const team = this.api.getPlayerTeam(playerName);
        const teamLetter = this.getTeamLetter(team?.prefix);

        if (!teamLetter || teamLetter === myTeamLetter) return;

        const fkdr =
          stats && !stats.isNicked && stats.fkdr !== undefined
            ? stats.fkdr
            : 5.0;
        const stars =
          stats && !stats.isNicked && stats.stars !== undefined
            ? stats.stars
            : 500;

        if (!teamsData[teamLetter]) {
          teamsData[teamLetter] = { totalFkdr: 0, totalStars: 0 };
        }

        teamsData[teamLetter].totalFkdr += fkdr;
        teamsData[teamLetter].totalStars += stars;
      })
    );

    return teamsData;
  }

  async displayRanking(teamsData, isSolosMode, rankingSent) {
    if (rankingSent) {
      return;
    }

    const sortedTeams = Object.entries(teamsData)
      .map(([letter, data]) => ({
        name: TEAM_MAP[letter]?.name || "Unknown",
        totalFkdr: data.totalFkdr,
        totalStars: data.totalStars,
      }))
      .sort((a, b) => b.totalFkdr - a.totalFkdr);

    if (sortedTeams.length === 0) {
      this.api.chat(
        `${this.api.getPrefix()} §cUnable to calculate ranking (no enemy team found).`
      );
      return;
    }

    const rankingParts = sortedTeams.map((team, index) => {
      const teamInfo = `${index + 1}. ${team.name} (Stars: ${
        team.totalStars
      } | FKDR: ${team.totalFkdr.toFixed(1)})`;
      if (index === 0) {
        const targetMessage = isSolosMode
          ? "<- TARGET"
          : "<- TARGET (no crossmap unless they start)";
        return `${teamInfo} ${targetMessage}`;
      }
      return teamInfo;
    });

    const targetMessage = rankingParts.shift();

    if (isSolosMode) {
      this.api.chat(targetMessage);
    } else {
      this.api.sendChatToServer(`/ac ${targetMessage}`);
    }

    if (rankingParts.length > 0) {
      this.sendRankingMessages(rankingParts, isSolosMode);
    }
  }

  sendRankingMessages(rankingParts, isSolosMode) {
    const messagesToSend = [];
    let currentMessage = "";
    const CHAT_LIMIT = 240;
    const SEPARATOR = " // ";

    for (const part of rankingParts) {
      if (currentMessage === "") {
        currentMessage = part;
      } else if (
        currentMessage.length + SEPARATOR.length + part.length >
        CHAT_LIMIT
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
        if (isSolosMode) {
          this.api.chat(msg);
        } else {
          this.api.sendChatToServer(`/ac ${msg}`);
        }
      }, (i + 1) * 350);
    }
  }
}

module.exports = TeamRanking;

