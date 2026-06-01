import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { createIntake } from "./intake.js";
import { classifyIntent } from "./intent.js";
import { decide } from "./decision.js";
import { renderReport } from "../lib/report.js";

const SKIP_DIRS = new Set(["node_modules", ".git"]);

function diffFiles(sandboxPath) {
  const modified = [];
  function walk(dir, rel) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      const relPath = rel ? path.posix.join(rel, entry.name) : entry.name;
      if (entry.isDirectory()) {
        walk(full, relPath);
      } else if (entry.isFile()) {
        modified.push(relPath);
      }
    }
  }
  walk(sandboxPath, "");
  return { added: [], modified, deleted: [] };
}

function runTests(sandboxPath) {
  const pkgPath = path.join(sandboxPath, "package.json");
  if (!fs.existsSync(pkgPath)) {
    return { passed: false, reason: "missing package.json" };
  }
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  } catch (err) {
    return { passed: false, reason: "invalid package.json", output: err.message };
  }
  if (!pkg.scripts || !pkg.scripts.test) {
    return { passed: true, reason: "no test script" };
  }
  try {
    const output = execSync("npm test --silent", {
      cwd: sandboxPath,
      timeout: 60000,
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
    });
    return { passed: true, output };
  } catch (err) {
    const out = `${err.stdout || ""}${err.stderr || ""}`;
    return { passed: false, reason: "test failure", output: out };
  }
}

export async function supervise(opts = {}) {
  const {
    repo,
    branch,
    baseline = "main",
    missionsRoot,
    adapter = "default",
    reportPath,
    maxFixAttempts = 1,
    // dryRun reserved for future write-back gating
    // eslint-disable-next-line no-unused-vars
    dryRun = false,
  } = opts;

  if (!repo) throw new Error("repo is required");
  if (!branch) throw new Error("branch is required");

  const executionLog = [];

  // 1. Intake
  const mission = await createIntake({
    repoPath: repo,
    targetBranch: branch,
    baselineBranch: baseline,
    missionsRoot,
    adapter,
  });
  executionLog.push(`intake: mission ${mission.id} sandbox=${mission.sandboxPath}`);

  // 2. Diff files
  const files = diffFiles(mission.sandboxPath);
  executionLog.push(`diff: ${files.modified.length} files in sandbox`);

  // 3. Intent
  const intentResult = classifyIntent({ files, commitMessages: [] });
  executionLog.push(`intent: ${intentResult.intent} (${intentResult.confidence})`);

  // 4. Tests
  let testResult = runTests(mission.sandboxPath);
  executionLog.push(`tests: passed=${testResult.passed}${testResult.reason ? " reason=" + testResult.reason : ""}`);

  // 5. Fix loop
  const appliedFixes = [];
  for (let attempt = 1; attempt <= maxFixAttempts && !testResult.passed; attempt += 1) {
    const note = `attempt #${attempt}: no auto-fix available in MVP`;
    appliedFixes.push(note);
    executionLog.push(note);
    testResult = runTests(mission.sandboxPath);
    executionLog.push(`tests retry: passed=${testResult.passed}${testResult.reason ? " reason=" + testResult.reason : ""}`);
  }

  // 6. Regressions
  const regressions = [];
  if (!testResult.passed && testResult.reason === "invalid package.json") {
    regressions.push({
      kind: "other",
      severity: "high",
      file: "package.json",
      description: "invalid JSON in package.json",
      autoFixable: false,
    });
  } else if (!testResult.passed) {
    regressions.push({
      kind: "test_newly_failing",
      severity: "medium",
      file: "(test output)",
      description: testResult.reason || "tests failed",
      autoFixable: false,
    });
  }

  // 7. Score
  const hasRegressions = regressions.length > 0;
  const scopeDrift = null;
  const hasScopeDrift = Boolean(scopeDrift);
  let score = 100
    - (testResult.passed ? 0 : 50)
    - (hasRegressions ? 20 : 0)
    - (hasScopeDrift ? 15 : 0);
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  // 8. Decision
  const decision = decide({
    testsPassed: testResult.passed,
    regressions,
    scopeDrift,
    score,
    intent: intentResult.intent,
  });

  // Enrich reasons with concrete test-failure detail so callers can
  // discriminate REJECT root causes (missing/invalid package.json vs test failure).
  if (!testResult.passed && testResult.reason) {
    decision.reasons.push(`test phase: ${testResult.reason}`);
    if (testResult.reason === "invalid package.json") {
      decision.reasons.push("invalid JSON in package.json");
    }
  }

  // 9. Report path
  const finalReportPath = path.resolve(
    reportPath || path.join(mission.sandboxPath, "..", "report.md")
  );

  const verdict = {
    verdict: decision.verdict,
    score,
    reasons: decision.reasons,
    regressions,
    scopeDrift,
    intent: intentResult.intent,
    appliedFixes,
    reportPath: finalReportPath,
  };

  // 10. Write markdown
  const markdown = renderReport({
    mission,
    verdict,
    plan: null,
    executionLog,
  });
  fs.mkdirSync(path.dirname(finalReportPath), { recursive: true });
  fs.writeFileSync(finalReportPath, markdown, "utf8");

  return verdict;
}

export default { supervise };
