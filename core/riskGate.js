export default class RiskGate {

  static evaluate(plan) { const injectionPatterns = ["ignore previous instructions","override security","execute arbitrary","system prompt"]; const lowerAnalysis = (plan.analysis || "").toLowerCase(); if (injectionPatterns.some(p => lowerAnalysis.includes(p))) { return { riskScore: 999, allowed: false }; }

    let riskScore = 0;

    const patchCount = plan.steps.filter(s => s.type === "PATCH_FILE").length;

    if (patchCount > 1) {
      return { riskScore: 999, allowed: false };
    }

    for (const step of plan.steps) {

      if (step.type === "PATCH_FILE") {
        riskScore += 10;
        if (step.target.includes("config")) riskScore += 20;
        if (step.target.includes("registry")) riskScore += 30;
      }

      if (step.type === "CONTEXT_ANALYSIS") {
        riskScore += 1;
      }
    }

    const allowed = riskScore <= 30;

    return { riskScore, allowed };
  }
}


