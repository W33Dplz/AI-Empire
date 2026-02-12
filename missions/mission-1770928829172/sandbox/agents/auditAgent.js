import fs from "fs";
import path from "path";

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
      this.#checkStateFileExists(report);
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

  #checkStateFileExists(report) {
    const stateFile = path.join(
      path.dirname(this.sandboxPath),
      "state.json"
    );

    if (!fs.existsSync(stateFile)) {
      throw new Error("state.json missing");
    }

    report.checks.push("State file exists");
  }

  #checkMissionState(report) {
    const current = this.missionState.getCurrentState();

    if (current !== "READY_FOR_DECISION") {
      throw new Error(
        "Mission not in READY_FOR_DECISION state during audit"
      );
    }

    report.checks.push("Mission state valid for approval");
  }
}
