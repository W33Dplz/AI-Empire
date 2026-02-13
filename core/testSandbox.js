import SandboxManager from "./sandboxManager.js";

const sandbox = new SandboxManager("mission-sandbox-test");

// Cloner le projet AI-EMPIRE lui-même pour test
sandbox.cloneProject("./");

console.log("Sandbox path:", sandbox.getSandboxPath());
