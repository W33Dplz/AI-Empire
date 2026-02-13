import simpleGit from "simple-git";
import { log } from "./logger.js";

class GitEngine {
  constructor() {
    this.git = simpleGit(process.cwd());
  }

  async ensureInitialized() {
    const isRepo = await this.git.checkIsRepo();
    if (!isRepo) {
      await this.git.init();
      await this.git.add(".");
      await this.git.commit("Initial safe commit");
      log("Git initialized with initial commit.");
    }
  }

  async commit(message) {
    await this.git.add(".");
    await this.git.commit(message);
    log("Commit created.");
  }
}

export default GitEngine;
