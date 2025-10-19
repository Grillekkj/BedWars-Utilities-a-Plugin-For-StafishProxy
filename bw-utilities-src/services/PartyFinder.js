class PartyFinder {
  constructor(api, apiService) {
    this.api = api;
    this.apiService = apiService;
    this.messageSuffixes = ["o/", "hello", "hi", "<3"];
    this.resetState();
  }

  resetState() {
    this.isActive = false;
    this.state = null;
    clearTimeout(this.messageLoopTimeout);
  }

  start(args) {
    if (this.isActive) {
      this.api.chat(
        `${this.api.getPrefix()} §cParty finder is already active. Use /bwu find stop.`
      );
      return;
    }

    const [mode, playersToFind, fkdrThreshold, ...positions] = args;

    if (
      !["2", "3", "4"].includes(mode) ||
      !["1", "2", "3"].includes(playersToFind) ||
      Number.isNaN(Number.parseFloat(fkdrThreshold))
    ) {
      this.api.chat(
        `${this.api.getPrefix()} §cInvalid arguments. Usage: /bwu find (mode) <2|3|4> (people) <1|2|3> <fkdr> <role1> <role2>...`
      );
      return;
    }

    const playersToFindNum = Number.parseInt(playersToFind);
    const modeNum = Number.parseInt(mode);

    if (playersToFindNum >= modeNum) {
      this.api.chat(
        `${this.api.getPrefix()} §cError: The number of players to find (${playersToFindNum})§c must be less §cthan the mode size (${modeNum})§c.`
      );
      return;
    }

    const initialVacancies = [];
    for (let i = 0; i < playersToFindNum; i++) {
      initialVacancies.push(positions[i] || "any");
    }

    this.state = {
      mode: Number.parseInt(mode),
      playersToFind: playersToFindNum,
      fkdrThreshold: Number.parseFloat(fkdrThreshold),
      vacancies: initialVacancies,
      foundPlayers: [],
      myNick: null,
      currentSuffixIndex: -1,
      isProcessing: false,
    };

    this.isActive = true;
    this.api.chat(`${this.api.getPrefix()} §aStarting party finder...`);
    this.executeNextStep();
  }

  stop() {
    if (!this.isActive) {
      this.api.chat(`${this.api.getPrefix()} §cParty finder is not active.`);
      return;
    }
    this.resetState();
    this.api.chat(`${this.api.getPrefix()} §cParty finder stopped.`);
  }

  async executeNextStep() {
    if (!this.isActive) return;

    if (this.state.vacancies.length === 0) {
      this.api.chat(
        `${this.api.getPrefix()} §aFinished finding all players! Party is full.`
      );
      this.resetState();
      return;
    }

    const me = this.api.getCurrentPlayer();
    if (!me?.uuid) return this.stop();
    this.state.myNick = this.api.getPlayerInfo(me.uuid)?.name || me.name;

    if (this.state.foundPlayers.length === 0) {
      this.api.sendChatToServer("/bedwars");
      await this.sleep(1000);
      this.api.sendChatToServer("/swaplobby 1");
      await this.sleep(3000);
    }

    this.state.isProcessing = false;
    this.startMessageLoop();
  }

  startMessageLoop() {
    if (!this.isActive || this.state.isProcessing) return;

    this.state.currentSuffixIndex =
      (this.state.currentSuffixIndex + 1) % this.messageSuffixes.length;

    const suffix = this.messageSuffixes[this.state.currentSuffixIndex];
    const currentPartySize = this.state.mode - this.state.vacancies.length;
    const position = this.state.vacancies[0];
    const message = `/ac ${currentPartySize}/${this.state.mode} ${position} ${suffix}`;

    this.api.chat(
      `${this.api.getPrefix()} §eLooking for player ${
        this.state.foundPlayers.length + 1
      }/${this.state.playersToFind} (Pos: ${position}). Sending: ${message}`
    );
    this.api.sendChatToServer(message);

    const isLastSuffix =
      this.state.currentSuffixIndex === this.messageSuffixes.length - 1;
    const nextDelay = isLastSuffix ? 10000 : 7000;

    this.messageLoopTimeout = setTimeout(
      () => this.startMessageLoop(),
      nextDelay
    );
  }

  async handleChatMessage(cleanMessage) {
    if (!this.isActive || !this.state) return;

    if (this.state.foundPlayers.length > 0) {
      if (this._handlePartyLeave(cleanMessage)) {
        return;
      }
    }

    if (this.state.isProcessing && this.state.waitingForPlayer) {
      if (this._handleInviteResponse(cleanMessage)) {
        return;
      }
    }

    if (!this.state.isProcessing) {
      this._handleMention(cleanMessage);
    }
  }

  _handlePartyLeave(cleanMessage) {
    const leaveRegex = /^(\[.*?\]\s)?(\w{3,16}) has left the party\.$/i;
    const leaveMatch = cleanMessage.match(leaveRegex);

    if (leaveMatch) {
      const playerNameWhoLeft = leaveMatch[2];
      const playerIndex = this.state.foundPlayers.findIndex(
        (p) => p.name.toLowerCase() === playerNameWhoLeft.toLowerCase()
      );

      if (playerIndex > -1) {
        clearTimeout(this.messageLoopTimeout);
        const playerInfo = this.state.foundPlayers[playerIndex];
        this.api.chat(
          `${this.api.getPrefix()} §c${
            playerInfo.name
          } left. Finding replacement for: ${playerInfo.position}...`
        );

        this.state.foundPlayers.splice(playerIndex, 1);
        this.state.vacancies.unshift(playerInfo.position);

        this.executeNextStep();
        return true;
      }
    }
    return false;
  }

  _handleInviteResponse(cleanMessage) {
    const waitingFor = this.state.waitingForPlayer;
    const joinRegex = new RegExp(
      `^(\\[.*?\\]\\s)?${waitingFor} joined the party\\.$`,
      "i"
    );
    const expireRegex = new RegExp(
      `^The party invite to .*${waitingFor} has expired.*$`,
      "i"
    );

    if (joinRegex.test(cleanMessage)) {
      this.api.chat(`${this.api.getPrefix()} §a${waitingFor} joined!`);

      const filledPosition = this.state.vacancies.shift();
      this.state.foundPlayers.push({
        name: waitingFor,
        position: filledPosition,
      });

      this.sleep(1500).then(() => this.executeNextStep());
      return true;
    } else if (expireRegex.test(cleanMessage)) {
      this.api.chat(
        `${this.api.getPrefix()} §cInvite expired. Resuming search...`
      );
      this.sleep(1500).then(() => this.executeNextStep());
      return true;
    }
    return false;
  }

  async _handleMention(cleanMessage) {
    const chatRegex = /^(?:\[.*?\]\s*)*(\w{3,16})(?::| ») (.*)/;
    const match = cleanMessage.match(chatRegex);

    if (match) {
      const senderName = match[1];
      const messageContent = match[2];
      const alreadyFound = this.state.foundPlayers.some(
        (p) => p.name.toLowerCase() === senderName.toLowerCase()
      );

      if (
        messageContent
          .toLowerCase()
          .includes(this.state.myNick.toLowerCase()) &&
        !alreadyFound
      ) {
        this.state.isProcessing = true;
        clearTimeout(this.messageLoopTimeout);

        this.api.chat(
          `${this.api.getPrefix()} §aMention by ${senderName}. Checking stats...`
        );
        const stats = await this.apiService.getPlayerStats(senderName);

        if (stats && stats.fkdr >= this.state.fkdrThreshold) {
          this.state.waitingForPlayer = senderName;
          this.api.chat(
            `${this.api.getPrefix()} §a${senderName} has ${stats.fkdr.toFixed(
              2
            )} FKDR. Inviting...`
          );
          this.api.sendChatToServer(`/p invite ${senderName}`);
        } else {
          const reason = stats
            ? `FKDR too low (${stats.fkdr.toFixed(2)})`
            : "Stats not found";
          this.api.chat(
            `${this.api.getPrefix()} §cSkipping ${senderName}: ${reason}.`
          );
          this.state.isProcessing = false;
          this.startMessageLoop();
        }
      }
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = PartyFinder;

