export function runArchitecturalScoreEngine(
    architecturalImpact,
    regressionGuard,
    audit,
    test,
    featureRegistry
) {

    let structuralScore =
        architecturalImpact.architecturalRiskLevel === "HIGH" ? 30 :
        architecturalImpact.architecturalRiskLevel === "MEDIUM" ? 20 :
        10;

    let propagationScore =
        regressionGuard.regressionGuardLevel === "CRITICAL" ? 25 :
        regressionGuard.regressionGuardLevel === "HIGH" ? 20 :
        regressionGuard.regressionGuardLevel === "MEDIUM" ? 15 :
        10;

    let regressionScore =
        (!audit.auditPassed || !test.testPassed) ? 25 : 10;

    let totalScore = 100 - (structuralScore + propagationScore + regressionScore);

    if (featureRegistry) {

        if (featureRegistry.mismatchSeverity === "MAJOR") {
            totalScore = Math.min(totalScore, 30);
        }

        if (featureRegistry.mismatchSeverity === "MINOR") {
            totalScore = totalScore - 10;
        }

        if (featureRegistry.registryConfidenceImpact === "INVALIDATE") {
            totalScore = Math.min(totalScore, 20);
        }
    }

    let decisionHint =
        totalScore <= 30 ? "DANGEROUS" :
        totalScore <= 60 ? "REVIEW_REQUIRED" :
        "SAFE";

    return {
        architecturalScore: totalScore,
        scoreBreakdown: {
            structural: structuralScore,
            propagation: propagationScore,
            regression: regressionScore
        },
        decisionHint
    };
}
