import fs from "fs";
import path from "path";
import { log } from "./logger.js";

const MISSIONS_ROOT = path.resolve("C:/AI-EMPIRE-MISSIONS");

const EXCLUDED_FOLDERS = [
  "missions",
  "node_modules",
  "legacy",
  "logs",
  ".git"
];

class SandboxManager {
  constructor(missionId) {
    if (!missionId) {
      throw new Error("Mission ID is required");
    }

    this.missionId = missionId;
    this.missionPath = path.join(MISSIONS_ROOT, missionId);
    this.sandboxPath = path.join(this.missionPath, "sandbox");

    this._ensureDirectories();
  }

  _ensureDirectories() {
    if (!fs.existsSync(MISSIONS_ROOT)) {
      fs.mkdirSync(MISSIONS_ROOT, { recursive: true });
    }

    if (!fs.existsSync(this.missionPath)) {
      fs.mkdirSync(this.missionPath, { recursive: true });
    }

    if (fs.existsSync(this.sandboxPath)) {
      fs.rmSync(this.sandboxPath, { recursive: true, force: true });
    }

    fs.mkdirSync(this.sandboxPath, { recursive: true });
    log("Sandbox created for mission " + this.missionId);
  }

  cloneProject(projectPath) {
    const resolvedProjectPath = path.resolve(projectPath);

    if (!fs.existsSync(resolvedProjectPath)) {
      throw new Error("Project path does not exist");
    }

    this._copyRecursive(resolvedProjectPath, this.sandboxPath);

    log("Project safely cloned into sandbox for mission " + this.missionId);
  }

  resolveSafePath(relativePath) {
    const fullPath = path.resolve(this.sandboxPath, relativePath);

    if (!fullPath.startsWith(this.sandboxPath)) {
      throw new Error("Attempt to access outside sandbox");
    }

    return fullPath;
  }

  getSandboxPath() {
    return this.sandboxPath;
  }

  _copyRecursive(src, dest) {
    const stats = fs.statSync(src);
    const baseName = path.basename(src);

    if (EXCLUDED_FOLDERS.includes(baseName)) {
      return;
    }

    if (stats.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      const entries = fs.readdirSync(src);

      for (const entry of entries) {
        const srcPath = path.join(src, entry);
        const destPath = path.join(dest, entry);

        this._copyRecursive(srcPath, destPath);
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

export default SandboxManager;


