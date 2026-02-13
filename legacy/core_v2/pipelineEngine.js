import { log } from "./logger.js";
import { loadProjectContext } from "./contextEngine.js";
import PatchEngine from "./patchEngine.js";
import GitEngine from "./gitEngine.js";

class PipelineEngine {
  constructor() {
    this.patchEngine = new PatchEngine();
    this.gitEngine = new GitEngine();

    this.handlers = {
      CONTEXT_ANALYSIS: this.handleContext.bind(this),
      PATCH_FILE: this.handlePatch.bind(this),
      NO_OP: this.handleNoOp.bind(this)
    };

    this.executedSteps = [];
  }

  async execute(plan) {
    log("=== SAFE PIPELINE START ===");

    try {
      await this.gitEngine.ensureInitialized();

      for (const step of plan.steps) {
        await this.executeStep(step);
        this.executedSteps.push(step);
      }

      await this.gitEngine.commit("Mission success");

      log("=== SAFE PIPELINE SUCCESS ===");

    } catch (err) {
      log(`ERROR: ${err.message}`);
      await this.rollback();
      log("=== SAFE PIPELINE ROLLBACK COMPLETE ===");
    }
  }

  async executeStep(step) {
    if (!this.handlers[step.type]) {
      throw new Error(`Unauthorized step type: ${step.type}`);
    }

    await this.handlers[step.type](step);
  }

  async rollback() {
    for (const step of this.executedSteps.reverse()) {
      if (step.type === "PATCH_FILE") {
        this.patchEngine.revert(step);
      }
    }

    this.executedSteps = [];
  }

  async handleContext() {
    const context = loadProjectContext();
    log(JSON.stringify(context, null, 2));
  }

  async handlePatch(step) {
    this.patchEngine.apply(step);
  }

  async handleNoOp() {
    log("NO_OP executed.");
  }
}

export default PipelineEngine;
