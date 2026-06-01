/**
 * Markdown report renderer for AI-EMPIRE supervisor.
 *
 * renderReport({ mission, verdict, plan, executionLog }) -> markdown string.
 */

function fmtList(items) {
  return items.map((i) => `- ${i}`).join("\n");
}

export function renderReport({ mission, verdict, plan, executionLog } = {}) {
  const lines = [];
  lines.push("# AI-EMPIRE Supervision Report");
  lines.push("");

  if (mission) {
    if (mission.id) lines.push(`- Mission: ${mission.id}`);
    if (mission.repoPath) lines.push(`- Repository: ${mission.repoPath}`);
    if (mission.targetBranch) lines.push(`- Target branch: ${mission.targetBranch}`);
    if (mission.adapter) lines.push(`- Adapter: ${mission.adapter}`);
    if (mission.startedAt) lines.push(`- Started: ${mission.startedAt}`);
    lines.push("");
  }

  if (verdict) {
    lines.push(`## Verdict: **${verdict.verdict}**`);
    lines.push("");
    if (typeof verdict.score === "number") lines.push(`- Score: ${verdict.score}`);
    if (verdict.intent) lines.push(`- Intent: ${verdict.intent}`);
    lines.push("");

    const reasons = Array.isArray(verdict.reasons) ? verdict.reasons : [];
    if (reasons.length > 0) {
      lines.push("## Reasons");
      lines.push("");
      lines.push(fmtList(reasons));
      lines.push("");
    }

    const regressions = Array.isArray(verdict.regressions) ? verdict.regressions : [];
    if (regressions.length > 0) {
      lines.push("## Regressions");
      lines.push("");
      for (const r of regressions) {
        lines.push(
          `- [${r.severity || "?"}] ${r.kind || "unknown"} — ${r.file || "?"}: ${r.description || ""}`
        );
      }
      lines.push("");
    }

    if (verdict.scopeDrift) {
      const d = verdict.scopeDrift;
      lines.push("## Scope drift");
      lines.push("");
      lines.push(`- Declared intent: ${d.declaredIntent || ""}`);
      lines.push(`- Actual impact: ${d.actualImpact || ""}`);
      if (typeof d.divergence === "number") lines.push(`- Divergence: ${d.divergence}`);
      if (Array.isArray(d.evidence) && d.evidence.length > 0) {
        lines.push("- Evidence:");
        for (const ev of d.evidence) lines.push(`  - ${ev}`);
      }
      lines.push("");
    }

    const fixes = Array.isArray(verdict.appliedFixes) ? verdict.appliedFixes : [];
    if (fixes.length > 0) {
      lines.push("## Applied fixes");
      lines.push("");
      lines.push(fmtList(fixes));
      lines.push("");
    }
  }

  const log = Array.isArray(executionLog) ? executionLog : [];
  if (log.length > 0) {
    lines.push("## Execution log");
    lines.push("");
    lines.push(fmtList(log));
    lines.push("");
  }

  // plan currently informational; skipped if absent
  if (plan && Array.isArray(plan.steps) && plan.steps.length > 0) {
    lines.push("## Plan");
    lines.push("");
    for (const step of plan.steps) {
      lines.push(`- ${step.id || "?"} [${step.type || "?"}] ${step.target || ""}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export default renderReport;
