import fs from "fs";
import path from "path";
import simpleGit from "simple-git";

const git = simpleGit();

export default class PipelineEngine {

  async execute(plan) {

    const currentBranch = (await git.branch()).current;
    const missionBranch = "mission-" + Date.now();

    await git.checkoutLocalBranch(missionBranch);

    try {

      let hasRealPatch = false;

      for (const step of plan.steps) {

        if (step.type === "PATCH_FILE") {
          hasRealPatch = true;
          await this.patchFile(step.target, step.content);
        }
      }

      if (hasRealPatch) {
        await git.add(".");
        await git.commit("Mission isolated commit");
      }

      await git.checkout(currentBranch);
      await git.branch(["-D", missionBranch]);

      console.log("Mission completed and cleaned:", missionBranch);

    } catch (error) {

      console.log("ERROR detected. Rolling back mission:", missionBranch);

      await git.checkout(currentBranch);
      await git.branch(["-D", missionBranch]);
      await git.reset(["--hard"]);

      console.log("Rollback complete.");

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
