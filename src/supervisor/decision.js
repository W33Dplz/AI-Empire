/**
 * Supervisor decision matrix (v1).
 *
 * Inputs:
 *   - testsPassed: boolean
 *   - regressions: Array<{ severity: "low"|"medium"|"high", autoFixable?: boolean, ... }>
 *   - scopeDrift: object|null
 *   - score: number (0-100)
 *   - intent: string
 *
 * Output: { verdict: "PASS"|"FIX"|"REJECT", reasons: string[], score: number }
 */
export function decide({ testsPassed, regressions, scopeDrift, score, intent: _intent }) {
  const reasons = [];
  const regs = Array.isArray(regressions) ? regressions : [];
  const hasDrift = Boolean(scopeDrift);

  // Rule 1: tests/build failed -> REJECT
  if (!testsPassed) {
    reasons.push("tests or build failed");
    return { verdict: "REJECT", reasons, score };
  }

  // Rule 2: high-severity regression -> REJECT
  const highRegs = regs.filter((r) => r && r.severity === "high");
  if (highRegs.length > 0) {
    reasons.push(
      `high-severity regression detected (${highRegs.length}): ${highRegs
        .map((r) => r.kind || "unknown")
        .join(", ")}`
    );
    return { verdict: "REJECT", reasons, score };
  }

  const lowMedRegs = regs.filter(
    (r) => r && (r.severity === "low" || r.severity === "medium")
  );
  const autoFixableLowMed = lowMedRegs.filter((r) => r.autoFixable === true);

  // Rule 3: lowMed regressions + drift + score<60 -> FIX
  if (lowMedRegs.length > 0 && hasDrift && score < 60) {
    reasons.push("low/medium regressions with scope drift and score<60");
    return { verdict: "FIX", reasons, score };
  }

  // Rule 4: scope drift + score<70 -> FIX
  if (hasDrift && score < 70) {
    reasons.push("scope drift detected with moderate score");
    return { verdict: "FIX", reasons, score };
  }

  // Rule 5: autofixable low/medium regression + score>=70 + no drift -> FIX
  if (autoFixableLowMed.length > 0 && score >= 70 && !hasDrift) {
    reasons.push(
      `auto-fixable low/medium regression(s) present: ${autoFixableLowMed
        .map((r) => r.kind || "unknown")
        .join(", ")}`
    );
    return { verdict: "FIX", reasons, score };
  }

  // Rule 6: clean run -> PASS
  if (regs.length === 0 && !hasDrift && score >= 70) {
    reasons.push("tests green, no regressions, no scope drift, score>=70");
    return { verdict: "PASS", reasons, score };
  }

  // Rule 7: fallback -> FIX
  reasons.push("fallback: conditions did not meet PASS/REJECT criteria");
  return { verdict: "FIX", reasons, score };
}

export default { decide };
