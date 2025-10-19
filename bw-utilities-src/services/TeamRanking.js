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

  _sendMessage(message, isPrivate) {
    if (isPrivate) {
      this.api.chat(message);
    } else {
      const cleanMessage = message.replaceAll(/§[0-9a-fk-or]/g, "");
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
    if (!me?.uuid) {
      return null;
    }

    const myServerInfo = this.api.getPlayerInfo(me.uuid);
    if (!myServerInfo?.name) {
      return null;
    }

    const nameAsSeenByServer = myServerInfo.name;
    const myTeam = this.api.getPlayerTeam(nameAsSeenByServer);

    return this.getTeamLetter(myTeam?.prefix);
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
        const player = this.api.getPlayerByName(playerName);
        if (!player) return;

        const team = this.api.getPlayerTeam(playerName);
        const teamLetter = this.getTeamLetter(team?.prefix);

        if (teamLetter) {
          teamPlayerCounts[teamLetter] =
            (teamPlayerCounts[teamLetter] || 0) + 1;
        }

        if (!teamLetter || teamLetter === myTeamLetter) return;

        const stats = await this.apiService.getPlayerStats(playerName);
        const fkdr =
          stats && !stats.isNicked && stats.fkdr !== undefined ? stats.fkdr : 5;
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

    let singlePlayerTeamCount = 0;
    for (const teamSize of Object.values(teamPlayerCounts)) {
      if (teamSize === 1) {
        singlePlayerTeamCount++;
      }
    }
    const isSolosMode = singlePlayerTeamCount >= 2;

    return { teamsData, isSolosMode };
  }

  async displayRanking(teamsData, isSolosMode, rankingSent) {
    if (rankingSent) {
      return;
    }

    const alwaysPrivate = this.api.config.get("privateRanking.alwaysPrivate");
    const useSeparateMessages = this.api.config.get(
      "teamRanking.separateMessages"
    );
    const sendPrivately = isSolosMode || alwaysPrivate;

    const sortedTeams = Object.entries(teamsData)
      .map(([letter, data]) => ({
        letter,
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
      const teamColor = sendPrivately
        ? TEAM_MAP[team.letter]?.color || "§7"
        : "";
      const teamInfo = `${index + 1}. ${teamColor}${team.name} §f(Stars: ${
        team.totalStars
      } | FKDR: ${team.totalFkdr.toFixed(1)})`;

      if (index === 0) {
        const targetMessage = sendPrivately
          ? "§c <- TARGET"
          : "<- TARGET (no crossmap unless they start)";
        return `${teamInfo} ${targetMessage}`;
      }
      return teamInfo;
    });

    if (useSeparateMessages) {
      let index = 0;
      for (const part of rankingParts) {
        setTimeout(() => {
          this._sendMessage(part, sendPrivately);
        }, index * 350);
        index++;
      }
    } else {
      const targetMessage = rankingParts.shift();
      this._sendMessage(targetMessage, sendPrivately);

      if (rankingParts.length > 0) {
        this.sendRankingMessages(rankingParts, sendPrivately);
      }
    }
  }

  sendRankingMessages(rankingParts, isPrivate) {
    const messagesToSend = [];
    let currentMessage = "";
    const CHAT_LIMIT = 240;
    const SEPARATOR = " §6//§f ";

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
        this._sendMessage(msg, isPrivate);
      }, (i + 1) * 350);
    }
  }
}

module.exports = TeamRanking;
