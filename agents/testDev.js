import SandboxManager from "../core/sandboxManager.js";
import DevAgent from "./devAgent.js";

const missionId = "dev-test";

const sandboxManager = new SandboxManager(missionId);
sandboxManager.cloneProject("./");

const devAgent = new DevAgent(sandboxManager);

await devAgent.execute({
  type: "PATCH_FILE",
  target: "test-output/hello.txt",
  content: "Hello AI-EMPIRE V3"
});

console.log("DevAgent patch complete.");
