import path from "path";

const SENSITIVE_FOLDERS = [
  "config",
  "env",
  "database",
  "schema"
];

const CRITICAL_EXTENSIONS = [
  ".env",
  ".json",
  ".ts",
  ".js"
];

export function calculateRisk(plan) {
  let score = 0;

  const steps = plan.steps || [];

  const targets = steps
    .filter(s => s.type === "PATCH_FILE")
    .map(s => s.target);

  // Rule 1: number of files
  score += targets.length;

  for (const file of targets) {
    const ext = path.extname(file);

    // Rule 2: critical extension
    if (CRITICAL_EXTENSIONS.includes(ext)) {
      score += 2;
    }

    // Rule 3: sensitive folder
    const normalized = file.replace(/\\\\/g, "/");
    const topFolder = normalized.split("/")[0];
    if (SENSITIVE_FOLDERS.includes(topFolder)) {
      score += 3;
    }
  }

  let level = "LEVEL_1";

  if (score >= 6) {
    level = "LEVEL_3";
  } else if (score >= 3) {
    level = "LEVEL_2";
  }

  return {
    score,
    level
  };
}

