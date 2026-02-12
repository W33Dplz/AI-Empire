import fs from "fs";
import path from "path";
import { log } from "../core/logger.js";

class DevAgent {
  constructor(sandboxManager) {
    if (!sandboxManager) {
      throw new Error("SandboxManager instance required");
    }

    this.sandboxManager = sandboxManager;
  }

  async execute(step) {
    if (!step || !step.type) {
      throw new Error("Invalid step format");
    }

    switch (step.type) {
      case "PATCH_FILE":
        return this._patchFile(step);

      default:
        throw new Error("Unsupported step type: " + step.type);
    }
  }

  _patchFile(step) {
    if (!step.target || typeof step.content !== "string") {
      throw new Error("PATCH_FILE requires target and content");
    }

    const safePath = this.sandboxManager.resolveSafePath(step.target);

    const directory = path.dirname(safePath);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    fs.writeFileSync(safePath, step.content, "utf8");

    log("File patched in sandbox: " + step.target);

    return {
      status: "success",
      target: step.target
    };
  }
}

export default DevAgent;
