import path from "path";
import simpleGit from "simple-git";

const FORBIDDEN_PATHS = [
  "orchestrator",
  "core",
  "agents",
  "manifest",
  ".git"
];

export class AuditAgent {
  constructor({ missionId, sandboxPath, missionState, plan, logger }) {
    this.missionId = missionId;
    this.sandboxPath = sandboxPath;
    this.missionState = missionState;
    this.plan = plan;
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
      await this.#checkDiffIntegrity(report);
      await this.#checkPlanCoherence(report);
      this.#checkMissionState(report);
    } catch (error) {
      report.status = "FAIL";
      report.errors.push(error.message);
    }

    return report;
  }

  #checkSandboxIsolation(report) {
    const normalized = path.resolve(this.sandboxPath);

    const expectedRoot = path.resolve("C:/AI-EMPIRE-MISSIONS");

    if (!normalized.startsWith(expectedRoot)) {
      throw new Error("Sandbox path not inside AI-EMPIRE-MISSIONS root");
    }

    if (!normalized.includes(this.missionId)) {
      throw new Error("Sandbox path missing missionId");
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

  async #checkDiffIntegrity(report) {
    const status = await this.git.status();

    const changedFiles = [
      ...status.created,
      ...status.modified,
      ...status.deleted,
      ...status.renamed.map(r => r.to)
    ];

    for (const file of changedFiles) {
      const topFolder = file.split(path.sep)[0];

      if (FORBIDDEN_PATHS.includes(topFolder)) {
        throw new Error(
          "Forbidden modification detected: " + file
        );
      }
    }

    report.checks.push("Diff integrity validated");
  }

  async #checkPlanCoherence(report) {
    const status = await this.git.status();

    const changedFiles = [
      ...status.created,
      ...status.modified,
      ...status.deleted,
      ...status.renamed.map(r => r.to)
    ];

    const plannedTargets = (this.plan.steps || [])
      .filter(step => step.type === "PATCH_FILE")
      .map(step => step.target);

    for (const file of changedFiles) {
      if (!plannedTargets.includes(file)) {
        throw new Error(
          "File modified outside plan scope: " + file
        );
      }
    }

    report.checks.push("Plan vs diff coherence validated");
  }

  #checkMissionState(report) {
    const current = this.missionState.getCurrentState();

    if (current !== "AUDITING") {
      throw new Error("Mission not in AUDITING state during audit");
    }

    report.checks.push("Mission state valid for audit");
  }
}

