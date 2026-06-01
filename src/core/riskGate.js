import path from "node:path";
import { assertInsideSandbox } from "../lib/paths.js";

export default class RiskGate {
  static evaluate(plan, opts = {}) {
    const sandboxRoot = opts.sandboxRoot || null;
    const reasons = [];

    const injection = ["ignore previous instructions", "override security", "execute arbitrary", "system prompt"];
    const lower = (plan && plan.analysis ? plan.analysis : "").toLowerCase();
    if (injection.some((p) => lower.includes(p))) {
      return { riskScore: 999, allowed: false, reasons: ["prompt injection pattern in analysis"] };
    }

    const steps = Array.isArray(plan && plan.steps) ? plan.steps : [];
    const patchCount = steps.filter((s) => s.type === "PATCH_FILE").length;
    if (patchCount > 1) {
      return { riskScore: 999, allowed: false, reasons: ["plan has more than one PATCH_FILE step"] };
    }

    let riskScore = 0;
    for (const step of steps) {
      if (step.type === "PATCH_FILE") {
        riskScore += 10;
        const size = Buffer.byteLength(step.content == null ? "" : step.content, "utf8");
        if (size > 256 * 1024) {
          reasons.push("oversize PATCH_FILE content (" + size + " bytes > 262144)");
          return { riskScore: 999, allowed: false, reasons };
        }
        if (sandboxRoot) {
          try {
            const candidate = path.resolve(sandboxRoot, step.target || "");
            assertInsideSandbox(sandboxRoot, candidate);
          } catch (e) {
            reasons.push("path escape: " + e.message);
            return { riskScore: 999, allowed: false, reasons };
          }
        }
        const t = step.target || "";
        if (t.includes("config")) riskScore += 20;
        if (t.includes("registry")) riskScore += 30;
      }
      if (step.type === "CONTEXT_ANALYSIS") riskScore += 1;
    }

    const allowed = riskScore <= 30;
    if (!allowed) reasons.push("risk score " + riskScore + " exceeds 30");
    return { riskScore, allowed, reasons };
  }
}
