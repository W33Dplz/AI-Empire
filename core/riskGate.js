export default class RiskGate {

  static evaluate(plan) {

    let riskScore = 0;

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

    return {
      riskScore,
      allowed
    };
  }
}

// HARDENING: Block multiple PATCH_FILE steps

if (plan.steps.filter(s => s.type === 'PATCH_FILE').length > 1) { return { riskScore: 999, allowed: false }; }
