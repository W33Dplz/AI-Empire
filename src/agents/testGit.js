import SandboxManager from "../core/sandboxManager.js";
import GitAgent from "./gitAgent.js";

const missionId = "git-test";

const sandboxManager = new SandboxManager(missionId);
sandboxManager.cloneProject("./");

const sandboxPath = sandboxManager.getSandboxPath();

const gitAgent = new GitAgent(sandboxPath, missionId);

await gitAgent.initializeRepository();
await gitAgent.createMissionBranch();

console.log("Git agent ready.");
