import simpleGit from "simple-git";
import path from "path";
import { log } from "../core/logger.js";

class GitAgent {
  constructor(sandboxPath, missionId) {
    if (!sandboxPath || !missionId) {
      throw new Error("sandboxPath and missionId are required");
    }

    this.sandboxPath = path.resolve(sandboxPath);
    this.missionId = missionId;
    this.branchName = "mission-" + missionId;

    this.git = simpleGit({
      baseDir: this.sandboxPath,
      binary: "git",
      maxConcurrentProcesses: 1,
    });
  }

  async initializeRepository() {
    const isRepo = await this.git.checkIsRepo();

    if (!isRepo) {
      await this.git.init();
      await this.git.checkoutLocalBranch("main");
      await this.git.add(".");
      await this.git.commit("Initial commit");

      log("Git repository initialized in sandbox");
    }
  }

  async createMissionBranch() {
    await this.git.checkoutLocalBranch(this.branchName);
    log("Mission branch created: " + this.branchName);
  }

  async stageAll() {
    await this.git.add(".");
    log("All changes staged");
  }

  async commit(message) {
    if (!message) {
      throw new Error("Commit message required");
    }

    await this.git.commit("[MISSION " + this.missionId + "] " + message);
    log("Commit created for mission " + this.missionId);
  }

  async getStatus() {
    return await this.git.status();
  }

  async revertLastCommit() {
    const logSummary = await this.git.log();
    if (logSummary.total === 0) {
      log("No commit to revert");
      return;
    }

    const lastHash = logSummary.latest.hash;
    await this.git.raw(["revert", "--no-edit", lastHash]);

    log("Last commit reverted safely");
  }
}

export default GitAgent;
