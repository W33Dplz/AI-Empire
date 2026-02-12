import path from "path";
import simpleGit from "simple-git";

export class AuditAgent {
  constructor({ missionId, sandboxPath, missionState, logger }) {
    this.missionId = missionId;
    this.sandboxPath = sandboxPath;
    this.missionState = missionState;
    this.logger = logger;
    this.git = simpleGit(this.sandboxPath);
  }

  async run() {
    const report = {
      mission_id: this.missionId,
      status: "PASS",
      checks: [],
      errors: []
    };

    try {
      this.#checkSandboxIsolation(report);
      await this.#checkGitIsolation(report);
      this.#checkMissionState(report);
    } catch (error) {
      report.status = "FAIL";
      report.errors.push(error.message);
    }

    return report;
  }

  #checkSandboxIsolation(report) {
    const normalized = path.resolve(this.sandboxPath);

    if (!normalized.includes(path.join("missions", this.missionId))) {
      throw new Error("Sandbox path not properly isolated");
    }

    report.checks.push("Sandbox path isolated");
  }

  async #checkGitIsolation(report) {
    const isRepo = await this.git.checkIsRepo();

    if (!isRepo) {
      throw new Error("Sandbox is not a git repository");
    }

    const branch = await this.git.branch();

    if (!branch.current.startsWith("mission-")) {
      throw new Error("Not on mission branch inside sandbox");
    }

    report.checks.push("Git repository isolated and on mission branch");
  }

  #checkMissionState(report) {
    const current = this.missionState.getCurrentState();

    if (current !== "AUDITING") {
      throw new Error("Mission not in AUDITING state during audit");
    }

    report.checks.push("Mission state valid for audit");
  }
}
