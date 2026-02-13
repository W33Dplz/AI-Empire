import fs from "fs";
import path from "path";
import { log } from "./logger.js";

class PatchEngine {
  constructor() {
    this.sandboxPath = path.resolve("./sandbox");
    this.backups = new Map();

    if (!fs.existsSync(this.sandboxPath)) {
      fs.mkdirSync(this.sandboxPath, { recursive: true });
    }
  }

  resolveSafePath(target) {
    const fullPath = path.resolve(this.sandboxPath, target);

    if (!fullPath.startsWith(this.sandboxPath)) {
      throw new Error("Illegal path outside sandbox");
    }

    return fullPath;
  }

  apply(step) {
    const fullPath = this.resolveSafePath(step.target);

    if (fs.existsSync(fullPath)) {
      this.backups.set(fullPath, fs.readFileSync(fullPath, "utf-8"));
    }

    fs.writeFileSync(fullPath, step.content);
    log(`Patched: sandbox/${step.target}`);
  }

  revert(step) {
    const fullPath = this.resolveSafePath(step.target);

    if (this.backups.has(fullPath)) {
      fs.writeFileSync(fullPath, this.backups.get(fullPath));
      log(`Rollback restored: sandbox/${step.target}`);
    } else if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      log(`Rollback deleted: sandbox/${step.target}`);
    }
  }
}

export default PatchEngine;
