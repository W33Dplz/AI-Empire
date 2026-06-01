import path from "node:path";
import os from "node:os";

export function getMissionsRoot(env) {
  const e = env || process.env;
  if (e.AI_EMPIRE_MISSIONS_ROOT) return path.resolve(e.AI_EMPIRE_MISSIONS_ROOT);
  return path.join(os.homedir(), ".ai-empire", "missions");
}

export function assertInsideSandbox(sandboxRoot, candidatePath) {
  const root = path.resolve(sandboxRoot);
  const resolved = path.resolve(candidatePath);
  const rel = path.relative(root, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error("Path escape detected: " + candidatePath + " not inside " + sandboxRoot);
  }
}

export function resolveInsideSandbox(sandboxRoot, relativePath) {
  const resolved = path.resolve(sandboxRoot, relativePath);
  assertInsideSandbox(sandboxRoot, resolved);
  return resolved;
}
