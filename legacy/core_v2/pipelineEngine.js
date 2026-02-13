import fs from "fs";
import path from "path";
import simpleGit from "simple-git";
import AuditLogger from "../../core/auditLogger.js";

const git = simpleGit();

export default class PipelineEngine {

  async execute(plan) {

    const currentBranch = (await git.branch()).current;
    const missionBranch = "mission-" + Date.now();

    AuditLogger.log("MISSION_START", { missionBranch });

    await git.checkoutLocalBranch(missionBranch);

    try {

      let hasRealPatch = false;

      for (const step of plan.steps) {

        if (step.type === "PATCH_FILE") {
          hasRealPatch = true;
          AuditLogger.log("PATCH_EXECUTION", { target: step.target });
          await this.patchFile(step.target, step.content);
        }
      }

      if (hasRealPatch) {
        await git.add(".");
        await git.commit("Mission isolated commit");
        AuditLogger.log("MISSION_COMMIT", { missionBranch });
      }

      await git.checkout(currentBranch);
      // mission branch preserved for persistence test

      AuditLogger.log("MISSION_CLEANED", { missionBranch });

    } catch (error) {

      AuditLogger.log("MISSION_ERROR", { error: error.message });

      await git.checkout(currentBranch);
      // mission branch preserved for persistence test
      await git.reset(["--hard"]);

      AuditLogger.log("ROLLBACK_COMPLETE");
    }
  }

  async patchFile(target, content) {

    if (!target.startsWith("sandbox/")) {
      throw new Error("Write outside sandbox forbidden");
    }

    if (!target.match(/\.js$|\.json$/)) {
      throw new Error("Invalid file extension");
    }

    const fullPath = path.resolve(target);
    const sandboxRoot = path.resolve("sandbox");

    if (!fullPath.startsWith(sandboxRoot)) {
      throw new Error("Path escape attempt detected");
    }

    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content, { encoding: "utf8" });
  }
}
