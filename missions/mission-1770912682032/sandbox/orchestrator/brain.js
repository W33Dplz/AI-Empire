import { validatePlan } from "./planSchema.js";
import MissionState from "./missionState.js";
import SandboxManager from "../core/sandboxManager.js";
import DevAgent from "../agents/devAgent.js";
import GitAgent from "../agents/gitAgent.js";
import { log } from "../core/logger.js";

class Brain {
  constructor() {}

  async executeMission(plan) {
    validatePlan(plan);

    const missionId = "mission-" + Date.now();
    const missionState = new MissionState(missionId);

    try {
      missionState.transitionTo("PLANNED");

      const sandboxManager = new SandboxManager(missionId);
      sandboxManager.cloneProject("./");

      const sandboxPath = sandboxManager.getSandboxPath();
      const devAgent = new DevAgent(sandboxManager);
      const gitAgent = new GitAgent(sandboxPath, missionId);

      await gitAgent.initializeRepository();
      await gitAgent.createMissionBranch();

      missionState.transitionTo("EXECUTING_DEV");

      for (const step of plan.steps) {
        await devAgent.execute(step);
      }

      missionState.transitionTo("BUILDING");

      await gitAgent.stageAll();

      missionState.transitionTo("TESTING");

      // Placeholder for future TestAgent

      missionState.transitionTo("AUDITING");

      // Placeholder for future AuditAgent

      missionState.transitionTo("READY_FOR_DECISION");

      await gitAgent.commit("Mission execution completed");

      missionState.transitionTo("COMMITTED");

      log("Mission completed successfully: " + missionId);

      return { missionId, status: "COMMITTED" };

    } catch (error) {
      log("Mission failed: " + error.message);

      try {
        missionState.transitionTo("FAILED");
      } catch {}

      return { missionId, status: "FAILED", error: error.message };
    }
  }
}

export default Brain;
