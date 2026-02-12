import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class TestAgent {
  constructor({ missionId, sandboxPath, logger }) {
    this.missionId = missionId;
    this.sandboxPath = sandboxPath;
    this.logger = logger;
  }

  async run() {
    const report = {
      mission_id: this.missionId,
      level: "LEVEL_1",
      status: "PASS",
      build: null,
      typecheck: null,
      lint: null,
      errors: []
    };

    try {
      await this.#runBuild(report);
      await this.#runTypeCheck(report);
      await this.#runLint(report);
    } catch (error) {
      report.status = "FAIL";
      report.errors.push(error.message);
    }

    return report;
  }

  async #runBuild(report) {
    try {
      await execAsync("npm run build", {
        cwd: this.sandboxPath
      });
      report.build = "OK";
    } catch (error) {
      report.build = "FAIL";
      throw new Error("Build failed");
    }
  }

  async #runTypeCheck(report) {
    try {
      await execAsync("npm run typecheck", {
        cwd: this.sandboxPath
      });
      report.typecheck = "OK";
    } catch (error) {
      report.typecheck = "FAIL";
      throw new Error("Typecheck failed");
    }
  }

  async #runLint(report) {
    try {
      await execAsync("npm run lint", {
        cwd: this.sandboxPath
      });
      report.lint = "OK";
    } catch (error) {
      report.lint = "FAIL";
      throw new Error("Lint failed");
    }
  }
}
