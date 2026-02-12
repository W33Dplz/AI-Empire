import SandboxManager from "../core/sandboxManager.js";
import DevAgent from "../agents/devAgent.js";
import GitAgent from "../agents/gitAgent.js";

const missionId = "pipeline-test";

const sandboxManager = new SandboxManager(missionId);
sandboxManager.cloneProject("./");

const sandboxPath = sandboxManager.getSandboxPath();

const devAgent = new DevAgent(sandboxManager);
const gitAgent = new GitAgent(sandboxPath, missionId);

await gitAgent.initializeRepository();
await gitAgent.createMissionBranch();

await devAgent.execute({
  type: "PATCH_FILE",
  target: "integration/test.txt",
  content: "Full pipeline validation V3"
});

await gitAgent.stageAll();
await gitAgent.commit("DevAgent patch applied");

console.log("Pipeline test completed successfully.");
