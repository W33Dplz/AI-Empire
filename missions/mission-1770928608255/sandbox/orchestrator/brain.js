import { validatePlan } from "./planSchema.js";
import MissionState from "./missionState.js";
import SandboxManager from "../core/sandboxManager.js";
import DevAgent from "../agents/devAgent.js";
import GitAgent from "../agents/gitAgent.js";
import { log } from "../core/logger.js";
import { TestAgent } from "../agents/testAgent.js";

class Brain {
  constructor() {
    this.pendingMissions = new Map();
  }

  async executeMission(plan) {
    const missionId = "mission-" + Date.now();
    const missionState = new MissionState(missionId);

    let gitAgent = null;
    let sandboxManager = null;
    let commitPerformed = false;

    try {
      missionState.transitionTo("PLANNED");

      validatePlan(plan);

      sandboxManager = new SandboxManager(missionId);
      sandboxManager.cloneProject("./");

      const sandboxPath = sandboxManager.getSandboxPath();
      const devAgent = new DevAgent(sandboxManager);
      gitAgent = new GitAgent(sandboxPath, missionId);

      await gitAgent.initializeRepository();
      await gitAgent.createMissionBranch();

      missionState.transitionTo("EXECUTING_DEV");

      for (const step of plan.steps) {
        await devAgent.execute(step);
      }

      missionState.transitionTo("BUILDING");

      await gitAgent.stageAll();

      missionState.transitionTo("TESTING");

      const testAgent = new TestAgent({
        missionId,
        sandboxPath,
        logger: { log }
      });

      const testReport = await testAgent.run();

      log("Test Report: " + JSON.stringify(testReport));

      if (testReport.status === "FAIL") {
        throw new Error("TestAgent failed");
      }

      missionState.transitionTo("AUDITING");
      missionState.transitionTo("READY_FOR_DECISION");

      this.pendingMissions.set(missionId, {
        gitAgent,
        missionState,
        sandboxPath,
        commitPerformed: false
      });

      log("Mission ready for decision: " + missionId);

      return {
        missionId,
        status: "READY_FOR_DECISION",
        sandboxPath
      };

    } catch (error) {
      log("Mission error: " + error.message);

      try {
        if (commitPerformed && gitAgent) {
          await gitAgent.revertLastCommit();
          missionState.transitionTo("ROLLED_BACK");
          return {
            missionId,
            status: "ROLLED_BACK",
            error: error.message
          };
        } else {
          missionState.transitionTo("FAILED");
          return {
            missionId,
            status: "FAILED",
            error: error.message
          };
        }
      } catch (rollbackError) {
        log("Rollback failure: " + rollbackError.message);
        return {
          missionId,
          status: "CRITICAL_FAILURE",
          error: rollbackError.message
        };
      }
    }
    }

  async approveMission(missionId) {
    const mission = this.pendingMissions.get(missionId);

    if (!mission) {
      throw new Error("Mission not found or not pending");
    }

    if (mission.missionState.getState() !== "READY_FOR_DECISION") {
      throw new Error("Mission not in READY_FOR_DECISION state");
    }

    await mission.gitAgent.commit("Mission approved and committed");
    mission.missionState.transitionTo("COMMITTED");

    this.pendingMissions.delete(missionId);

    return { missionId, status: "COMMITTED" };
  }

  async rejectMission(missionId) {
    const mission = this.pendingMissions.get(missionId);

    if (!mission) {
      throw new Error("Mission not found or not pending");
    }

    await mission.gitAgent.revertLastCommit();
    mission.missionState.transitionTo("ROLLED_BACK");

    this.pendingMissions.delete(missionId);

    return { missionId, status: "ROLLED_BACK" };
  }
}

export default Brain;






