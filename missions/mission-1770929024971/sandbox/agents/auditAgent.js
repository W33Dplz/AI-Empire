import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export class AuditAgent {
  constructor({ missionId, sandboxPath, missionState, logger }) {
    this.missionId = missionId;
    this.sandboxPath = sandboxPath;
    this.missionState = missionState;
    this.logger = logger;
  }

  async run() {
    const report = {
      mission_id: this.missionId,
      status: "PASS",
      checks: [],
      errors: []
    };

    try {
      this.#checkSandboxExists(report);
      this.#checkSandboxIsolation(report);
      this.#checkGitIsolation(report);
      this.#checkMissionState(report);
    } catch (error) {
      report.status = "FAIL";
      report.errors.push(error.message);
    }

    return report;
  }

  #checkSandboxExists(report) {
    if (!fs.existsSync(this.sandboxPath)) {
      throw new Error("Sandbox does not exist");
    }
    report.checks.push("Sandbox exists");
  }

  #checkSandboxIsolation(report) {
    const normalized = path.resolve(this.sandboxPath);

    if (!normalized.includes(path.join("missions", this.missionId))) {
      throw new Error("Sandbox path not properly isolated");
    }

    report.checks.push("Sandbox path isolated");
  }

  #checkGitIsolation(report) {
    const gitPath = path.join(this.sandboxPath, ".git");

    if (!fs.existsSync(gitPath)) {
      throw new Error("Sandbox git repository missing");
    }

    const branch = execSync("git branch --show-current", {
      cwd: this.sandboxPath
    }).toString().trim();

    if (!branch.startsWith("mission-")) {
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
