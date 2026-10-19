export function runScopeDriftDetector(
    commitIntent,
    architecturalImpact,
    regressionGuard
) {

    if (!commitIntent || !architecturalImpact) {
        throw new Error("commitIntent and architecturalImpact required");
    }

    const declared = commitIntent.declaredIntentType;
    const impactType = architecturalImpact.impactType;
    const realScope = architecturalImpact.scope;

    let intentClarityLevel = "HIGH";
    if (declared === "UNKNOWN") intentClarityLevel = "LOW";
    if (declared === "REFACTOR") intentClarityLevel = "MEDIUM";

    let intentImpactMismatch = "NONE";
    let scopeMismatchLevel = "NONE";

    // Intent vs impact
    if (declared === "UNKNOWN" && impactType === "STRUCTURAL") {
        intentImpactMismatch = "HIGH";
    }
    else if (declared === "BUG_FIX" && impactType === "STRUCTURAL") {
        intentImpactMismatch = "HIGH";
    }
    else if (declared === "REFACTOR" && impactType === "STRUCTURAL") {
        intentImpactMismatch = "MEDIUM";
    }

    // Scope mismatch
    if (
        commitIntent.declaredScope === "LOCAL" &&
        realScope === "GLOBAL"
    ) {
        scopeMismatchLevel = "HIGH";
    }
    else if (
        commitIntent.declaredScope === "GLOBAL" &&
        realScope === "LOCAL"
    ) {
        scopeMismatchLevel = "LOW";
    }

    function score(level) {
        if (level === "HIGH") return 3;
        if (level === "MEDIUM") return 2;
        if (level === "LOW") return 1;
        return 0;
    }

    const driftScore =
        score(intentImpactMismatch) +
        score(scopeMismatchLevel);

    let driftSeverity = "NONE";

    if (driftScore >= 5) driftSeverity = "HIGH";
    else if (driftScore >= 3) driftSeverity = "MEDIUM";
    else if (driftScore >= 1) driftSeverity = "LOW";

    let driftConfidenceImpact = "NONE";

    if (driftSeverity === "HIGH") driftConfidenceImpact = "INVALIDATE";
    else if (driftSeverity === "MEDIUM") driftConfidenceImpact = "REDUCE";
    else if (driftSeverity === "LOW") driftConfidenceImpact = "MONITOR";

    return {
        intentClarityLevel,
        intentImpactMismatch,
        scopeMismatchLevel,
        driftScore,
        driftSeverity,
        driftConfidenceImpact
    };
}
