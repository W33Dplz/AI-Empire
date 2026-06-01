import fs from "node:fs";
import path from "node:path";
import { getMissionsRoot, assertInsideSandbox } from "../lib/paths.js";

const EXCLUDED_FOLDERS = ["missions", "node_modules", "legacy", "logs", ".git"];

export default class SandboxManager {
  constructor(missionId, opts = {}) {
    if (!missionId) throw new Error("Mission ID is required");
    this.missionId = missionId;
    this.missionsRoot = opts.missionsRoot ? path.resolve(opts.missionsRoot) : getMissionsRoot();
    this.missionPath = path.join(this.missionsRoot, missionId);
    this.sandboxPath = path.join(this.missionPath, "sandbox");
    this.markerPath = path.join(this.missionPath, ".ai-empire-mission.json");
    this._ensureDirectories();
  }

  _ensureDirectories() {
    fs.mkdirSync(this.missionsRoot, { recursive: true });
    fs.mkdirSync(this.missionPath, { recursive: true });
    if (fs.existsSync(this.sandboxPath) && fs.existsSync(this.markerPath)) {
      const err = new Error("E_SANDBOX_BUSY: mission " + this.missionId + " already has a sandbox");
      err.code = "E_SANDBOX_BUSY";
      throw err;
    }
    if (fs.existsSync(this.sandboxPath)) {
      fs.rmSync(this.sandboxPath, { recursive: true, force: true });
    }
    fs.mkdirSync(this.sandboxPath, { recursive: true });
    fs.writeFileSync(this.markerPath, JSON.stringify({ missionId: this.missionId }));
  }

  cloneProject(projectPath) {
    const resolved = path.resolve(projectPath);
    if (!fs.existsSync(resolved)) throw new Error("Project path does not exist");
    this._copyRecursive(resolved, this.sandboxPath);
  }

  resolveSafePath(relativePath) {
    const candidate = path.resolve(this.sandboxPath, relativePath);
    assertInsideSandbox(this.sandboxPath, candidate);
    return candidate;
  }

  getSandboxPath() { return this.sandboxPath; }

  cleanup() {
    if (fs.existsSync(this.missionPath)) {
      fs.rmSync(this.missionPath, { recursive: true, force: true });
    }
  }

  _copyRecursive(src, dest) {
    const stats = fs.statSync(src);
    const baseName = path.basename(src);
    if (EXCLUDED_FOLDERS.includes(baseName)) return;
    if (stats.isDirectory()) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      for (const entry of fs.readdirSync(src)) {
        this._copyRecursive(path.join(src, entry), path.join(dest, entry));
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}
