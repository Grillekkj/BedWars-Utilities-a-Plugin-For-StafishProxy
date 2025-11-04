const { execSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

class DependencyManager {
  constructor(dataDir, depsDir, api, log, logError, logDebug) {
    this.dataDir = dataDir;
    this.depsDir = depsDir;
    this.api = api;
    this.log = log;
    this.logError = logError;
    this.logDebug = logDebug;
    this.dependencyInstallMarker = path.join(
      dataDir,
      ".bwu_dependency_install_state"
    );
  }

  isDependencyActuallyAvailable(dep) {
    try {
      const depPath = require.resolve(dep, { paths: [this.depsDir] });
      delete require.cache[depPath];
      require(depPath);
      this.logDebug(`Dependency '${dep}' is available and working.`);
      return { status: "available" };
    } catch (e) {
      this.logDebug(`Dependency '${dep}' verification failed: ${e.message}`);

      const possiblePaths = [
        path.join(this.depsDir, dep),
        path.join(this.depsDir, dep, "package.json"),
        path.join(this.dataDir, "node_modules", dep),
        path.join(this.dataDir, "node_modules", dep, "package.json"),
      ];

      const physicallyExists = possiblePaths.some((p) => fs.existsSync(p));
      if (physicallyExists) {
        this.logDebug(
          `Dependency '${dep}' exists physically but require failed. May work after restart.`
        );
        return { status: "restart_needed" };
      }

      return { status: "missing" };
    }
  }

  getDependencyInstallState() {
    if (!fs.existsSync(this.dependencyInstallMarker)) {
      return null;
    }

    try {
      const state = JSON.parse(
        fs.readFileSync(this.dependencyInstallMarker, "utf8")
      );
      return state;
    } catch (e) {
      this.logDebug(`Error reading dependency install state: ${e.message}`);
      return null;
    }
  }

  saveDependencyInstallState(state) {
    try {
      fs.writeFileSync(
        this.dependencyInstallMarker,
        JSON.stringify(state, null, 2)
      );
    } catch (e) {
      this.logDebug(`Error saving dependency install state: ${e.message}`);
    }
  }

  clearDependencyInstallState() {
    try {
      if (fs.existsSync(this.dependencyInstallMarker)) {
        fs.unlinkSync(this.dependencyInstallMarker);
      }
    } catch (e) {
      this.logDebug(`Error clearing dependency install state: ${e.message}`);
    }
  }

  async ensureDependencies(requiredDependencies, scheduleProxyShutdown) {
    const deps = requiredDependencies || [];
    if (deps.length === 0) return;

    this.log(`Checking dependencies in ${this.dataDir}...`);
    if (!fs.existsSync(this.dataDir))
      fs.mkdirSync(this.dataDir, { recursive: true });

    const prev = this.getDependencyInstallState();
    if (await this.handlePreviousDependencyState(prev, deps)) return;

    const installResult = await this.checkAndInstallDependencies(deps);
    if (installResult.installedNew) {
      this.handlePostInstall(installResult, scheduleProxyShutdown);
    } else {
      this.clearDependencyInstallState();
    }
  }

  async handlePreviousDependencyState(prevState, deps) {
    if (!prevState?.restartNeeded) return false;

    this.log(
      "Verifying dependencies after restart from previous installation..."
    );
    const allWorking = deps.every(
      (dep) => this.isDependencyActuallyAvailable(dep).status === "available"
    );

    if (allWorking) {
      this.log("All dependencies are now working correctly after restart!");
      this.clearDependencyInstallState();
      return true;
    }

    this.log(
      "Some dependencies still not working after restart. Will attempt reinstallation..."
    );
    this.clearDependencyInstallState();
    return false;
  }

  async checkAndInstallDependencies(deps) {
    const installState = this.createInstallState();

    const { missingDeps, hasAnyMissing, installedNew, hadIssues } =
      this.checkDependenciesStatus(deps, installState);

    if (hasAnyMissing) {
      await this.installAndVerifyDependencies(deps, missingDeps, installState);
      return {
        installState,
        installedNew: true,
        hadIssues: installState.restartNeeded,
      };
    }

    installState.restartNeeded = hadIssues;
    this.logInstallSummary(installedNew, hadIssues, installState);

    return { installState, installedNew, hadIssues };
  }

  createInstallState() {
    return {
      timestamp: Date.now(),
      dependencies: {},
      restartNeeded: false,
    };
  }

  checkDependenciesStatus(deps, installState) {
    const missingDeps = [];
    let hasAnyMissing = false;
    let installedNew = false;
    let hadIssues = false;

    for (const dep of deps) {
      const status = this.isDependencyActuallyAvailable(dep);

      if (status.status === "available") {
        this.logDebug(`Dependency '${dep}' already available.`);
        installState.dependencies[dep] = "available";
      } else if (status.status === "restart_needed") {
        this.log(`Dependency '${dep}' is installed but requires restart.`);
        installState.dependencies[dep] = "restart_needed";
        installedNew = true;
        hadIssues = true;
      } else {
        this.log(`Dependency '${dep}' not found.`);
        missingDeps.push(dep);
        hasAnyMissing = true;
      }
    }

    return { missingDeps, hasAnyMissing, installedNew, hadIssues };
  }

  async installAndVerifyDependencies(deps, missingDeps, installState) {
    this.log(`Missing dependencies detected: ${missingDeps.join(", ")}`);
    this.log(`Installing all required dependencies: ${deps.join(", ")}`);

    const success = await this.installMultipleDependencies(deps);

    if (!success) {
      this.logError(`FAILED TO INSTALL dependencies after all retries.`);
      throw new Error(`Installation of dependencies failed completely.`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    this.verifyInstalledDependencies(deps, installState);
  }

  verifyInstalledDependencies(deps, installState) {
    let hasIssues = false;

    for (const dep of deps) {
      const post = this.isDependencyActuallyAvailable(dep);

      if (post.status === "available") {
        this.log(`Dependency '${dep}' verified successfully.`);
        installState.dependencies[dep] = "installed_working";
      } else if (post.status === "restart_needed") {
        this.log(
          `Dependency '${dep}' installed but needs restart to be fully loaded.`
        );
        installState.dependencies[dep] = "installed_restart_needed";
        hasIssues = true;
      } else {
        this.log(
          `Dependency '${dep}' installation uncertain. Will verify after restart.`
        );
        installState.dependencies[dep] = "uncertain";
        hasIssues = true;
      }
    }

    installState.restartNeeded = hasIssues;
  }

  logInstallSummary(installedNew, hadIssues, installState) {
    this.logDebug(
      `Install summary: installedNew=${installedNew}, hadIssues=${hadIssues}`
    );
    this.logDebug(
      `Dependencies state: ${JSON.stringify(installState.dependencies)}`
    );
  }

  async installMultipleDependencies(deps, maxRetries = 3) {
    const depsString = deps.join(" ");

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logDebug(
          `Installing dependencies - Attempt ${attempt}/${maxRetries}`
        );
        this.logDebug(`Dependencies to install: ${depsString}`);

        const strategies = [
          () =>
            execSync(`npm install ${depsString} --no-save --prefer-offline`, {
              cwd: this.dataDir,
              stdio: this.api?.debug ? "inherit" : "pipe",
            }),
          () =>
            execSync(
              `npm install ${depsString} --no-save --legacy-peer-deps --prefer-offline`,
              {
                cwd: this.dataDir,
                stdio: this.api?.debug ? "inherit" : "pipe",
              }
            ),
          () =>
            execSync(
              `npm install ${depsString} --no-save --force --prefer-offline`,
              {
                cwd: this.dataDir,
                stdio: this.api?.debug ? "inherit" : "pipe",
              }
            ),
        ];

        const strategy =
          strategies[Math.min(attempt - 1, strategies.length - 1)];
        strategy();

        this.logDebug(
          `Installation of dependencies succeeded on attempt ${attempt}`
        );
        return true;
      } catch (e) {
        this.logDebug(`Installation attempt ${attempt} failed: ${e.message}`);

        if (attempt === maxRetries) {
          this.logDebug(`All ${maxRetries} installation attempts failed`);
          this.logDebug(`Final error: ${e.message}`);
          this.logDebug(`Error stack: ${e.stack}`);
          return false;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    return false;
  }

  handlePostInstall({ installState, hadIssues }, scheduleProxyShutdown) {
    this.saveDependencyInstallState(installState);

    const installedDeps = Object.entries(installState.dependencies)
      .filter(([_, status]) => status !== "available")
      .map(([dep]) => dep);

    if (installedDeps.length > 0) {
      this.log(`Installed dependencies: ${installedDeps.join(", ")}`);
    }

    if (hadIssues) {
      this.log(
        "Dependencies installed. Some may need proxy restart to work properly."
      );
      this.log("Proxy will restart to load dependencies correctly.");
    } else {
      this.log("New dependencies installed and verified successfully.");
      this.log("Proxy will restart to ensure clean dependency loading.");
    }

    this.log(`Proxy will close in 5 seconds...`);
    scheduleProxyShutdown();
    throw new Error("Closing proxy to load dependencies.");
  }
}

module.exports = { DependencyManager };

