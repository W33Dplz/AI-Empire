export function runScopeDriftDetector(commitIntent, architecturalImpact, regressionGuard) {

    if (!commitIntent || !architecturalImpact || !regressionGuard) {
        throw new Error("commitIntent, architecturalImpact and regressionGuard required");
    }

    let driftDetected = false;
    let driftType = "NONE";
    let driftSeverity = "LOW";
    let explanation = "No drift detected";

    const declared = commitIntent.declaredIntentType;
    const impactType = architecturalImpact.impactType;
    const riskLevel = regressionGuard.regressionGuardLevel;

    if (declared === "UNKNOWN" && impactType === "STRUCTURAL") {
        driftDetected = true;
        driftType = "UNDECLARED_STRUCTURAL_CHANGE";
        driftSeverity = "HIGH";
        explanation = "Structural impact detected but commit intent unknown";
    }

    if (declared === "BUG_FIX" && impactType === "STRUCTURAL") {
        driftDetected = true;
        driftType = "BUGFIX_SCOPE_MISMATCH";
        driftSeverity = "HIGH";
        explanation = "Bug fix declared but structural impact observed";
    }

    if (declared === "REFACTOR" && riskLevel === "CRITICAL") {
        driftDetected = true;
        driftType = "REFACTOR_HIGH_RISK";
        driftSeverity = "MEDIUM";
        explanation = "Refactor declared but critical regression risk detected";
    }

    return {
        driftDetected,
        driftType,
        driftSeverity,
        explanation
    };
}
