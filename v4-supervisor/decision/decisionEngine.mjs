export function runDecisionEngine(
    architecturalScore,
    regressionGuard,
    intent,
    baseline,
    scopeDrift
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

    if (intent.suspiciousPattern) {
        warningReasons.push("Suspicious change pattern detected");
    }

    if (intent.scopeConsistency === "LOW") {
        warningReasons.push("Low scope consistency");
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
