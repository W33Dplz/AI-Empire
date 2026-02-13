import fs from "fs";
import path from "path";
import simpleGit from "simple-git";

const git = simpleGit();

export default class PipelineEngine {

  async execute(plan) {
    console.log(`[${new Date().toISOString()}] === SAFE PIPELINE START ===`);

    for (const step of plan.steps) {

      if (step.type === "NO_OP") {
        console.log("NO_OP executed.");
        continue;
      }

      if (step.type === "CONTEXT_ANALYSIS") {
        console.log("CONTEXT_ANALYSIS executed.");
        continue;
      }

      if (step.type === "PATCH_FILE") {
        await this.patchFile(step.target, step.content);
      }
    }

    await git.add(".");
    await git.commit("Sandbox-safe mission commit");

    console.log(`[${new Date().toISOString()}] === SAFE PIPELINE SUCCESS ===`);
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

    console.log("Patched:", target);
  }
}
