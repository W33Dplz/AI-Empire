import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

export class TestAgent {
  constructor({ missionId, sandboxPath, level = "LEVEL_1", logger }) {
    this.missionId = missionId;
    this.sandboxPath = sandboxPath;
    this.level = level;
    this.logger = logger;
  }

  async run() {
    const start = Date.now();

    const report = {
      mission_id: this.missionId,
      level: this.level,
      status: "PASS",
      build: "SKIPPED",
      typecheck: "SKIPPED",
      lint: "SKIPPED",
      duration_ms: 0,
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

    report.duration_ms = Date.now() - start;

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
      const { stdout } = await execAsync(`npm run ${scriptName}`, {
        cwd: this.sandboxPath
      });

      report[scriptName] = "OK";
      report.output = stdout;

    } catch (error) {
      report[scriptName] = "FAIL";
      report.error_output = error.stdout || error.stderr || error.message;
      throw new Error(`${scriptName} failed`);
    }
  }
}
