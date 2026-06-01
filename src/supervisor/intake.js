import fs from "node:fs";
import { randomUUID } from "node:crypto";
import SandboxManager from "../core/sandboxManager.js";

export async function createIntake({ repoPath, targetBranch, baselineBranch = "main", missionsRoot, adapter = "default" }) {
  if (!repoPath) throw new Error("repoPath is required");
  if (!targetBranch) throw new Error("targetBranch is required");
  if (!fs.existsSync(repoPath)) {
    throw new Error("E_NO_GIT: repo path does not exist: " + repoPath);
  }
  const id = randomUUID();
  const sandbox = new SandboxManager(id, { missionsRoot });
  sandbox.cloneProject(repoPath);
  return {
    id, repoPath, targetBranch, baselineBranch,
    status: "RUNNING",
    startedAt: new (Date)().toISOString(),
    sandboxPath: sandbox.getSandboxPath(),
    adapter,
    _sandboxManager: sandbox,
  };
}
