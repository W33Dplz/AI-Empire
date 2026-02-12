import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

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
      build: "SKIPPED",
      typecheck: "SKIPPED",
      lint: "SKIPPED",
      errors: []
    };

    try {
      const scripts = this.#getAvailableScripts();

      if (scripts.includes("build")) {
        await this.#runCommand("build", report);
      }

      if (scripts.includes("typecheck")) {
        await this.#runCommand("typecheck", report);
      }

      if (scripts.includes("lint")) {
        await this.#runCommand("lint", report);
      }

    } catch (error) {
      report.status = "FAIL";
      report.errors.push(error.message);
    }

    return report;
  }

  #getAvailableScripts() {
    const packagePath = path.join(this.sandboxPath, "package.json");

    if (!fs.existsSync(packagePath)) {
      return [];
    }

    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    return pkg.scripts ? Object.keys(pkg.scripts) : [];
  }

  async #runCommand(scriptName, report) {
    try {
      await execAsync(`npm run ${scriptName}`, {
        cwd: this.sandboxPath
      });

      report[scriptName] = "OK";
    } catch (error) {
      report[scriptName] = "FAIL";
      throw new Error(`${scriptName} failed`);
    }
  }
}
