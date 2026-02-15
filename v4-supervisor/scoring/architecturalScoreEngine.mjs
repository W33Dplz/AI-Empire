export function runArchitecturalScoreEngine(architecturalImpact, regressionGuard, auditResult, testResult) {

    if (!architecturalImpact || !regressionGuard || !auditResult || !testResult) {
        throw new Error("All inputs required for ArchitecturalScoreEngine");
    }

    let penalties = 0;
    const breakdown = {};

    // 1. Structural impact
    if (architecturalImpact.impactType === "STRUCTURAL") {
        if (architecturalImpact.scope === "GLOBAL") {
            penalties += 30;
            breakdown.structural = 30;
        } else {
            penalties += 20;
            breakdown.structural = 20;
        }
    } else if (architecturalImpact.impactType === "BEHAVIORAL") {
        penalties += 10;
        breakdown.structural = 10;
    } else {
        penalties += 5;
        breakdown.structural = 5;
    }

    // 2. Propagation
    const surface = architecturalImpact.propagationSurfaceScore;

    if (surface >= 8) {
        penalties += 25;
        breakdown.propagation = 25;
    } else if (surface >= 5) {
        penalties += 15;
        breakdown.propagation = 15;
    } else if (surface >= 3) {
        penalties += 8;
        breakdown.propagation = 8;
    } else {
        penalties += 3;
        breakdown.propagation = 3;
    }

    // 3. Regression guard
    if (regressionGuard.regressionGuardLevel === "CRITICAL") {
        penalties += 25;
        breakdown.regression = 25;
    } else if (regressionGuard.regressionGuardLevel === "HIGH") {
        penalties += 15;
        breakdown.regression = 15;
    } else {
        penalties += 8;
        breakdown.regression = 8;
    }

    // 4. Audit
    if (!auditResult.auditPassed) {
        penalties += 10;
        breakdown.audit = 10;
    }

    // 5. Test
    if (!testResult.testPassed) {
        penalties += 10;
        breakdown.test = 10;
    }

    const architecturalScore = Math.max(0, 100 - penalties);

    let decisionHint = "SAFE";

    if (architecturalScore <= 30) {
        decisionHint = "DANGEROUS";
    } else if (architecturalScore <= 60) {
        decisionHint = "REVIEW_REQUIRED";
    }

    return {
        architecturalScore,
        scoreBreakdown: breakdown,
        decisionHint
    };
}
