export function runDecisionEngine(
    architecturalScore,
    regressionGuard,
    intent,
    baseline,
    scopeDrift,
    featureRegistry
) {

    let overallStatus = "READY";
    let requiresHumanReview = false;

    const blockingReasons = [];
    const warningReasons = [];

    if (architecturalScore.decisionHint === "DANGEROUS") {
        blockingReasons.push("Architectural score dangerous");
    }

    if (regressionGuard.regressionGuardLevel === "CRITICAL") {
        blockingReasons.push("Critical regression guard");
    }

    if (scopeDrift && scopeDrift.driftSeverity === "HIGH") {
        blockingReasons.push("Scope drift detected");
    }

    if (featureRegistry && featureRegistry.registryBlockingIssues.length > 0) {
        blockingReasons.push(...featureRegistry.registryBlockingIssues);
    }

    if (intent.suspiciousPattern) {
        warningReasons.push("Suspicious change pattern detected");
    }

    if (intent.scopeConsistency === "LOW") {
        warningReasons.push("Low scope consistency");
    }

    if (featureRegistry && featureRegistry.registryWarnings.length > 0) {
        warningReasons.push(...featureRegistry.registryWarnings);
    }

    if (blockingReasons.length > 0) {
        overallStatus = "BLOCKED";
        requiresHumanReview = true;
    }
    else if (warningReasons.length > 0) {
        overallStatus = "REVIEW";
        requiresHumanReview = true;
    }

    return {
        overallStatus,
        requiresHumanReview,
        blockingReasons,
        warningReasons,
        decisionConfidence:
            blockingReasons.length > 0 ? "LOW" :
            warningReasons.length > 0 ? "MEDIUM" :
            "HIGH"
    };
}
